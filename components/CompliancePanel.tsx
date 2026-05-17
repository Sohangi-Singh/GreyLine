"use client";

import { AnalysisResult } from "@/lib/types";

interface CompliancePanelProps {
  analysis: AnalysisResult;
  onFlagClick?: (clauseId: string) => void;
}

const FLAG_INFO: Record<string, { name: string; desc: string }> = {
  gdpr:  { name: "GDPR",  desc: "EU Data Protection" },
  ccpa:  { name: "CCPA",  desc: "CA Consumer Privacy" },
  labor: { name: "Labor", desc: "Labor Law" },
  ucpa:  { name: "UCPA",  desc: "Utah Consumer Privacy" },
};


export default function CompliancePanel({ analysis, onFlagClick }: CompliancePanelProps) {
  // Safe array guards
  const findings = Array.isArray(analysis?.prosecutorFindings) ? analysis.prosecutorFindings : [];
  const verdicts  = Array.isArray(analysis?.judgeVerdicts)     ? analysis.judgeVerdicts     : [];

  // For each compliance key: collect clause IDs where riskScore > 40 (violation)
  // vs flagged but judge scored ≤ 40 (overruled). Use String() comparison for IDs.
  function hasFlag(finding: typeof findings[number], keyword: string): boolean {
    return Array.isArray(finding?.complianceFlags) &&
      finding.complianceFlags.some((f) => String(f).toLowerCase().includes(keyword));
  }
  function judgeScore(clauseId: string): number {
    const v = verdicts.find((j) => String(j.clauseId) === String(clauseId));
    return v?.riskScore ?? 0;
  }

  const violations: Record<string, string[]> = { gdpr: [], ccpa: [], labor: [], ucpa: [] };
  const overruled:  Record<string, string[]> = { gdpr: [], ccpa: [], labor: [], ucpa: [] };

  for (const finding of findings) {
    const clauseId = finding?.clauseId;
    if (!clauseId) continue;
    const score = judgeScore(String(clauseId));

    for (const key of ["gdpr", "ccpa", "labor", "ucpa"] as const) {
      if (!hasFlag(finding, key)) continue;
      if (score > 40) {
        violations[key].push(String(clauseId));
      } else {
        overruled[key].push(String(clauseId));
      }
    }
  }

  const anyViolation = Object.values(violations).some((ids) => ids.length > 0);
  const anyOverruled = Object.values(overruled).some((ids)  => ids.length > 0);

  if (!anyViolation && !anyOverruled) {
    return (
      <div>
        <div className="text-[10px] tracking-widest text-gray-500 mb-3 font-bold">COMPLIANCE CHECK</div>
        <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
          <span className="text-emerald-400">✓</span>
          <span className="text-xs text-emerald-500">No issues detected</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[10px] tracking-widest text-gray-500 mb-3 font-bold">COMPLIANCE CHECK</div>
      <div className="space-y-1.5">
        {(["gdpr", "ccpa", "labor", "ucpa"] as const).map((key) => {
          const vIds = violations[key];
          const oIds = overruled[key];
          const info = FLAG_INFO[key];

          // Determine state
          const hasViolation = vIds.length > 0;
          const hasOverruled = oIds.length > 0;
          const isClean      = !hasViolation && !hasOverruled;

          const targetId = hasViolation ? vIds[0] : hasOverruled ? oIds[0] : null;

          let badgeText: string;
          let badgeColor: string;
          let badgeBg: string;
          let badgeBorder: string;
          let rowBg: string;
          let labelColor: string;

          if (hasViolation) {
            badgeText   = `✗ ${vIds.length} clause${vIds.length > 1 ? "s" : ""}`;
            badgeColor  = "#EF4444";
            badgeBg     = "rgba(239,68,68,0.12)";
            badgeBorder = "rgba(239,68,68,0.3)";
            rowBg       = "rgba(239,68,68,0.06)";
            labelColor  = "#fca5a5";
          } else if (hasOverruled) {
            badgeText   = "✓ Overruled";
            badgeColor  = "#22C55E";
            badgeBg     = "rgba(34,197,94,0.10)";
            badgeBorder = "rgba(34,197,94,0.25)";
            rowBg       = "rgba(34,197,94,0.04)";
            labelColor  = "#86efac";
          } else {
            badgeText   = "✓ OK";
            badgeColor  = "#22C55E";
            badgeBg     = "rgba(34,197,94,0.10)";
            badgeBorder = "rgba(34,197,94,0.25)";
            rowBg       = "transparent";
            labelColor  = "#6b7280";
          }

          return (
            <button
              key={key}
              disabled={isClean || targetId === null}
              onClick={() => targetId && onFlagClick?.(targetId)}
              className="w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors"
              style={{
                backgroundColor: rowBg,
                cursor: !isClean && targetId ? "pointer" : "default",
              }}
            >
              <div>
                <div className="text-xs font-bold" style={{ color: labelColor }}>{info.name}</div>
                <div className="text-[9px] text-gray-600">
                  {hasOverruled && !hasViolation
                    ? "Flagged, overruled by judge"
                    : info.desc}
                </div>
              </div>
              <div
                className="text-[9px] font-bold px-2 py-0.5 rounded border flex-shrink-0 ml-2"
                style={{ color: badgeColor, backgroundColor: badgeBg, borderColor: badgeBorder }}
              >
                {badgeText}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
