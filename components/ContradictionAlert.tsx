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
        className="flex items-center gap-4 px-5 rounded-lg"
        style={{
          paddingTop: "20px",
          paddingBottom: "20px",
          border: "1px solid rgba(34,197,94,0.25)",
          backgroundColor: "rgba(34,197,94,0.07)",
        }}
      >
        <span style={{ fontSize: "20px", color: "#22C55E", lineHeight: 1 }}>✓</span>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 500, color: "#4ade80", letterSpacing: "0.01em" }}>
            No contradictions detected
          </div>
          <div className="text-xs text-emerald-700 mt-0.5">Document is internally consistent</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(239,68,68,0.35)" }}>
      <button
        className="w-full flex items-center gap-4 px-5 text-left hover:bg-red-500/10 transition-colors"
        style={{ backgroundColor: "rgba(239,68,68,0.08)", paddingTop: "20px", paddingBottom: "20px" }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ fontSize: "20px", color: "#EF4444", lineHeight: 1 }}>⚡</span>
        <div className="flex-1">
          <div style={{ fontSize: "16px", fontWeight: 500, color: "#f87171" }}>
            {contradictions.length} contradiction{contradictions.length > 1 ? "s" : ""} detected
          </div>
          {!expanded && (
            <div className="text-xs mt-0.5" style={{ color: "#EF444480" }}>
              {contradictions[0].clauseAId} directly conflicts with {contradictions[0].clauseBId}
            </div>
          )}
        </div>
        <span className="text-xs" style={{ color: "#EF444460" }}>{expanded ? "▲ HIDE" : "▼ VIEW"}</span>
      </button>

      {expanded && (
        <div className="divide-y divide-amber-500/10">
          {contradictions.map((c, i) => (
            <div key={i} className="px-4 py-4" style={{ backgroundColor: "rgba(234,179,8,0.04)" }}>
              <div className="flex items-start gap-3">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded border mt-0.5 flex-shrink-0"
                  style={{
                    color: c.severity === "critical" ? "#EF4444" : c.severity === "high" ? "#F97316" : "#EAB308",
                    borderColor: c.severity === "critical" ? "#EF444430" : c.severity === "high" ? "#F9731630" : "#EAB30830",
                    backgroundColor: c.severity === "critical" ? "#EF444410" : c.severity === "high" ? "#F9731610" : "#EAB30810",
                  }}
                >
                  {c.severity.toUpperCase()}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                      onClick={() => onClauseClick?.(c.clauseAId)}
                    >
                      {c.clauseAId}
                    </button>
                    <span className="text-gray-600 text-xs">conflicts with</span>
                    <button
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                      onClick={() => onClauseClick?.(c.clauseBId)}
                    >
                      {c.clauseBId}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 italic mb-1">{c.contradiction}</p>
                  <p className="text-xs text-amber-300/80">{c.plainEnglish}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
