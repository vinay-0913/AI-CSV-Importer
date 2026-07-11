"use client";

import React, { useCallback, useState, useRef } from "react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({
  onFileSelected,
  isLoading,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  // ── Validation (unchanged logic) ──────────────────────────────────────────
  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a valid CSV file (.csv)");
        return false;
      }
      if (file.size > MAX_SIZE) {
        setError(
          `File size exceeds 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)`
        );
        return false;
      }
      if (file.size === 0) {
        setError("The file is empty");
        return false;
      }
      return true;
    },
    [MAX_SIZE]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setSelectedFile(file);
        setError(null);
        onFileSelected(file);
      }
    },
    [validateFile, onFileSelected]
  );

  // ── Drag & drop handlers (unchanged logic) ────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) handleFile(files[0]!);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFile(files[0]!);
    },
    [handleFile]
  );

  const handleClick = () => fileInputRef.current?.click();

  // ── Derived styles ────────────────────────────────────────────────────────
  const dropZoneBorderColor = isDragOver
    ? "var(--color-primary)"
    : selectedFile
      ? "var(--color-success-border)"
      : "var(--color-hairline)";

  const dropZoneBg = isDragOver
    ? "color-mix(in srgb, var(--color-sig-cream) 40%, var(--color-canvas))"
    : selectedFile
      ? "color-mix(in srgb, var(--color-success-border) 6%, var(--color-canvas))"
      : "var(--color-canvas)";

  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
      {/* ── Drop Zone (DESIGN.md: text-input + card geometry) ─────────────── */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        aria-label="Upload CSV file"
        style={{
          position: "relative",
          cursor: isLoading ? "default" : "pointer",
          borderRadius: "var(--radius-lg)",
          border: `2px dashed ${dropZoneBorderColor}`,
          backgroundColor: dropZoneBg,
          padding: "56px 40px",
          textAlign: "center",
          transition: "border-color 0.2s ease, background-color 0.2s ease",
          outline: "none",
        }}
      >
        {/* Upload icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            margin: "0 auto 20px",
            borderRadius: "var(--radius-md)",
            backgroundColor: selectedFile
              ? "color-mix(in srgb, var(--color-success) 12%, var(--color-canvas))"
              : isDragOver
                ? "color-mix(in srgb, var(--color-primary) 10%, var(--color-canvas))"
                : "var(--color-surface-soft)",
            border: "1px solid var(--color-hairline)",
            transition: "background-color 0.2s ease",
          }}
        >
          {selectedFile ? (
            /* Checkmark */
            <svg
              style={{ width: 24, height: 24, color: "var(--color-success)" } as React.CSSProperties}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            /* Upload arrow */
            <svg
              style={{ width: 24, height: 24, color: "var(--color-muted)" } as React.CSSProperties}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
        </div>

        {/* Primary text */}
        {selectedFile ? (
          <div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "var(--color-success)",
                fontFamily: "var(--font-haas)",
                marginBottom: 6,
              }}
            >
              {selectedFile.name}
            </p>
            <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
              {(selectedFile.size / 1024).toFixed(1)} KB · Click or drop another file to replace
            </p>
          </div>
        ) : (
          <>
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: isDragOver ? "var(--color-ink)" : "var(--color-body)",
                fontFamily: "var(--font-haas)",
                marginBottom: 6,
              }}
            >
              {isDragOver ? "Drop your CSV here" : "Drag & drop your CSV file"}
            </p>
            <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 20 }}>
              or click to browse · Max 10 MB
            </p>

            {/* Supported format pills (DESIGN.md: cream-callout-card surfaces) */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {["Facebook Leads", "Google Ads", "Excel CSV", "CRM Export", "Custom"].map((fmt) => (
                <span
                  key={fmt}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: "var(--color-surface-soft)",
                    border: "1px solid var(--color-hairline)",
                    fontSize: 12,
                    color: "var(--color-muted)",
                    fontFamily: "var(--font-haas)",
                  }}
                >
                  {fmt}
                </span>
              ))}
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          style={{ display: "none" }}
          disabled={isLoading}
        />
      </div>

      {/* ── Loading state ──────────────────────────────────────────────────── */}
      {isLoading && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "2px solid var(--color-primary)",
              borderTopColor: "transparent",
              animation: "spin 0.75s linear infinite",
            }}
          />
          <span style={{ fontSize: 13, color: "var(--color-muted)" }}>
            Parsing CSV file…
          </span>
        </div>
      )}

      {/* ── Error message ──────────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "color-mix(in srgb, var(--color-sig-coral) 8%, var(--color-canvas))",
            border: "1px solid var(--color-error-border)",
            fontSize: 13,
            color: "var(--color-error)",
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <svg
            style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1, color: "var(--color-error)" } as React.CSSProperties}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
