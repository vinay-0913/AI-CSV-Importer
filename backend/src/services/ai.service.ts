import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT, buildBatchPrompt } from "../utils/prompt.js";
import {
  validateCRMRecord,
  shouldSkipRecord,
  createSkippedRecord,
} from "../utils/validators.js";
import type {
  CRMRecord,
  SkippedRecord,
  ProcessingResult,
  ProcessingStats,
} from "../types/index.js";

const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;

/**
 * Process CSV records through Gemini AI in batches.
 *
 * Splits records into batches of BATCH_SIZE, sends each to Gemini,
 * parses the response, validates the output, and aggregates results.
 * Implements exponential backoff retry for transient failures.
 */
export async function processRecordsWithAI(
  records: Record<string, string>[],
  onBatchComplete?: (batchIndex: number, totalBatches: number) => void
): Promise<ProcessingResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not set. Please add it to your .env file."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      temperature: 0.1, // Low temperature for deterministic extraction
      responseMimeType: "application/json",
    },
  });

  const startTime = Date.now();
  const allSuccessful: CRMRecord[] = [];
  const allSkipped: SkippedRecord[] = [];

  // Split into batches
  const batches: Record<string, string>[][] = [];
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    batches.push(records.slice(i, i + BATCH_SIZE));
  }

  console.log(
    `Processing ${records.length} records in ${batches.length} batches...`
  );

  // Process each batch
  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx]!;
    const globalStartIndex = batchIdx * BATCH_SIZE;

    console.log(
      `  Batch ${batchIdx + 1}/${batches.length} (${batch.length} records)...`
    );

    try {
      const { successful, skipped } = await processBatchWithRetry(
        model,
        batch,
        globalStartIndex
      );

      allSuccessful.push(...successful);
      allSkipped.push(...skipped);
    } catch (error) {
      // If all retries fail for a batch, skip all its records
      console.error(
        `  Batch ${batchIdx + 1} failed after ${MAX_RETRIES} retries:`,
        error
      );
      for (let i = 0; i < batch.length; i++) {
        allSkipped.push(
          createSkippedRecord(
            globalStartIndex + i,
            batch[i]!,
            `AI processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    }

    // Notify progress
    onBatchComplete?.(batchIdx + 1, batches.length);
  }

  const stats: ProcessingStats = {
    total_records: records.length,
    successfully_parsed: allSuccessful.length,
    skipped: allSkipped.length,
    batches_processed: batches.length,
    processing_time_ms: Date.now() - startTime,
  };

  console.log(
    `Processing complete: ${stats.successfully_parsed} successful, ${stats.skipped} skipped, ${stats.processing_time_ms}ms`
  );

  return {
    successful: allSuccessful,
    skipped: allSkipped,
    stats,
  };
}

/**
 * Process a single batch with retry logic.
 * Uses exponential backoff: 1s, 2s, 4s.
 */
async function processBatchWithRetry(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  batch: Record<string, string>[],
  globalStartIndex: number
): Promise<{ successful: CRMRecord[]; skipped: SkippedRecord[] }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await processSingleBatch(model, batch, globalStartIndex);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `    Attempt ${attempt + 1}/${MAX_RETRIES} failed: ${lastError.message}`
      );

      if (attempt < MAX_RETRIES - 1) {
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
        console.log(`    Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error("All retry attempts failed");
}

/**
 * Process a single batch through Gemini AI.
 */
async function processSingleBatch(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  batch: Record<string, string>[],
  globalStartIndex: number
): Promise<{ successful: CRMRecord[]; skipped: SkippedRecord[] }> {
  const userPrompt = buildBatchPrompt(batch, globalStartIndex);

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: userPrompt },
  ]);

  const responseText = result.response.text();

  // Parse the JSON response
  let parsed: {
    records?: Partial<CRMRecord>[];
    skipped?: { original_row_index: number; reason: string }[];
  };

  try {
    parsed = JSON.parse(responseText);
  } catch {
    // Try to extract JSON from the response if it's wrapped in markdown
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error(`Failed to parse AI response as JSON: ${responseText.substring(0, 200)}`);
    }
  }

  const successful: CRMRecord[] = [];
  const skipped: SkippedRecord[] = [];

  // Process AI-returned records
  if (parsed.records && Array.isArray(parsed.records)) {
    for (const rawRecord of parsed.records) {
      // Ensure all fields exist with defaults
      const record: CRMRecord = {
        created_at: rawRecord.created_at ?? "",
        name: rawRecord.name ?? "",
        email: rawRecord.email ?? "",
        country_code: rawRecord.country_code ?? "",
        mobile_without_country_code:
          rawRecord.mobile_without_country_code ?? "",
        company: rawRecord.company ?? "",
        city: rawRecord.city ?? "",
        state: rawRecord.state ?? "",
        country: rawRecord.country ?? "",
        lead_owner: rawRecord.lead_owner ?? "",
        crm_status: rawRecord.crm_status ?? "",
        crm_note: rawRecord.crm_note ?? "",
        data_source: rawRecord.data_source ?? "",
        possession_time: rawRecord.possession_time ?? "",
        description: rawRecord.description ?? "",
      };

      // Validate and sanitize
      const validated = validateCRMRecord(record);

      // Double-check skip rule after validation
      if (shouldSkipRecord(validated)) {
        skipped.push(
          createSkippedRecord(
            globalStartIndex + successful.length + skipped.length,
            {}, // We don't have the original data mapped back easily
            "No email or mobile number found after validation"
          )
        );
      } else {
        successful.push(validated);
      }
    }
  }

  // Process AI-identified skipped records
  if (parsed.skipped && Array.isArray(parsed.skipped)) {
    for (const skip of parsed.skipped) {
      const absoluteIndex = globalStartIndex + (skip.original_row_index ?? 0);
      const originalData = batch[skip.original_row_index] ?? {};
      skipped.push(
        createSkippedRecord(absoluteIndex, originalData, skip.reason)
      );
    }
  }

  return { successful, skipped };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
