import { Router } from "express";
import multer from "multer";
import { parseCSVBuffer } from "../services/csv.service.js";
import { processRecordsWithAI } from "../services/ai.service.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import type { APIResponse, CSVParseResult, ProcessingResult } from "../types/index.js";

const router = Router();

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    // Accept CSV and text files
    const allowedMimes = [
      "text/csv",
      "text/plain",
      "application/csv",
      "application/vnd.ms-excel",
      "text/x-csv",
      "text/comma-separated-values",
    ];

    if (
      allowedMimes.includes(file.mimetype) ||
      file.originalname.endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new AppError("Only CSV files are allowed", 400));
    }
  },
});

/**
 * POST /api/csv/upload
 *
 * Upload and parse a CSV file. Returns the parsed headers and rows
 * for preview in the frontend. No AI processing happens here.
 */
router.post(
  "/upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    console.log(
      `Received CSV file: ${req.file.originalname} (${req.file.size} bytes)`
    );

    const result: CSVParseResult = parseCSVBuffer(req.file.buffer);

    if (result.rows.length === 0) {
      throw new AppError(
        "The CSV file is empty or could not be parsed",
        400
      );
    }

    const response: APIResponse<CSVParseResult> = {
      success: true,
      data: result,
      message: `Successfully parsed ${result.total_rows} rows with ${result.headers.length} columns`,
    };

    res.json(response);
  })
);

/**
 * POST /api/csv/process
 *
 * Accept parsed CSV records and process them through Gemini AI
 * to extract CRM fields. Returns structured CRM records.
 */
router.post(
  "/process",
  asyncHandler(async (req, res) => {
    const { records } = req.body as { records?: Record<string, string>[] };

    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new AppError("No records provided for processing", 400);
    }

    console.log(`Processing ${records.length} records through AI...`);

    const result: ProcessingResult = await processRecordsWithAI(records);

    const response: APIResponse<ProcessingResult> = {
      success: true,
      data: result,
      message: `Processed ${result.stats.total_records} records: ${result.stats.successfully_parsed} successful, ${result.stats.skipped} skipped`,
    };

    res.json(response);
  })
);

export default router;
