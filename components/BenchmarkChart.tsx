"use client";

import { DefenderFinding } from "@/lib/types";

interface BenchmarkChartProps {
  defenderFindings: DefenderFinding[];
  overallRiskScore?: number;
}

function parsePercentile(text: string): number {
  const match = text.match(/(\d+)%/);
  return match ? parseInt(match[1]) : 50;
}

const WORSE_KEYWORDS = [
  "broader than","more restrictive","longer than","higher than","stricter than",
  "greater than","exceeds","above average","more aggressive","more onerous",
  "wider than","larger than","heavier than","more burdensome",
];
const BETTER_KEYWORDS = [
  "shorter than","fairer than","less restrictive","lower than","more reasonable",
  "better than","below average","narrower than","smaller than","lighter than",
  "more favorable","more favourable",
];

function isWorse(note: string, pct: number): boolean {
  const lower = note.toLowerCase();
  if (WORSE_KEYWORDS.some((k) => lower.includes(k))) return true;
  if (BETTER_KEYWORDS.some((k) => lower.includes(k))) return false;
  return pct > 50;
}

function extractLabel(note: string): string {
  if (note.toLowerCase().includes("non-compete"))          return "Non-compete scope";
  if (note.toLowerCase().includes("data retention"))       return "Data retention";
  if (note.toLowerCase().includes("termination"))          return "Termination notice";
  if (note.toLowerCase().includes("arbitration"))          return "Arbitration";
  if (/\bip\b|intellectual property/i.test(note))         return "IP assignment";
  if (note.toLowerCase().includes("liability"))            return "Liability cap";
  if (note.toLowerCase().includes("payment"))              return "Payment terms";
  if (/privacy|data/i.test(note))                          return "Data clause";
  return note.split(" ").slice(0, 3).join(" ") + "…";
}

export default function BenchmarkChart({ defenderFindings }: BenchmarkChartProps) {
  const findings = (Array.isArray(defenderFindings) ? defenderFindings : [])
    .filter((f) => f.percentileEstimate && f.industryBenchmarkNote)
    .slice(0, 5);

  if (findings.length === 0) return null;

  const bars = findings.map((f) => {
    const pct  = parsePercentile(f.percentileEstimate);
    const worse = isWorse(f.industryBenchmarkNote, pct);
    return { f, pct, worse };
  });

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      <div className="gl-label" style={{ color: "var(--text-muted)", marginBottom: "4px" }}>
        Industry Benchmark
      </div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
        How this document compares to similar agreements
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {bars.map(({ f, pct, worse }, i) => {
          const barColor  = worse ? "var(--risk-critical)" : "var(--risk-safe)";
          const textColor = worse ? "var(--risk-critical)" : "var(--risk-safe)";
          const summary   = worse ? `More restrictive than ${pct}%` : `Fairer than ${pct}%`;

          return (
            <div key={i}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "5px",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {extractLabel(f.industryBenchmarkNote)}
                </span>
                <span style={{ fontSize: "10px", fontWeight: 500, color: textColor, flexShrink: 0, marginLeft: "8px" }}>
                  {summary}
                </span>
              </div>
              {/* Track */}
              <div
                style={{
                  width: "100%",
                  height: "3px",
                  borderRadius: "2px",
                  backgroundColor: "var(--bg-elevated)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    backgroundColor: barColor,
                    borderRadius: "2px",
                    opacity: 0.7,
                    transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px", lineHeight: 1.4 }}>
                {f.industryBenchmarkNote.substring(0, 72)}{f.industryBenchmarkNote.length > 72 ? "…" : ""}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: "9px", color: "var(--text-disabled)", marginTop: "12px", fontStyle: "italic" }}>
        AI-estimated benchmark — not verified legal data
      </div>
    </div>
  );
}
