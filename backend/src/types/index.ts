// ─── GrowEasy CRM Types ─────────────────────────────────────────────────────

/**
 * Allowed CRM status values.
 */
export const CRM_STATUS_VALUES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export type CRMStatus = (typeof CRM_STATUS_VALUES)[number];

/**
 * Allowed data source values.
 */
export const DATA_SOURCE_VALUES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;

export type DataSource = (typeof DATA_SOURCE_VALUES)[number];

/**
 * A single CRM record in the GrowEasy format.
 */
export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

/**
 * A record that was skipped during processing, with a reason.
 */
export interface SkippedRecord {
  original_row_index: number;
  original_data: Record<string, string>;
  reason: string;
}

/**
 * Processing statistics.
 */
export interface ProcessingStats {
  total_records: number;
  successfully_parsed: number;
  skipped: number;
  batches_processed: number;
  processing_time_ms: number;
}

/**
 * Result of processing all batches.
 */
export interface ProcessingResult {
  successful: CRMRecord[];
  skipped: SkippedRecord[];
  stats: ProcessingStats;
}

/**
 * Result of a single batch AI call.
 */
export interface BatchResult {
  successful: CRMRecord[];
  skipped: SkippedRecord[];
}

/**
 * Standard API response wrapper.
 */
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Uploaded CSV parse result.
 */
export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
  total_rows: number;
}
