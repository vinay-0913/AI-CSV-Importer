"use client";

import React from "react";
import type { WizardStep } from "@/lib/types";

interface StepIndicatorProps {
  currentStep: WizardStep;
}

// ─── Step definitions (unchanged) ────────────────────────────────────────────

const steps: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
  {
    key: "upload",
    label: "Upload CSV",
    icon: (
      <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    key: "preview",
    label: "Preview Data",
    icon: (
      <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5" />
      </svg>
    ),
  },
  {
    key: "processing",
    label: "AI Processing",
    icon: (
      <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    key: "results",
    label: "Results",
    icon: (
      <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const stepOrder: WizardStep[] = ["upload", "preview", "processing", "results"];

// ── Status helper (unchanged logic) ──────────────────────────────────────────
function getStepStatus(
  step: WizardStep,
  currentStep: WizardStep
): "completed" | "current" | "upcoming" {
  const currentIdx = stepOrder.indexOf(currentStep);
  const stepIdx = stepOrder.indexOf(step);
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

// ─── Check icon ───────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {steps.map((step, idx) => {
          const status = getStepStatus(step.key, currentStep);

          /* ── Circle colors per DESIGN.md ─────────────────────────── */
          const circleBg =
            status === "completed"
              ? "var(--color-success)"
              : status === "current"
                ? "var(--color-primary)"
                : "var(--color-surface-strong)";

          const circleColor =
            status === "completed" || status === "current"
              ? "var(--color-on-primary)"
              : "var(--color-muted)";

          const circleOutline =
            status === "current"
              ? `0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent)`
              : "none";

          const labelColor =
            status === "completed"
              ? "var(--color-success)"
              : status === "current"
                ? "var(--color-ink)"
                : "var(--color-muted)";

          /* ── Connector fill ──────────────────────────────────────── */
          const connectorFilled =
            idx < steps.length - 1 &&
            getStepStatus(steps[idx + 1]!.key, currentStep) !== "upcoming";

          return (
            <React.Fragment key={step.key}>
              {/* Step bubble + label */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: circleBg,
                    color: circleColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: circleOutline,
                    transition: "background-color 0.4s ease, box-shadow 0.4s ease",
                    flexShrink: 0,
                  }}
                >
                  {status === "completed" ? <CheckIcon /> : step.icon}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    color: labelColor,
                    fontFamily: "var(--font-haas)",
                    whiteSpace: "nowrap",
                    transition: "color 0.3s ease",
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {idx < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    marginBottom: 28,
                    marginLeft: 8,
                    marginRight: 8,
                    backgroundColor: "var(--color-hairline)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "var(--color-success)",
                      transform: connectorFilled ? "scaleX(1)" : "scaleX(0)",
                      transformOrigin: "left",
                      transition: "transform 0.5s ease",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
