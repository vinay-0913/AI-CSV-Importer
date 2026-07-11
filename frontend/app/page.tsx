"use client";

import React, { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import DataTable from "@/components/DataTable";
import StepIndicator from "@/components/StepIndicator";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import ResultsView from "@/components/ResultsView";
import ThemeToggle from "@/components/ThemeToggle";
import { uploadCSV, processRecords } from "@/lib/api";
import type {
  WizardStep,
  CSVParseResult,
  ProcessingResult,
} from "@/lib/types";

// ─── Icons ────────────────────────────────────────────────────────────────────

function SparkleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
    </svg>
  );
}

function AlertIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function AIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  // ── State (unchanged business logic) ──────────────────────────────────────
  const [step, setStep] = useState<WizardStep>("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<CSVParseResult | null>(null);
  const [results, setResults] = useState<ProcessingResult | null>(null);

  // ── Handlers (unchanged business logic) ───────────────────────────────────
  const handleFileSelected = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const response = await uploadCSV(file);
      if (response.success && response.data) {
        setCsvData(response.data);
        setStep("preview");
      } else {
        setError(response.error ?? "Failed to parse CSV file");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (!csvData) return;
    setStep("processing");
    setIsProcessing(true);
    setError(null);
    try {
      const response = await processRecords(csvData.rows);
      if (response.success && response.data) {
        setResults(response.data);
        setStep("results");
      } else {
        setError(response.error ?? "AI processing failed");
        setStep("preview");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
      setStep("preview");
    } finally {
      setIsProcessing(false);
    }
  }, [csvData]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setCsvData(null);
    setResults(null);
    setError(null);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-canvas)" }}
    >
      {/* ── Top Nav (DESIGN.md: top-nav — 64px white bar) ─────────────────── */}
      <header
        className="sticky top-0 z-40"
        style={{
          height: 64,
          backgroundColor: "var(--color-canvas)",
          borderBottom: "1px solid var(--color-hairline)",
        }}
      >
        <div
          className="mx-auto flex h-full items-center justify-between px-6"
          style={{ maxWidth: 1280 }}
        >
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center"
              style={{
                backgroundColor: "var(--color-primary)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <SparkleIcon className="h-4 w-4" style={{ color: "var(--color-on-primary)" } as React.CSSProperties} />
            </div>
            <div>
              <span
                className="block text-base font-medium tracking-tight"
                style={{ color: "var(--color-ink)", fontFamily: "var(--font-haas)" }}
              >
                GrowEasy
              </span>
              <span
                className="block text-[10px] font-medium uppercase tracking-widest"
                style={{ color: "var(--color-muted)" }}
              >
                AI CSV Importer
              </span>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {step !== "upload" && (
              /* button-secondary per DESIGN.md */
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm font-medium transition-opacity"
                style={{
                  backgroundColor: "var(--color-canvas)",
                  color: "var(--color-ink)",
                  border: "1px solid var(--color-hairline)",
                  borderRadius: "var(--radius-lg)",
                  padding: "8px 16px",
                  fontFamily: "var(--font-haas)",
                }}
              >
                <ResetIcon className="h-3.5 w-3.5" />
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main
        className="mx-auto px-6"
        style={{ maxWidth: 1280, paddingTop: 64, paddingBottom: 96 }}
      >
        {/* Step Indicator */}
        <div style={{ marginBottom: 48 }}>
          <StepIndicator currentStep={step} />
        </div>

        {/* Error Banner */}
        {error && (
          <div
            className="animate-fadeIn flex items-start gap-3"
            style={{
              marginBottom: 32,
              padding: "14px 18px",
              backgroundColor: "color-mix(in srgb, var(--color-sig-coral) 8%, transparent)",
              border: "1px solid var(--color-error-border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <AlertIcon
              className="h-4 w-4 shrink-0 mt-0.5"
              style={{ color: "var(--color-error)" } as React.CSSProperties}
            />
            <div className="flex-1">
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-error)" }}
              >
                Error
              </p>
              <p
                className="mt-0.5 text-sm"
                style={{ color: "var(--color-body)" }}
              >
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="shrink-0 transition-opacity"
              style={{ color: "var(--color-muted)" }}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Step 1: Upload ──────────────────────────────────────────────── */}
        {step === "upload" && (
          <div className="animate-fadeIn">
            {/* Hero band — white canvas, generous whitespace (DESIGN.md: hero-band) */}
            <div
              className="text-center"
              style={{ paddingBottom: 48 }}
            >
              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-haas)",
                  marginBottom: 12,
                }}
              >
                Upload your CSV file
              </h2>
              <p
                className="mx-auto"
                style={{
                  fontSize: 14,
                  color: "var(--color-body)",
                  maxWidth: 480,
                  lineHeight: 1.6,
                }}
              >
                Upload any CSV format — Facebook leads, Google Ads exports,
                CRM data, or custom spreadsheets. Our AI will handle the mapping.
              </p>
            </div>
            <FileUpload onFileSelected={handleFileSelected} isLoading={isUploading} />
          </div>
        )}

        {/* ── Step 2: Preview ─────────────────────────────────────────────── */}
        {step === "preview" && csvData && (
          <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  style={{
                    fontSize: 32,
                    fontWeight: 400,
                    lineHeight: 1.2,
                    color: "var(--color-ink)",
                    fontFamily: "var(--font-haas)",
                    marginBottom: 6,
                  }}
                >
                  Preview your data
                </h2>
                <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
                  {csvData.total_rows} rows × {csvData.headers.length} columns detected.
                  Review before importing.
                </p>
              </div>

              {/* button-primary per DESIGN.md — near-black, 12px radius */}
              <button
                onClick={handleConfirmImport}
                className="flex shrink-0 items-center gap-2 font-medium transition-opacity active:opacity-70"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-on-primary)",
                  borderRadius: "var(--radius-lg)",
                  padding: "14px 24px",
                  fontSize: 15,
                  fontFamily: "var(--font-haas)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <AIIcon className="h-4 w-4" />
                Confirm &amp; Import with AI
              </button>
            </div>

            <DataTable
              headers={csvData.headers}
              rows={csvData.rows}
              maxHeight="540px"
              virtualized={csvData.rows.length > 100}
            />
          </div>
        )}

        {/* ── Step 3: Processing placeholder ─────────────────────────────── */}
        {step === "processing" && csvData && (
          <div
            className="animate-fadeIn flex flex-col items-center justify-center"
            style={{ paddingTop: 80, paddingBottom: 80 }}
          >
            <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
              Processing your data…
            </p>
          </div>
        )}

        {/* ── Step 4: Results ─────────────────────────────────────────────── */}
        {step === "results" && results && (
          <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-haas)",
                  marginBottom: 6,
                }}
              >
                Import Results
              </h2>
              <p style={{ fontSize: 14, color: "var(--color-muted)" }}>
                AI has mapped your data to GrowEasy CRM format
              </p>
            </div>

            <ResultsView
              successful={results.successful}
              skipped={results.skipped}
              stats={results.stats}
            />
          </div>
        )}
      </main>

      {/* ── Processing Overlay ──────────────────────────────────────────────── */}
      <ProcessingOverlay
        isVisible={isProcessing}
        totalRecords={csvData?.total_rows ?? 0}
      />

      {/* ── Footer (DESIGN.md: footer — canvas surface, body-md, muted) ────── */}
      <footer
        style={{
          borderTop: "1px solid var(--color-hairline)",
          backgroundColor: "var(--color-canvas)",
        }}
      >
        <div
          className="mx-auto px-6"
          style={{ maxWidth: 1280, paddingTop: 24, paddingBottom: 24 }}
        >
          <p
            className="text-center"
            style={{ fontSize: 13, color: "var(--color-muted)" }}
          >
            GrowEasy AI CSV Importer · Powered by Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}
