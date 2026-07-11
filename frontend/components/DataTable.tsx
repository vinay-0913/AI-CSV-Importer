"use client";

import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";

interface DataTableProps {
  headers: string[];
  rows: Record<string, string>[];
  maxHeight?: string;
  emptyMessage?: string;
  /** If true, use virtualized rendering for large datasets */
  virtualized?: boolean;
}

const ROW_HEIGHT = 40;
const OVERSCAN = 5;

export default function DataTable({
  headers,
  rows,
  maxHeight = "500px",
  emptyMessage = "No data to display",
  virtualized = false,
}: DataTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(500);

  // ── Virtualization observers (unchanged logic) ─────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // ── Virtualization calculations (unchanged logic) ──────────────────────
  const { visibleRows, startIndex, totalHeight, offsetTop } = useMemo(() => {
    if (!virtualized || rows.length < 100) {
      return { visibleRows: rows, startIndex: 0, totalHeight: undefined, offsetTop: 0 };
    }
    const total = rows.length * ROW_HEIGHT;
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT) + 2 * OVERSCAN;
    const end = Math.min(rows.length, start + visibleCount);
    return {
      visibleRows: rows.slice(start, end),
      startIndex: start,
      totalHeight: total,
      offsetTop: start * ROW_HEIGHT,
    };
  }, [rows, virtualized, scrollTop, containerHeight]);

  // ── Empty state ────────────────────────────────────────────────────────
  if (rows.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-hairline)",
          backgroundColor: "var(--color-surface-soft)",
        }}
      >
        <p style={{ fontSize: 14, color: "var(--color-muted)" }}>{emptyMessage}</p>
      </div>
    );
  }

  // ── Table header row ───────────────────────────────────────────────────
  const theadRow = (
    <tr>
      <th
        style={{
          backgroundColor: "var(--color-surface-soft)",
          padding: "10px 16px",
          textAlign: "left",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-muted)",
          borderBottom: "1px solid var(--color-hairline)",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-haas)",
        }}
      >
        #
      </th>
      {headers.map((header) => (
        <th
          key={header}
          style={{
            backgroundColor: "var(--color-surface-soft)",
            padding: "10px 16px",
            textAlign: "left",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-muted)",
            borderBottom: "1px solid var(--color-hairline)",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-haas)",
          }}
        >
          {header}
        </th>
      ))}
    </tr>
  );

  // ── Table body row ─────────────────────────────────────────────────────
  const renderRow = (row: Record<string, string>, idx: number, globalIdx: number) => (
    <tr
      key={globalIdx}
      style={{
        backgroundColor:
          idx % 2 === 1
            ? "var(--color-surface-soft)"
            : "var(--color-canvas)",
        borderBottom: "1px solid var(--color-hairline)",
        ...(virtualized ? { height: ROW_HEIGHT } : {}),
      }}
    >
      <td
        style={{
          padding: "8px 16px",
          fontSize: 12,
          color: "var(--color-border-strong)",
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {globalIdx + 1}
      </td>
      {headers.map((header) => (
        <td
          key={header}
          title={row[header] ?? ""}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            color: "var(--color-body)",
            whiteSpace: "nowrap",
            maxWidth: 280,
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: "var(--font-haas)",
          }}
        >
          {row[header] || (
            <span style={{ color: "var(--color-border-strong)" }}>—</span>
          )}
        </td>
      ))}
    </tr>
  );

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-hairline)",
        backgroundColor: "var(--color-canvas)",
        overflow: "hidden",
      }}
    >
      {/* Meta bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          borderBottom: "1px solid var(--color-hairline)",
          backgroundColor: "var(--color-canvas)",
        }}
      >
        <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
          {rows.length} {rows.length === 1 ? "row" : "rows"} ·{" "}
          {headers.length} {headers.length === 1 ? "column" : "columns"}
        </span>
        {virtualized && rows.length >= 100 && (
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>
            Virtualized rendering
          </span>
        )}
      </div>

      {/* Scrollable table */}
      <div
        ref={containerRef}
        onScroll={virtualized ? handleScroll : undefined}
        style={{ overflow: "auto", maxHeight }}
      >
        {virtualized && totalHeight ? (
          <div style={{ height: totalHeight, position: "relative" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>{theadRow}</thead>
              <tbody style={{ transform: `translateY(${offsetTop}px)` }}>
                {visibleRows.map((row, idx) => renderRow(row, idx, startIndex + idx))}
              </tbody>
            </table>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>{theadRow}</thead>
            <tbody>
              {rows.map((row, idx) => renderRow(row, idx, idx))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
