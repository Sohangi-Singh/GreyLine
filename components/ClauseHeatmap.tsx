"use client";

import { EnrichedClause } from "@/lib/types";

interface ClauseHeatmapProps {
  clauses: EnrichedClause[];
  onClauseClick: (clause: EnrichedClause) => void;
  selectedClauseId?: string;
  readingLevel?: string;
  simplifiedSummaries?: Record<string, string>;
}

const VERDICT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  DANGER: { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.5)", text: "#fca5a5" },
  WARNING: { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.4)", text: "#fdba74" },
  CAUTION: { bg: "rgba(234,179,8,0.10)", border: "rgba(234,179,8,0.35)", text: "#fde047" },
  SAFE: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", text: "#86efac" },
};

function getVerdictStyle(verdict?: string) {
  return VERDICT_COLORS[verdict ?? "SAFE"] ?? VERDICT_COLORS.SAFE;
}

export default function ClauseHeatmap({
  clauses,
  onClauseClick,
  selectedClauseId,
  simplifiedSummaries,
}: ClauseHeatmapProps) {
  const sorted = [...clauses].sort(
    (a, b) => (b.judgeVerdict?.riskScore ?? 0) - (a.judgeVerdict?.riskScore ?? 0)
  );

  return (
    <div className="space-y-0">
      {sorted.map((clause) => {
        const verdict = clause.judgeVerdict?.verdict;
        const score = clause.judgeVerdict?.riskScore ?? 0;
        const style = getVerdictStyle(verdict);
        const isSelected = clause.id === selectedClauseId;
        const summary = simplifiedSummaries?.[clause.id] ?? clause.judgeVerdict?.summary ?? "";

        return (
          <button
            key={clause.id}
            id={`clause-${clause.id}`}
            className="w-full text-left px-4 py-3 transition-all duration-200 hover:opacity-90 group"
            style={{
              backgroundColor: isSelected ? style.bg : "transparent",
              borderLeft: `3px solid ${isSelected ? style.border : "transparent"}`,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
            onClick={() => onClauseClick(clause)}
            onMouseEnter={(e) => {
              if (!isSelected) {
                (e.currentTarget as HTMLElement).style.backgroundColor = style.bg;
                (e.currentTarget as HTMLElement).style.borderLeftColor = style.border;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
              }
            }}
          >
            <div className="flex items-start gap-3">
              {/* Score badge */}
              <div
                className="flex-shrink-0 w-9 h-9 rounded flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
              >
                {score}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-400">{clause.id}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
                    style={{ backgroundColor: style.bg, color: style.text }}
                  >
                    {verdict ?? "?"}
                  </span>
                  <span className="text-[9px] text-gray-600 uppercase">{clause.type}</span>
                  {clause.judgeVerdict?.shouldNegotiate && (
                    <span className="text-[9px] text-indigo-400 ml-auto">NEGOTIATE ↗</span>
                  )}
                </div>
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {summary || clause.text.substring(0, 120) + "..."}
                </p>
                {clause.prosecutorFinding?.complianceFlags && clause.prosecutorFinding.complianceFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {clause.prosecutorFinding.complianceFlags.slice(0, 3).map((flag, i) => (
                      <span
                        key={i}
                        className="text-[8px] px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#fca5a5" }}
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 text-gray-600 group-hover:text-indigo-400 transition-colors text-xs">
                →
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
