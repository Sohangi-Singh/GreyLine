"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnalysisResult, EnrichedClause, ReadingLevel } from "@/lib/types";
import RiskGauge from "./RiskGauge";
import ContradictionAlert from "./ContradictionAlert";
import CompliancePanel from "./CompliancePanel";
import BenchmarkChart from "./BenchmarkChart";
import ReadingLevelToggle from "./ReadingLevelToggle";
import ExportButton from "./ExportButton";

function normalizeId(id: string): string {
  return id.toLowerCase().replace(/[\s_-]+/g, "").replace(/[^a-z0-9]/g, "");
}

// Robust ID matching: try exact string first, then normalized
function matchId(a: string | undefined | null, b: string | undefined | null): boolean {
  if (a == null || b == null) return false;
  const sa = String(a).trim();
  const sb = String(b).trim();
  return sa === sb || normalizeId(sa) === normalizeId(sb);
}

// Client-side array safety — mirrors normalizeToArray in lib/gemini.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sa<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data) return [];
  const firstArray = Object.values(data as Record<string, unknown>).find((v) => Array.isArray(v));
  if (firstArray) return firstArray as T[];
  return [];
}

function synthesizeClauses(
  verdicts: import("@/lib/types").JudgeVerdict[],
  prosecutors: import("@/lib/types").ProsecutorFinding[],
): import("@/lib/types").ExtractedClause[] {
  return verdicts.map((v) => {
    const pf = prosecutors.find((p) => normalizeId(p.clauseId) === normalizeId(v.clauseId));
    return {
      id:       v.clauseId,
      text:     pf?.plainEnglish ?? v.summary ?? "(Original clause text unavailable)",
      location: "",
      type:     "general" as const,
      pageHint: "",
    };
  });
}

function enrichClauses(analysis: AnalysisResult): EnrichedClause[] {
  const prosecutors    = sa<import("@/lib/types").ProsecutorFinding>(analysis.prosecutorFindings);
  const defenders      = sa<import("@/lib/types").DefenderFinding>(analysis.defenderFindings);
  const verdicts       = sa<import("@/lib/types").JudgeVerdict>(analysis.judgeVerdicts);
  const rewrites       = sa<import("@/lib/types").NegotiatorRewrite>(analysis.negotiatorRewrites);

  // If extractor returned nothing, synthesize stubs from downstream agent data
  const raw = sa<import("@/lib/types").ExtractedClause>(analysis.clauses);
  const clauses = raw.length > 0 ? raw : synthesizeClauses(verdicts, prosecutors);

  return clauses.map((clause) => {
    const id = clause.id ?? "";
    return {
      ...clause,
      prosecutorFinding: prosecutors.find((p) => matchId(p.clauseId, id)),
      defenderFinding:   defenders.find((d)   => matchId(d.clauseId, id)),
      judgeVerdict:      verdicts.find((j)     => matchId(j.clauseId, id)),
      negotiatorRewrite: rewrites.find((n)     => matchId(n.clauseId, id)),
    };
  });
}


const VERDICT_STYLE: Record<string, { bg: string; border: string; text: string; solid: string }> = {
  DANGER:  { bg: "rgba(239,68,68,0.12)",   border: "#EF4444", text: "#fca5a5",  solid: "#EF4444" },
  WARNING: { bg: "rgba(249,115,22,0.10)",  border: "#F97316", text: "#fdba74",  solid: "#F97316" },
  CAUTION: { bg: "rgba(234,179,8,0.10)",   border: "#EAB308", text: "#fde047",  solid: "#EAB308" },
  SAFE:    { bg: "rgba(34,197,94,0.08)",   border: "#22C55E", text: "#86efac",  solid: "#22C55E" },
};

function vs(verdict?: string) {
  return VERDICT_STYLE[verdict ?? "SAFE"] ?? VERDICT_STYLE.SAFE;
}

// ---------- Typewriter ----------
function TypewriterText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [out, setOut] = useState("");
  const ref = useRef(0);
  const prev = useRef("");
  useEffect(() => {
    if (text === prev.current) return;
    prev.current = text;
    ref.current = 0;
    setOut("");
    const t = setInterval(() => {
      if (ref.current < text.length) { setOut(text.slice(0, ++ref.current)); }
      else clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return <span>{out}</span>;
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className="text-[10px] px-2 py-0.5 rounded border border-white/10 hover:border-indigo-500/40 text-gray-500 hover:text-indigo-400 transition-colors"
    >
      {ok ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ---------- Clause list card ----------
function ClauseCard({ clause, selected, onClick, summary }: {
  clause: EnrichedClause;
  selected: boolean;
  onClick: () => void;
  summary: string;
}) {
  const verdict = clause.judgeVerdict?.verdict;
  const score   = clause.judgeVerdict?.riskScore ?? 0;
  const style   = vs(verdict);

  return (
    <button
      id={`clause-${clause.id}`}
      onClick={onClick}
      className="w-full text-left transition-all duration-150 group"
      style={{
        borderLeft: `3px solid ${selected ? style.solid : style.border + "40"}`,
        backgroundColor: selected ? style.bg : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
      onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = style.bg; }}
      onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
    >
      <div className="px-3 py-3 flex items-start gap-3">
        {/* Left: score circle */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center"
          style={{ backgroundColor: style.bg, border: `1px solid ${style.border}40` }}
        >
          <span className="text-sm font-bold leading-none" style={{ color: style.text }}>{score}</span>
          <span className="text-[8px] leading-none mt-0.5" style={{ color: style.text, opacity: 0.6 }}>/100</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[10px] font-bold text-gray-400 uppercase">{clause.id}</span>
            <span className="text-[8px] text-gray-600 uppercase">—</span>
            <span className="text-[9px] text-gray-500 capitalize">{clause.type.replace("-", " ")}</span>
            {verdict && (
              <span
                className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}50` }}
              >
                {verdict}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
            {summary || clause.text.substring(0, 130) + "…"}
          </p>
          {(clause.prosecutorFinding?.complianceFlags ?? []).length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {clause.prosecutorFinding!.complianceFlags.slice(0, 3).map((f, i) => (
                <span key={i} className="text-[8px] px-1.5 py-px rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#fca5a5" }}>{f}</span>
              ))}
            </div>
          )}
        </div>
        <span className="flex-shrink-0 text-gray-700 group-hover:text-indigo-400 transition-colors text-xs mt-1">›</span>
      </div>
    </button>
  );
}

// ---------- Inline detail panel ----------
function ClauseDetail({ clause, readingLevel, simplifiedSummary }: {
  clause: EnrichedClause | null;
  readingLevel: ReadingLevel;
  simplifiedSummary?: string;
}) {
  if (!clause) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
        <div className="text-4xl mb-4 opacity-20">⚖</div>
        <div className="text-sm text-gray-500 font-medium">Select a clause to see the full analysis</div>
        <div className="text-xs text-gray-700 mt-2">Prosecutor · Defender · Judge · Negotiator</div>
      </div>
    );
  }

  const { prosecutorFinding, defenderFinding, judgeVerdict, negotiatorRewrite } = clause;
  const verdictStyle = vs(judgeVerdict?.verdict);
  const displaySummary = simplifiedSummary ?? judgeVerdict?.summary ?? "";

  return (
    <div className="px-5 py-4 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <div className="text-[10px] tracking-widest text-gray-500 mb-1">{clause.id} — {clause.type.toUpperCase()}</div>
          <div className="flex items-center gap-2">
            {judgeVerdict && (
              <>
                <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ color: verdictStyle.text, backgroundColor: verdictStyle.bg }}>
                  {judgeVerdict.verdict}
                </span>
                <span className="text-2xl font-bold" style={{ color: verdictStyle.solid, fontFamily: "Georgia, serif" }}>
                  {judgeVerdict.riskScore}<span className="text-sm text-gray-500">/100</span>
                </span>
              </>
            )}
          </div>
        </div>
        {judgeVerdict?.shouldNegotiate && (
          <span className="text-[9px] font-bold px-2 py-1 rounded" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>
            ↯ NEGOTIATE
          </span>
        )}
      </div>

      {/* Original text */}
      <section>
        <div className="text-[9px] tracking-widest text-gray-600 mb-2 font-bold">📄 ORIGINAL TEXT</div>
        <div className="text-xs text-gray-300 p-3 rounded leading-relaxed" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderLeft: "2px solid rgba(99,102,241,0.25)", fontFamily: "Georgia, serif" }}>
          {clause.text}
        </div>
      </section>

      {/* Prosecutor */}
      {prosecutorFinding && (
        <section>
          <div className="text-[9px] tracking-widest font-bold mb-2" style={{ color: "#EF444490" }}>🔴 PROSECUTOR</div>
          <div className="text-xs text-gray-300 p-3 rounded leading-relaxed" style={{ backgroundColor: "rgba(239,68,68,0.05)", borderLeft: "2px solid rgba(239,68,68,0.3)" }}>
            <TypewriterText text={prosecutorFinding.plainEnglish} speed={12} />
          </div>
          {prosecutorFinding.worstCaseScenario && (
            <div className="mt-2 text-[10px] text-red-400/60 italic">⚠ {prosecutorFinding.worstCaseScenario}</div>
          )}
          {prosecutorFinding.complianceFlags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {prosecutorFinding.complianceFlags.map((f, i) => (
                <span key={i} className="text-[8px] px-2 py-px rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#fca5a5" }}>{f}</span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Defender */}
      {defenderFinding && (
        <section>
          <div className="text-[9px] tracking-widest font-bold mb-2" style={{ color: "#22C55E90" }}>🟢 DEFENDER</div>
          <div className="text-xs text-gray-300 p-3 rounded leading-relaxed" style={{ backgroundColor: "rgba(34,197,94,0.05)", borderLeft: "2px solid rgba(34,197,94,0.3)" }}>
            {defenderFinding.counterArgument}
          </div>
          {defenderFinding.industryBenchmarkNote && (
            <div className="text-[10px] text-emerald-600/60 italic mt-2">📊 {defenderFinding.industryBenchmarkNote}</div>
          )}
        </section>
      )}

      {/* Judge */}
      {judgeVerdict && (
        <section>
          <div className="text-[9px] tracking-widest text-gray-600 font-bold mb-2">🏛️ JUDGE&apos;S VERDICT</div>
          <div className="text-xs text-gray-300 p-3 rounded leading-relaxed" style={{ backgroundColor: verdictStyle.bg, borderLeft: `2px solid ${verdictStyle.solid}40` }}>
            {judgeVerdict.keyReason}
          </div>
        </section>
      )}

      {/* Plain english */}
      {displaySummary && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[9px] tracking-widest text-gray-600 font-bold">💡 PLAIN ENGLISH</div>
            <span className="text-[8px] text-indigo-500 uppercase">{readingLevel}</span>
          </div>
          <div className="text-xs text-gray-200 p-3 rounded leading-relaxed" style={{ backgroundColor: "rgba(99,102,241,0.06)", borderLeft: "2px solid rgba(99,102,241,0.3)", fontStyle: readingLevel === "eli5" ? "italic" : "normal" }}>
            {displaySummary}
          </div>
        </section>
      )}

      {/* Scenarios */}
      {(judgeVerdict?.scenarioSimulations ?? []).length > 0 && (
        <section>
          <div className="text-[9px] tracking-widest text-gray-600 font-bold mb-2">📊 WHAT COULD HAPPEN</div>
          <div className="space-y-2">
            {(judgeVerdict?.scenarioSimulations ?? []).map((s, i) => {
              const pColor = s.probability === "likely" ? "#EF4444" : s.probability === "possible" ? "#F97316" : "#EAB308";
              return (
                <div key={i} className="p-3 rounded text-xs" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-medium">{s.scenario}</span>
                    <span className="text-[8px] font-bold px-1.5 py-px rounded ml-2 flex-shrink-0" style={{ color: pColor, backgroundColor: pColor + "15" }}>{s.probability.toUpperCase()}</span>
                  </div>
                  <p className="text-gray-400 mb-1">{s.consequence}</p>
                  {s.prevention && <p className="text-emerald-600/70 text-[10px]">↳ {s.prevention}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Negotiated rewrite */}
      {negotiatorRewrite && (
        <section>
          <div className="text-[9px] tracking-widest text-gray-600 font-bold mb-2">✏️ NEGOTIATED REWRITE</div>
          <div className="text-xs p-3 rounded leading-relaxed" style={{ backgroundColor: "rgba(34,197,94,0.05)", borderLeft: "2px solid rgba(34,197,94,0.3)", color: "#86efac", fontFamily: "Georgia, serif" }}>
            {negotiatorRewrite.rewrittenText}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <CopyBtn text={negotiatorRewrite.rewrittenText} />
            {negotiatorRewrite.negotiatingTip && (
              <span className="text-[10px] text-indigo-400/70 italic">💡 {negotiatorRewrite.negotiatingTip}</span>
            )}
          </div>
        </section>
      )}

      {/* Opening script */}
      {negotiatorRewrite?.openingScript && (
        <section>
          <div className="text-[9px] tracking-widest text-gray-600 font-bold mb-2">🗣️ WHAT TO SAY</div>
          <div className="p-4 rounded text-xs" style={{ backgroundColor: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <div className="text-[9px] text-indigo-400 tracking-wide mb-2">Say this to request the change:</div>
            <p className="text-gray-200 leading-relaxed italic" style={{ fontFamily: "Georgia, serif" }}>
              &ldquo;{negotiatorRewrite.openingScript}&rdquo;
            </p>
            <div className="mt-3"><CopyBtn text={negotiatorRewrite.openingScript} /></div>
          </div>
        </section>
      )}

      <div className="pb-6" />
    </div>
  );
}

// ---------- Main dashboard ----------
interface AnalysisDashboardProps {
  analysis: AnalysisResult;
  onReset: () => void;
}

export default function AnalysisDashboard({ analysis, onReset }: AnalysisDashboardProps) {
  const [selectedClause, setSelectedClause] = useState<EnrichedClause | null>(null);
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>("legal");
  const [simplifiedSummaries, setSimplifiedSummaries] = useState<Record<string, string>>({});
  const [levelLoading, setLevelLoading] = useState(false);

  // Fix Problem 1: use normalized ID matching
  const enriched = enrichClauses(analysis);

  // Sort by risk score descending
  const sorted = [...enriched].sort(
    (a, b) => (b.judgeVerdict?.riskScore ?? 0) - (a.judgeVerdict?.riskScore ?? 0)
  );

  const safeVerdicts = sa<import("@/lib/types").JudgeVerdict>(analysis.judgeVerdicts);
  const vArr = Array.isArray(safeVerdicts) ? safeVerdicts : [];

  // Use riskScore thresholds — more reliable than verdict string from Gemini
  const critical = vArr.filter((j) => (j.riskScore ?? 0) >= 81).length;
  const high     = vArr.filter((j) => (j.riskScore ?? 0) >= 61 && (j.riskScore ?? 0) < 81).length;
  const medium   = vArr.filter((j) => (j.riskScore ?? 0) >= 31 && (j.riskScore ?? 0) < 61).length;
  const safe     = vArr.filter((j) => (j.riskScore ?? 0) < 31).length;

  // Use MAX clause score as overall — best represents the worst risk present
  const displayScore = vArr.length > 0
    ? Math.round(Math.max(...vArr.map((j) => j.riskScore ?? 0)))
    : 0;

  const handleReadingLevel = useCallback(async (level: ReadingLevel) => {
    setReadingLevel(level);
    if (level === "legal") { setSimplifiedSummaries({}); return; }
    setLevelLoading(true);
    try {
      const summaries = sa<import("@/lib/types").JudgeVerdict>(analysis.judgeVerdicts).map((v) => v.summary);
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaries, level }),
      });
      const data = await res.json();
      if (data.summaries) {
        const map: Record<string, string> = {};
        sa<import("@/lib/types").JudgeVerdict>(analysis.judgeVerdicts).forEach((v, i) => { map[v.clauseId] = data.summaries[i] ?? v.summary; });
        setSimplifiedSummaries(map);
      }
    } catch { /* fallback */ } finally { setLevelLoading(false); }
  }, [analysis]);

  const scrollToClause = (clauseId: string) => {
    const clause = enriched.find((c) => normalizeId(c.id) === normalizeId(clauseId));
    if (clause) {
      setSelectedClause(clause);
      document.getElementById(`clause-${clause.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const getSummary = (clause: EnrichedClause) =>
    simplifiedSummaries[clause.id]
    ?? simplifiedSummaries[clause.judgeVerdict?.clauseId ?? ""]
    ?? clause.judgeVerdict?.summary
    ?? clause.prosecutorFinding?.plainEnglish
    ?? "";

  return (
    <div className="flex flex-col" style={{ height: "100vh", backgroundColor: "#0F1623" }}>
      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 z-30"
        style={{ backgroundColor: "rgba(15,22,35,0.97)", borderBottom: "1px solid rgba(99,102,241,0.15)" }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onReset} className="font-bold tracking-wider text-base hover:text-indigo-300" style={{ color: "#6366F1", fontFamily: "Georgia, serif" }}>
            GREYLINE
          </button>
          <div className="h-3.5 w-px bg-white/10" />
          <span className="text-xs text-gray-500">{analysis.documentType.toUpperCase()} · {sorted.length} clauses</span>
        </div>
        <div className="flex items-center gap-2">
          <ReadingLevelToggle level={readingLevel} onChange={handleReadingLevel} loading={levelLoading} />
          <ExportButton analysis={analysis} />
          <button onClick={onReset} className="text-xs text-gray-500 hover:text-gray-300 border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20 transition-colors">
            New Analysis
          </button>
        </div>
      </div>

      {/* Body — fixed height, no scroll on outer container */}
      <div className="flex flex-1 overflow-hidden">

        {/* Fix Problem 3: LEFT SIDEBAR 280px */}
        <aside
          className="flex-shrink-0 overflow-y-auto p-4 space-y-4"
          style={{ width: "280px", borderRight: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.01)" }}
        >
          <RiskGauge score={displayScore} critical={critical} high={high} medium={medium} safe={safe} />
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          <CompliancePanel analysis={analysis} onFlagClick={scrollToClause} />
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          <BenchmarkChart defenderFindings={analysis.defenderFindings} overallRiskScore={displayScore} />
        </aside>

        {/* RIGHT MAIN AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Contradiction banner — full width */}
          <div className="flex-shrink-0 px-4 pt-3 pb-2">
            <ContradictionAlert contradictions={analysis.contradictions} onClauseClick={scrollToClause} />
          </div>

          {/* Fix Problem 3: TWO COLUMNS */}
          <div className="flex flex-1 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>

            {/* LEFT COLUMN — clause list */}
            <div className="overflow-y-auto flex-shrink-0" style={{ width: "42%", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="px-3 py-2 flex items-center justify-between sticky top-0 z-10" style={{ backgroundColor: "rgba(15,22,35,0.95)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span className="text-[9px] tracking-widest text-gray-500 font-bold">CLAUSE ANALYSIS · {sorted.length} TOTAL</span>
                <div className="flex items-center gap-2">
                  {[{ v: "DANGER", c: "#EF4444" }, { v: "WARNING", c: "#F97316" }, { v: "CAUTION", c: "#EAB308" }, { v: "SAFE", c: "#22C55E" }].map(({ v, c }) => (
                    <div key={v} className="flex items-center gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fix Problem 1: show all clauses, even without verdict */}
              {sorted.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-600">No clauses to display</div>
              ) : (
                sorted.map((clause) => (
                  <ClauseCard
                    key={clause.id}
                    clause={clause}
                    selected={selectedClause?.id === clause.id}
                    onClick={() => {
                      console.log("[Greyline] clause clicked:", clause.id, "verdict:", clause.judgeVerdict?.verdict, "score:", clause.judgeVerdict?.riskScore);
                      setSelectedClause(clause);
                    }}
                    summary={getSummary(clause)}
                  />
                ))
              )}
            </div>

            {/* RIGHT COLUMN — always-visible detail panel */}
            <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "rgba(255,255,255,0.005)" }}>
              <ClauseDetail
                clause={selectedClause}
                readingLevel={readingLevel}
                simplifiedSummary={selectedClause ? simplifiedSummaries[selectedClause.id] : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
