import type {
  APIResponse,
  CSVParseResult,
  ProcessingResult,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/**
 * Upload a CSV file to the backend for parsing and preview.
 * No AI processing happens at this stage.
 */
export async function uploadCSV(
  file: File
): Promise<APIResponse<CSVParseResult>> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/csv/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.error ?? `Upload failed with status ${response.status}`
    );
  }

  return response.json();
}

/**
 * Send parsed records to the backend for AI-powered CRM extraction.
 */
export async function processRecords(
  records: Record<string, string>[]
): Promise<APIResponse<ProcessingResult>> {
  const response = await fetch(`${API_BASE_URL}/csv/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ records }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.error ?? `Processing failed with status ${response.status}`
    );
  }

  return response.json();
}

/**
 * Check if the backend API is healthy.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
