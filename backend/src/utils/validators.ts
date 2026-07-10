import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "../types/index.js";
import type { CRMRecord, SkippedRecord } from "../types/index.js";

/**
 * Validate and sanitize a CRM record after AI extraction.
 * Ensures all fields conform to allowed values and formats.
 */
export function validateCRMRecord(record: CRMRecord): CRMRecord {
  return {
    created_at: validateDate(record.created_at),
    name: sanitizeString(record.name),
    email: sanitizeEmail(record.email),
    country_code: sanitizeCountryCode(record.country_code),
    mobile_without_country_code: sanitizePhone(
      record.mobile_without_country_code
    ),
    company: sanitizeString(record.company),
    city: sanitizeString(record.city),
    state: sanitizeString(record.state),
    country: sanitizeString(record.country),
    lead_owner: sanitizeString(record.lead_owner),
    crm_status: validateCRMStatus(record.crm_status),
    crm_note: sanitizeString(record.crm_note),
    data_source: validateDataSource(record.data_source),
    possession_time: sanitizeString(record.possession_time),
    description: sanitizeString(record.description),
  };
}

/**
 * Check if a record should be skipped (no email AND no mobile).
 */
export function shouldSkipRecord(record: CRMRecord): boolean {
  const hasEmail = record.email.trim().length > 0;
  const hasPhone = record.mobile_without_country_code.trim().length > 0;
  return !hasEmail && !hasPhone;
}

/**
 * Validate date string. Returns empty if unparseable.
 */
function validateDate(value: string): string {
  if (!value || value.trim() === "") return "";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    // Format as YYYY-MM-DD HH:mm:ss
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  } catch {
    return "";
  }
}

/**
 * Validate CRM status against allowed values.
 */
function validateCRMStatus(value: string): string {
  if (!value) return "";
  const upper = value.trim().toUpperCase();
  const match = CRM_STATUS_VALUES.find((s) => s === upper);
  return match ?? "";
}

/**
 * Validate data source against allowed values.
 */
function validateDataSource(value: string): string {
  if (!value) return "";
  const lower = value.trim().toLowerCase();
  const match = DATA_SOURCE_VALUES.find((s) => s === lower);
  return match ?? "";
}

/**
 * Sanitize a general string: trim, remove line breaks that could break CSV.
 */
function sanitizeString(value: string | undefined | null): string {
  if (!value) return "";
  return String(value)
    .trim()
    .replace(/\r?\n/g, "\\n")
    .replace(/\r/g, "\\n");
}

/**
 * Sanitize and normalize an email address.
 */
function sanitizeEmail(value: string | undefined | null): string {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}

/**
 * Sanitize a country code: ensure it starts with +.
 */
function sanitizeCountryCode(value: string | undefined | null): string {
  if (!value) return "";
  let code = String(value).trim().replace(/[^0-9+]/g, "");
  if (code && !code.startsWith("+")) {
    code = `+${code}`;
  }
  return code;
}

/**
 * Sanitize a phone number: digits only.
 */
function sanitizePhone(value: string | undefined | null): string {
  if (!value) return "";
  return String(value).trim().replace(/[^0-9]/g, "");
}

/**
 * Create a SkippedRecord entry.
 */
export function createSkippedRecord(
  rowIndex: number,
  originalData: Record<string, string>,
  reason: string
): SkippedRecord {
  return {
    original_row_index: rowIndex,
    original_data: originalData,
    reason,
  };
}
