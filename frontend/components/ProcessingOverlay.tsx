"use client";

import React from "react";

interface ProcessingOverlayProps {
  isVisible: boolean;
  totalRecords: number;
}

export default function ProcessingOverlay({
  isVisible,
  totalRecords,
}: ProcessingOverlayProps) {
  if (!isVisible) return null;

  // ── Batch calculation (unchanged logic) ───────────────────────────────────
  const estimatedBatches = Math.ceil(totalRecords / 10);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Modal card — DESIGN.md: hero-card-dark style but on white canvas */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          margin: "0 16px",
          backgroundColor: "var(--color-canvas)",
          border: "1px solid var(--color-hairline)",
          borderRadius: "var(--radius-lg)",
          padding: "40px 36px",
          textAlign: "center",
        }}
      >
        {/* AI icon — DESIGN.md: surface-dark background, on-dark icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ position: "relative" }}>
            {/* Main icon container */}
            <div
              className="animate-pulse-subtle"
              style={{
                width: 60,
                height: 60,
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                style={{ width: 28, height: 28, color: "var(--color-on-primary)" } as React.CSSProperties}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
            </div>

            {/* Orbiting dots in signature palette (DESIGN.md: coral, forest, mustard) */}
            <div
              className="animate-spin-slow"
              style={{ position: "absolute", inset: -12 }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-sig-coral)",
                }}
              />
            </div>
            <div
              className="animate-spin-slow"
              style={{ position: "absolute", inset: -12, animationDelay: "1s" }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-sig-mustard)",
                }}
              />
            </div>
            <div
              className="animate-spin-slow"
              style={{ position: "absolute", inset: -12, animationDelay: "2s" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  transform: "translateY(-50%)",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: "var(--color-sig-mint)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Heading — DESIGN.md: title-lg */}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 400,
            lineHeight: 1.35,
            color: "var(--color-ink)",
            fontFamily: "var(--font-haas)",
            marginBottom: 8,
          }}
        >
          AI is extracting CRM data
        </h3>

        {/* Body copy — DESIGN.md: body-md */}
        <p style={{ fontSize: 14, color: "var(--color-body)", marginBottom: 28 }}>
          Analyzing {totalRecords} records in ~{estimatedBatches}{" "}
          {estimatedBatches === 1 ? "batch" : "batches"}
        </p>

        {/* Indeterminate progress bar — surface-strong track, primary fill */}
        <div
          style={{
            height: 2,
            width: "100%",
            backgroundColor: "var(--color-surface-strong)",
            borderRadius: "var(--radius-pill)",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <div
            className="animate-indeterminate"
            style={{
              height: "100%",
              width: "33%",
              borderRadius: "var(--radius-pill)",
              backgroundColor: "var(--color-primary)",
            }}
          />
        </div>

        <p style={{ fontSize: 13, color: "var(--color-muted)" }}>
          This may take a moment depending on the number of records
        </p>
      </div>
    </div>
  );
}
