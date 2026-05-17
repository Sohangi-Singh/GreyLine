"use client";

import { AnalysisResult } from "@/lib/types";

interface CompliancePanelProps {
  analysis: AnalysisResult;
  onFlagClick?: (clauseId: string) => void;
}

const FLAG_INFO: Record<string, { name: string; desc: string }> = {
  gdpr:  { name: "GDPR",  desc: "EU Data Protection" },
  ccpa:  { name: "CCPA",  desc: "California Consumer Privacy" },
  labor: { name: "Labor", desc: "Labor Law" },
  ucpa:  { name: "UCPA",  desc: "Utah Consumer Privacy" },
};

export default function CompliancePanel({ analysis, onFlagClick }: CompliancePanelProps) {
  const findings = Array.isArray(analysis?.prosecutorFindings) ? analysis.prosecutorFindings : [];
  const verdicts  = Array.isArray(analysis?.judgeVerdicts)     ? analysis.judgeVerdicts     : [];

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
      if (score > 40) violations[key].push(String(clauseId));
      else            overruled[key].push(String(clauseId));
    }
  }

  const anyViolation = Object.values(violations).some((ids) => ids.length > 0);
  const anyOverruled  = Object.values(overruled).some((ids)  => ids.length > 0);

  if (!anyViolation && !anyOverruled) {
    return (
      <div style={{ fontFamily: "var(--font-sans)" }}>
        <div className="gl-label" style={{ color: "var(--text-muted)", marginBottom: "12px" }}>
          Compliance
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 14px",
            borderRadius: "var(--r-sm)",
            backgroundColor: "rgba(122,158,138,0.07)",
            border: "1px solid rgba(122,158,138,0.18)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--risk-safe)" strokeWidth="1.5">
            <polyline points="1.5 7.5 5 11 12.5 3.5" />
          </svg>
          <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--risk-safe)" }}>No issues detected</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div className="gl-label" style={{ color: "var(--text-muted)", marginBottom: "12px" }}>
        Compliance
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {(["gdpr", "ccpa", "labor", "ucpa"] as const).map((key) => {
          const vIds = violations[key];
          const oIds = overruled[key];
          const info = FLAG_INFO[key];

          const hasViolation = vIds.length > 0;
          const hasOverruled = oIds.length > 0;
          const isClean      = !hasViolation && !hasOverruled;
          const targetId     = hasViolation ? vIds[0] : hasOverruled ? oIds[0] : null;

          let badgeText: string;
          let statusColor: string;
          let rowBg: string;
          let rowBorder: string;

          if (hasViolation) {
            badgeText   = `${vIds.length} clause${vIds.length > 1 ? "s" : ""}`;
            statusColor = "var(--risk-critical)";
            rowBg       = "var(--risk-critical-bg)";
            rowBorder   = "var(--risk-critical-border)";
          } else if (hasOverruled) {
            badgeText   = "Overruled";
            statusColor = "var(--risk-safe)";
            rowBg       = "var(--risk-safe-bg)";
            rowBorder   = "var(--risk-safe-border)";
          } else {
            badgeText   = "Clear";
            statusColor = "var(--text-muted)";
            rowBg       = "transparent";
            rowBorder   = "transparent";
          }

          return (
            <button
              key={key}
              disabled={isClean || targetId === null}
              onClick={() => targetId && onFlagClick?.(targetId)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                borderRadius: "var(--r-sm)",
                border: `1px solid ${rowBorder}`,
                backgroundColor: rowBg,
                cursor: !isClean && targetId ? "pointer" : "default",
                textAlign: "left",
                transition: "all 0.15s ease",
                width: "100%",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 500, color: isClean ? "var(--text-muted)" : statusColor }}>
                  {info.name}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "1px" }}>
                  {info.desc}
                </div>
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: statusColor,
                  flexShrink: 0,
                  marginLeft: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {hasViolation && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="5" cy="5" r="4" />
                    <line x1="5" y1="3" x2="5" y2="5.5" />
                    <circle cx="5" cy="7" r="0.5" fill="currentColor" />
                  </svg>
                )}
                {hasOverruled && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="1.5 5.5 3.5 7.5 8.5 2.5" />
                  </svg>
                )}
                {badgeText}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
