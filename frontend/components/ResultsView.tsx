"use client";

import React, { useState, useMemo } from "react";
import DataTable from "./DataTable";
import type { CRMRecord, SkippedRecord, ProcessingStats } from "@/lib/types";

interface ResultsViewProps {
  successful: CRMRecord[];
  skipped: SkippedRecord[];
  stats: ProcessingStats;
}

// ── Constants (unchanged) ────────────────────────────────────────────────────
const CRM_HEADERS = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description",
];

const SKIPPED_DISPLAY_HEADERS = ["Row #", "Reason", "Original Data"];

type Tab = "successful" | "skipped";

export default function ResultsView({
  successful,
  skipped,
  stats,
}: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("successful");

  // ── Calculations (unchanged logic) ────────────────────────────────────────
  const successRate =
    stats.total_records > 0
      ? Math.round((stats.successfully_parsed / stats.total_records) * 100)
      : 0;

  const successRows: Record<string, string>[] = useMemo(
    () =>
      successful.map((record) => {
        const row: Record<string, string> = {};
        for (const key of CRM_HEADERS) {
          row[key] = record[key as keyof CRMRecord] ?? "";
        }
        return row;
      }),
    [successful]
  );

  const skippedRows: Record<string, string>[] = useMemo(
    () =>
      skipped.map((record) => ({
        "Row #": String(record.original_row_index + 1),
        Reason: record.reason,
        "Original Data": Object.entries(record.original_data)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | "),
      })),
    [skipped]
  );

  // ── CSV download (unchanged logic) ────────────────────────────────────────
  const handleDownloadCSV = () => {
    if (successful.length === 0) return;
    const csvHeader = CRM_HEADERS.join(",");
    const csvRows = successful.map((record) =>
      CRM_HEADERS.map((key) => {
        const value = record[key as keyof CRMRecord] ?? "";
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    );
    const csv = [csvHeader, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `groweasy_crm_import_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Stats cards — DESIGN.md: demo-grid-card on canvas + signature surfaces */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {/* Total Records */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-hairline)",
            backgroundColor: "var(--color-canvas)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              fontFamily: "var(--font-haas)",
              marginBottom: 6,
            }}
          >
            Total Records
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "var(--color-ink)",
              fontFamily: "var(--font-haas)",
              lineHeight: 1.1,
            }}
          >
            {stats.total_records}
          </p>
        </div>

        {/* Imported — signature-forest accent */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-success-border)",
            backgroundColor: "color-mix(in srgb, var(--color-success) 7%, var(--color-canvas))",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-success)",
              fontFamily: "var(--font-haas)",
              marginBottom: 6,
              opacity: 0.75,
            }}
          >
            Imported
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "var(--color-success)",
              fontFamily: "var(--font-haas)",
              lineHeight: 1.1,
            }}
          >
            {stats.successfully_parsed}
          </p>
        </div>

        {/* Skipped — signature-mustard accent */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-sig-mustard)",
            backgroundColor: "color-mix(in srgb, var(--color-sig-mustard) 10%, var(--color-canvas))",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-sig-mustard)",
              fontFamily: "var(--font-haas)",
              marginBottom: 6,
              opacity: 0.85,
            }}
          >
            Skipped
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "var(--color-sig-mustard)",
              fontFamily: "var(--font-haas)",
              lineHeight: 1.1,
            }}
          >
            {stats.skipped}
          </p>
        </div>

        {/* Success Rate — link blue */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-info-border)",
            backgroundColor: "color-mix(in srgb, var(--color-info) 7%, var(--color-canvas))",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-info)",
              fontFamily: "var(--font-haas)",
              marginBottom: 6,
              opacity: 0.75,
            }}
          >
            Success Rate
          </p>
          <p
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "var(--color-info)",
              fontFamily: "var(--font-haas)",
              lineHeight: 1.1,
            }}
          >
            {successRate}%
          </p>
        </div>
      </div>

      {/* ── Processing info — caption typography ─────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <span
          style={{
            fontSize: 12,
            color: "var(--color-muted)",
            fontFamily: "var(--font-haas)",
          }}
        >
          ⏱ {(stats.processing_time_ms / 1000).toFixed(1)}s processing time
        </span>
        <span
          style={{
            fontSize: 12,
            color: "var(--color-muted)",
            fontFamily: "var(--font-haas)",
          }}
        >
          📦 {stats.batches_processed} batches processed
        </span>
      </div>

      {/* ── Tabs — DESIGN.md: feature-card-tabbed aesthetic ──────────────── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-hairline)",
          backgroundColor: "var(--color-surface-soft)",
        }}
      >
        {/* Imported tab */}
        <button
          onClick={() => setActiveTab("successful")}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "var(--radius-sm)",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "var(--font-haas)",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s ease, color 0.2s ease",
            backgroundColor:
              activeTab === "successful" ? "var(--color-canvas)" : "transparent",
            color:
              activeTab === "successful" ? "var(--color-ink)" : "var(--color-muted)",
            boxShadow:
              activeTab === "successful"
                ? "0 1px 2px rgba(24,29,38,0.08)"
                : "none",
          }}
        >
          ✓ Imported ({successful.length})
        </button>

        {/* Skipped tab */}
        <button
          onClick={() => setActiveTab("skipped")}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "var(--radius-sm)",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "var(--font-haas)",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s ease, color 0.2s ease",
            backgroundColor:
              activeTab === "skipped" ? "var(--color-canvas)" : "transparent",
            color:
              activeTab === "skipped" ? "var(--color-ink)" : "var(--color-muted)",
            boxShadow:
              activeTab === "skipped"
                ? "0 1px 2px rgba(24,29,38,0.08)"
                : "none",
          }}
        >
          ⚠ Skipped ({skipped.length})
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {activeTab === "successful" ? (
        <DataTable
          headers={CRM_HEADERS}
          rows={successRows}
          maxHeight="500px"
          virtualized={successRows.length > 100}
          emptyMessage="No records were successfully imported"
        />
      ) : (
        <DataTable
          headers={SKIPPED_DISPLAY_HEADERS}
          rows={skippedRows}
          maxHeight="500px"
          emptyMessage="No records were skipped — all records imported successfully!"
        />
      )}

      {/* ── Download button — DESIGN.md: button-primary ───────────────────── */}
      {successful.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 font-medium transition-opacity active:opacity-70"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-on-primary)",
              borderRadius: "var(--radius-lg)",
              padding: "14px 28px",
              fontSize: 15,
              fontFamily: "var(--font-haas)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              style={{ width: 16, height: 16 }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download CRM CSV
          </button>
        </div>
      )}
    </div>
  );
}
