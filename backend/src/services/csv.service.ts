import { parse } from "csv-parse/sync";
import type { CSVParseResult } from "../types/index.js";

/**
 * Parse a CSV buffer into structured records.
 *
 * Handles various CSV formats: different delimiters, quoted fields,
 * BOM markers, and inconsistent line endings.
 */
export function parseCSVBuffer(buffer: Buffer): CSVParseResult {
  // Remove BOM if present
  let content = buffer.toString("utf-8");
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  // Auto-detect delimiter by checking the first line
  const firstLine = content.split(/\r?\n/)[0] ?? "";
  const delimiter = detectDelimiter(firstLine);

  const records: Record<string, string>[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter,
    relax_column_count: true,
    relax_quotes: true,
    cast: false,
  });

  if (records.length === 0) {
    return { headers: [], rows: [], total_rows: 0 };
  }

  // Extract headers from the first record's keys
  const headers = Object.keys(records[0]!);

  // Normalize all values to strings
  const rows = records.map((record) => {
    const normalized: Record<string, string> = {};
    for (const key of headers) {
      normalized[key] = String(record[key] ?? "").trim();
    }
    return normalized;
  });

  return {
    headers,
    rows,
    total_rows: rows.length,
  };
}

/**
 * Detect the most likely delimiter for a CSV line.
 * Checks for tab, semicolon, pipe, and falls back to comma.
 */
function detectDelimiter(firstLine: string): string {
  const candidates: { char: string; count: number }[] = [
    { char: "\t", count: (firstLine.match(/\t/g) ?? []).length },
    { char: ";", count: (firstLine.match(/;/g) ?? []).length },
    { char: "|", count: (firstLine.match(/\|/g) ?? []).length },
    { char: ",", count: (firstLine.match(/,/g) ?? []).length },
  ];

  // Pick the delimiter with the most occurrences (at least 1)
  const best = candidates.reduce((a, b) => (b.count > a.count ? b : a));
  return best.count > 0 ? best.char : ",";
}
