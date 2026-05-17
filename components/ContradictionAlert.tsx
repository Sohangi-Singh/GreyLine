"use client";

import { useState } from "react";
import { Contradiction } from "@/lib/types";

interface ContradictionAlertProps {
  contradictions: Contradiction[];
  onClauseClick?: (clauseId: string) => void;
}

export default function ContradictionAlert({ contradictions, onClauseClick }: ContradictionAlertProps) {
  const [expanded, setExpanded] = useState(false);

  if (contradictions.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 18px",
          borderRadius: "var(--r-md)",
          backgroundColor: "rgba(122,158,138,0.07)",
          border: "1px solid rgba(122,158,138,0.16)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--risk-safe)" strokeWidth="1.5">
          <polyline points="2 8.5 6 12.5 14 4" />
        </svg>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--risk-safe)" }}>
            No contradictions detected
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
            Document is internally consistent
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: "var(--r-md)",
        border: "1px solid var(--risk-critical-border)",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 18px",
          backgroundColor: "var(--risk-critical-bg)",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background-color 0.15s ease",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(192,122,90,0.12)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--risk-critical-bg)")}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--risk-critical)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
          <path d="M8 2L14.5 13H1.5L8 2Z" />
          <line x1="8" y1="7" x2="8" y2="9.5" />
          <circle cx="8" cy="11.5" r="0.6" fill="var(--risk-critical)" />
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--risk-critical)" }}>
            {contradictions.length} contradiction{contradictions.length > 1 ? "s" : ""} detected
          </div>
          {!expanded && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              {contradictions[0].clauseAId} conflicts with {contradictions[0].clauseBId}
            </div>
          )}
        </div>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
          {expanded ? "Hide" : "View"}
        </span>
      </button>

      {expanded && (
        <div
          style={{
            borderTop: "1px solid var(--risk-critical-border)",
          }}
        >
          {contradictions.map((c, i) => (
            <div
              key={i}
              style={{
                padding: "14px 18px",
                borderBottom: i < contradictions.length - 1 ? "1px solid var(--border)" : "none",
                backgroundColor: "var(--bg-surface)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    marginTop: "2px",
                    color:
                      c.severity === "critical" ? "var(--risk-critical)"
                      : c.severity === "high"   ? "var(--risk-high)"
                      : "var(--risk-medium)",
                    backgroundColor:
                      c.severity === "critical" ? "var(--risk-critical-bg)"
                      : c.severity === "high"   ? "var(--risk-high-bg)"
                      : "var(--risk-medium-bg)",
                    border: `1px solid ${
                      c.severity === "critical" ? "var(--risk-critical-border)"
                      : c.severity === "high"   ? "var(--risk-high-border)"
                      : "var(--risk-medium-border)"
                    }`,
                  }}
                >
                  {c.severity}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => onClauseClick?.(c.clauseAId)}
                      style={{ fontSize: "11px", color: "var(--flora)", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "2px" }}
                    >
                      {c.clauseAId}
                    </button>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>conflicts with</span>
                    <button
                      onClick={() => onClauseClick?.(c.clauseBId)}
                      style={{ fontSize: "11px", color: "var(--flora)", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "2px" }}
                    >
                      {c.clauseBId}
                    </button>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.55, fontStyle: "italic", marginBottom: "4px" }}>
                    {c.contradiction}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {c.plainEnglish}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
