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
  "broader than", "more restrictive", "longer than", "higher than",
  "stricter than", "greater than", "exceeds", "above average",
  "more aggressive", "more onerous", "wider than", "larger than",
  "heavier than", "more burdensome",
];
const BETTER_KEYWORDS = [
  "shorter than", "fairer than", "less restrictive", "lower than",
  "more reasonable", "better than", "below average", "narrower than",
  "smaller than", "lighter than", "more favorable", "more favourable",
];

function isWorse(note: string, pct: number): boolean {
  const lower = note.toLowerCase();
  if (WORSE_KEYWORDS.some((k) => lower.includes(k))) return true;
  if (BETTER_KEYWORDS.some((k) => lower.includes(k))) return false;
  return pct > 50;
}

function extractBenchmarkLabel(note: string): string {
  if (note.toLowerCase().includes("non-compete")) return "Non-compete scope";
  if (note.toLowerCase().includes("data retention")) return "Data retention";
  if (note.toLowerCase().includes("termination")) return "Termination notice";
  if (note.toLowerCase().includes("arbitration")) return "Arbitration clause";
  if (note.toLowerCase().includes("ip") || note.toLowerCase().includes("intellectual property")) return "IP assignment";
  if (note.toLowerCase().includes("liability")) return "Liability cap";
  if (note.toLowerCase().includes("payment")) return "Payment terms";
  if (note.toLowerCase().includes("privacy") || note.toLowerCase().includes("data")) return "Data clause";
  return note.split(" ").slice(0, 3).join(" ") + "…";
}

export default function BenchmarkChart({ defenderFindings, overallRiskScore = 50 }: BenchmarkChartProps) {
  const findings = (Array.isArray(defenderFindings) ? defenderFindings : [])
    .filter((f) => f.percentileEstimate && f.industryBenchmarkNote)
    .slice(0, 5);

  if (findings.length === 0) return null;

  const bars = findings.map((f) => {
    const pct = parsePercentile(f.percentileEstimate);
    return { f, pct, worse: isWorse(f.industryBenchmarkNote, pct) };
  });

  const favourableCount = bars.filter((b) => !b.worse).length;
  const isFavourable = overallRiskScore < 40 || favourableCount >= bars.length / 2;

  return (
    <div>
      <div className="mb-3">
        <div
          className="text-[10px] tracking-widest font-bold"
          style={{ color: isFavourable ? "#22C55E" : "#9CA3AF" }}
        >
          BENCHMARK COMPARISON{isFavourable ? " — Favourable" : ""}
        </div>
        <div className="text-[9px] text-gray-600 mt-0.5">
          How this document compares to similar agreements
        </div>
      </div>

      <div className="space-y-3">
        {bars.map(({ f, pct, worse }, i) => {
          const label     = extractBenchmarkLabel(f.industryBenchmarkNote);
          const barColor  = worse ? "#EF4444" : "#22C55E";
          const textColor = worse ? "#fca5a5" : "#86efac";
          const badgeText = worse ? `More restrictive than ${pct}%` : `Fairer than ${pct}%`;

          return (
            <div key={i}>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[9px] text-gray-400 truncate max-w-[110px]">{label}</span>
                <span className="text-[9px] font-bold flex-shrink-0 ml-1" style={{ color: textColor }}>
                  {badgeText}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
              <div className="text-[8px] text-gray-600 mt-0.5 leading-tight">
                {f.industryBenchmarkNote.substring(0, 65)}{f.industryBenchmarkNote.length > 65 ? "…" : ""}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[8px] text-gray-700 mt-3 italic">* AI-estimated benchmark — not verified legal data</div>
    </div>
  );
}
