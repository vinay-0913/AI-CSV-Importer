// ─── GrowEasy CRM Types (Frontend) ──────────────────────────────────────────

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

export interface SkippedRecord {
  original_row_index: number;
  original_data: Record<string, string>;
  reason: string;
}

export interface ProcessingStats {
  total_records: number;
  successfully_parsed: number;
  skipped: number;
  batches_processed: number;
  processing_time_ms: number;
}

export interface ProcessingResult {
  successful: CRMRecord[];
  skipped: SkippedRecord[];
  stats: ProcessingStats;
}

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
  total_rows: number;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type WizardStep = "upload" | "preview" | "processing" | "results";
