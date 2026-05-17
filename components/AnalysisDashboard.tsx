"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnalysisResult, EnrichedClause, ReadingLevel } from "@/lib/types";
import RiskGauge from "./RiskGauge";
import ContradictionAlert from "./ContradictionAlert";
import CompliancePanel from "./CompliancePanel";
import BenchmarkChart from "./BenchmarkChart";
import ReadingLevelToggle from "./ReadingLevelToggle";
import ExportButton from "./ExportButton";
import ThemeToggle from "./ThemeToggle";

/* ─── Helpers ────────────────────────────────────────────── */
function normalizeId(id: string): string {
  return id.toLowerCase().replace(/[\s_-]+/g, "").replace(/[^a-z0-9]/g, "");
}

function matchId(a: string | undefined | null, b: string | undefined | null): boolean {
  if (a == null || b == null) return false;
  const sa = String(a).trim();
  const sb = String(b).trim();
  return sa === sb || normalizeId(sa) === normalizeId(sb);
}

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
  const prosecutors = sa<import("@/lib/types").ProsecutorFinding>(analysis.prosecutorFindings);
  const defenders   = sa<import("@/lib/types").DefenderFinding>(analysis.defenderFindings);
  const verdicts    = sa<import("@/lib/types").JudgeVerdict>(analysis.judgeVerdicts);
  const rewrites    = sa<import("@/lib/types").NegotiatorRewrite>(analysis.negotiatorRewrites);

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

/* ─── Risk style map ────────────────────────────────────── */
function riskStyle(score: number) {
  if (score >= 81) return { color: "var(--risk-critical)", bg: "var(--risk-critical-bg)", border: "var(--risk-critical-border)" };
  if (score >= 61) return { color: "var(--risk-high)",     bg: "var(--risk-high-bg)",     border: "var(--risk-high-border)" };
  if (score >= 31) return { color: "var(--risk-medium)",   bg: "var(--risk-medium-bg)",   border: "var(--risk-medium-border)" };
  return                  { color: "var(--risk-safe)",     bg: "var(--risk-safe-bg)",     border: "var(--risk-safe-border)" };
}

/* ─── Typewriter ────────────────────────────────────────── */
function TypewriterText({ text, speed = 16 }: { text: string; speed?: number }) {
  const [out, setOut] = useState("");
  const ref  = useRef(0);
  const prev = useRef("");
  useEffect(() => {
    if (text === prev.current) return;
    prev.current = text;
    ref.current  = 0;
    setOut("");
    const t = setInterval(() => {
      if (ref.current < text.length) setOut(text.slice(0, ++ref.current));
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
      style={{
        fontSize: "10px",
        padding: "4px 10px",
        borderRadius: "4px",
        border: "1px solid var(--border-medium)",
        color: ok ? "var(--risk-safe)" : "var(--text-muted)",
        backgroundColor: "transparent",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        transition: "all 0.15s ease",
        letterSpacing: "0.04em",
      }}
    >
      {ok ? "Copied" : "Copy"}
    </button>
  );
}

/* ─── Clause card ───────────────────────────────────────── */
function ClauseCard({
  clause, selected, onClick, summary,
}: {
  clause: EnrichedClause;
  selected: boolean;
  onClick: () => void;
  summary: string;
}) {
  const score = clause.judgeVerdict?.riskScore ?? 0;
  const st    = riskStyle(score);

  return (
    <button
      id={`clause-${clause.id}`}
      onClick={onClick}
      className="w-full text-left group"
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        borderLeft: `3px solid ${selected ? st.color : "transparent"}`,
        backgroundColor: selected ? st.bg : "transparent",
        transition: "all 0.15s ease",
        cursor: "pointer",
        display: "block",
        fontFamily: "var(--font-sans)",
      }}
      onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)"; }}
      onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        {/* Score pill */}
        <div
          style={{
            flexShrink: 0,
            width: "38px",
            height: "38px",
            borderRadius: "var(--r-sm)",
            backgroundColor: st.bg,
            border: `1px solid ${st.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 500, color: st.color, fontFamily: "var(--font-display)", lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: "7px", color: st.color, opacity: 0.6, letterSpacing: "0.04em" }}>/100</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em" }}>
              {clause.id}
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>·</span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "capitalize" }}>
              {clause.type.replace("-", " ")}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.55 }} className="line-clamp-2">
            {summary || clause.text.substring(0, 130) + "…"}
          </p>
          {(clause.prosecutorFinding?.complianceFlags ?? []).length > 0 && (
            <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
              {clause.prosecutorFinding!.complianceFlags.slice(0, 3).map((f, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "9px",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    backgroundColor: "var(--risk-critical-bg)",
                    color: "var(--risk-critical)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke={selected ? st.color : "var(--text-disabled)"}
          strokeWidth="1.5"
          style={{ flexShrink: 0, marginTop: "4px", transition: "stroke 0.15s ease" }}
        >
          <path d="M4 2.5L7.5 6 4 9.5" />
        </svg>
      </div>
    </button>
  );
}

/* ─── Section header ────────────────────────────────────── */
function SectionHead({ label }: { label: string }) {
  return (
    <div className="gl-label" style={{ color: "var(--text-muted)", marginBottom: "8px", padding: "0 4px" }}>
      {label}
    </div>
  );
}

/* ─── Clause detail panel ───────────────────────────────── */
function ClauseDetail({
  clause, readingLevel, simplifiedSummary,
}: {
  clause: EnrichedClause | null;
  readingLevel: ReadingLevel;
  simplifiedSummary?: string;
}) {
  if (!clause) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "48px 32px",
          textAlign: "center",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          stroke="var(--text-disabled)"
          strokeWidth="1"
          style={{ marginBottom: "16px", opacity: 0.4 }}
        >
          <path d="M10 4H6a2 2 0 0 0-2 2v24a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V14L22 4z" />
          <path d="M22 4v10h10" />
          <line x1="10" y1="20" x2="26" y2="20" />
          <line x1="10" y1="25" x2="20" y2="25" />
        </svg>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>
          Select a clause
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-disabled)", lineHeight: 1.6 }}>
          Prosecutor · Defender · Judge · Negotiator
        </div>
      </div>
    );
  }

  const { prosecutorFinding, defenderFinding, judgeVerdict, negotiatorRewrite } = clause;
  const score          = judgeVerdict?.riskScore ?? 0;
  const st             = riskStyle(score);
  const displaySummary = simplifiedSummary ?? judgeVerdict?.summary ?? "";

  return (
    <div
      style={{ padding: "28px 28px 48px", fontFamily: "var(--font-sans)" }}
      className="gl-fade-up"
    >
      {/* Header */}
      <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div className="gl-label" style={{ color: "var(--text-muted)", marginBottom: "8px" }}>
              {clause.id} · {clause.type.toUpperCase()}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {judgeVerdict && (
                <>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "4px",
                      color: st.color,
                      backgroundColor: st.bg,
                      border: `1px solid ${st.border}`,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {judgeVerdict.verdict}
                  </span>
                  <span
                    style={{
                      fontSize: "28px",
                      fontWeight: 400,
                      fontFamily: "var(--font-display)",
                      color: st.color,
                      lineHeight: 1,
                    }}
                  >
                    {score}
                    <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>/100</span>
                  </span>
                </>
              )}
            </div>
          </div>
          {judgeVerdict?.shouldNegotiate && (
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                padding: "5px 10px",
                borderRadius: "4px",
                color: "var(--flora)",
                backgroundColor: "var(--flora-dim)",
                border: "1px solid var(--flora-border)",
                letterSpacing: "0.06em",
                flexShrink: 0,
              }}
            >
              Negotiate
            </span>
          )}
        </div>
      </div>

      {/* Original text */}
      <section style={{ marginBottom: "24px" }}>
        <SectionHead label="Original Text" />
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            padding: "16px 18px",
            borderRadius: "var(--r-md)",
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-display)",
            fontStyle: "normal",
          }}
        >
          {clause.text}
        </div>
      </section>

      {/* Prosecutor */}
      {prosecutorFinding && (
        <section style={{ marginBottom: "24px" }}>
          <SectionHead label="Prosecutor" />
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              padding: "16px 18px",
              borderRadius: "var(--r-md)",
              backgroundColor: "var(--risk-critical-bg)",
              borderLeft: "2px solid var(--risk-critical-border)",
            }}
          >
            <TypewriterText text={prosecutorFinding.plainEnglish} speed={10} />
          </div>
          {prosecutorFinding.worstCaseScenario && (
            <p style={{ fontSize: "11px", color: "var(--risk-critical)", marginTop: "8px", lineHeight: 1.5, opacity: 0.8 }}>
              Worst case: {prosecutorFinding.worstCaseScenario}
            </p>
          )}
          {prosecutorFinding.complianceFlags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "10px" }}>
              {prosecutorFinding.complianceFlags.map((f, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "9px",
                    padding: "3px 8px",
                    borderRadius: "3px",
                    backgroundColor: "var(--risk-critical-bg)",
                    color: "var(--risk-critical)",
                    border: "1px solid var(--risk-critical-border)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Defender */}
      {defenderFinding && (
        <section style={{ marginBottom: "24px" }}>
          <SectionHead label="Defender" />
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              padding: "16px 18px",
              borderRadius: "var(--r-md)",
              backgroundColor: "var(--risk-safe-bg)",
              borderLeft: "2px solid var(--risk-safe-border)",
            }}
          >
            {defenderFinding.counterArgument}
          </div>
          {defenderFinding.industryBenchmarkNote && (
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.5, fontStyle: "italic" }}>
              {defenderFinding.industryBenchmarkNote}
            </p>
          )}
        </section>
      )}

      {/* Judge */}
      {judgeVerdict && (
        <section style={{ marginBottom: "24px" }}>
          <SectionHead label="Judge's Verdict" />
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              padding: "16px 18px",
              borderRadius: "var(--r-md)",
              backgroundColor: st.bg,
              borderLeft: `2px solid ${st.border}`,
            }}
          >
            {judgeVerdict.keyReason}
          </div>
        </section>
      )}

      {/* Plain English */}
      {displaySummary && (
        <section style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <SectionHead label="Plain English" />
            <span className="gl-label" style={{ color: "var(--flora)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {readingLevel}
            </span>
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "var(--ethereal)",
              lineHeight: 1.75,
              padding: "16px 18px",
              borderRadius: "var(--r-md)",
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-medium)",
              fontStyle: readingLevel === "eli5" ? "italic" : "normal",
            }}
          >
            {displaySummary}
          </div>
        </section>
      )}

      {/* Scenarios */}
      {(judgeVerdict?.scenarioSimulations ?? []).length > 0 && (
        <section style={{ marginBottom: "24px" }}>
          <SectionHead label="What Could Happen" />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(judgeVerdict?.scenarioSimulations ?? []).map((s, i) => {
              const pColor =
                s.probability === "likely"   ? "var(--risk-critical)"
                : s.probability === "possible" ? "var(--risk-high)"
                : "var(--risk-medium)";
              return (
                <div
                  key={i}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "var(--r-sm)",
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", gap: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4 }}>
                      {s.scenario}
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: "9px",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        padding: "2px 7px",
                        borderRadius: "3px",
                        color: pColor,
                        backgroundColor: "transparent",
                        border: `1px solid ${pColor}`,
                        textTransform: "uppercase",
                      }}
                    >
                      {s.probability}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55, marginBottom: "4px" }}>
                    {s.consequence}
                  </p>
                  {s.prevention && (
                    <p style={{ fontSize: "11px", color: "var(--risk-safe)", lineHeight: 1.5, opacity: 0.8 }}>
                      ↳ {s.prevention}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Negotiated rewrite */}
      {negotiatorRewrite && (
        <section style={{ marginBottom: "24px" }}>
          <SectionHead label="Negotiated Rewrite" />
          <div
            style={{
              fontSize: "13px",
              color: "var(--ethereal)",
              lineHeight: 1.75,
              padding: "16px 18px",
              borderRadius: "var(--r-md)",
              backgroundColor: "var(--risk-safe-bg)",
              border: "1px solid var(--risk-safe-border)",
              fontFamily: "var(--font-display)",
            }}
          >
            {negotiatorRewrite.rewrittenText}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
            <CopyBtn text={negotiatorRewrite.rewrittenText} />
            {negotiatorRewrite.negotiatingTip && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
                {negotiatorRewrite.negotiatingTip}
              </span>
            )}
          </div>
        </section>
      )}

      {/* Opening script */}
      {negotiatorRewrite?.openingScript && (
        <section>
          <SectionHead label="What to Say" />
          <div
            style={{
              padding: "20px 20px",
              borderRadius: "var(--r-md)",
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-medium)",
            }}
          >
            <div className="gl-label" style={{ color: "var(--flora)", marginBottom: "10px" }}>
              Say this to request the change
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-primary)",
                lineHeight: 1.75,
                fontStyle: "italic",
                fontFamily: "var(--font-display)",
              }}
            >
              &ldquo;{negotiatorRewrite.openingScript}&rdquo;
            </p>
            <div style={{ marginTop: "14px" }}>
              <CopyBtn text={negotiatorRewrite.openingScript} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ─── Main dashboard ────────────────────────────────────── */
interface AnalysisDashboardProps {
  analysis: AnalysisResult;
  onReset: () => void;
}

export default function AnalysisDashboard({ analysis, onReset }: AnalysisDashboardProps) {
  const [selectedClause,      setSelectedClause]      = useState<EnrichedClause | null>(null);
  const [readingLevel,        setReadingLevel]        = useState<ReadingLevel>("legal");
  const [simplifiedSummaries, setSimplifiedSummaries] = useState<Record<string, string>>({});
  const [levelLoading,        setLevelLoading]        = useState(false);

  const enriched = enrichClauses(analysis);
  const sorted   = [...enriched].sort((a, b) => (b.judgeVerdict?.riskScore ?? 0) - (a.judgeVerdict?.riskScore ?? 0));

  const safeVerdicts = sa<import("@/lib/types").JudgeVerdict>(analysis.judgeVerdicts);
  const vArr = Array.isArray(safeVerdicts) ? safeVerdicts : [];

  const critical    = vArr.filter((j) => (j.riskScore ?? 0) >= 81).length;
  const high        = vArr.filter((j) => (j.riskScore ?? 0) >= 61 && (j.riskScore ?? 0) < 81).length;
  const medium      = vArr.filter((j) => (j.riskScore ?? 0) >= 31 && (j.riskScore ?? 0) < 61).length;
  const safe        = vArr.filter((j) => (j.riskScore ?? 0) < 31).length;
  const displayScore = vArr.length > 0
    ? Math.round(Math.max(...vArr.map((j) => j.riskScore ?? 0)))
    : 0;

  const handleReadingLevel = useCallback(async (level: ReadingLevel) => {
    setReadingLevel(level);
    if (level === "legal") { setSimplifiedSummaries({}); return; }
    setLevelLoading(true);
    try {
      const summaries = sa<import("@/lib/types").JudgeVerdict>(analysis.judgeVerdicts).map((v) => v.summary);
      const res       = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaries, level }),
      });
      const data = await res.json();
      if (data.summaries) {
        const map: Record<string, string> = {};
        sa<import("@/lib/types").JudgeVerdict>(analysis.judgeVerdicts).forEach((v, i) => {
          map[v.clauseId] = data.summaries[i] ?? v.summary;
        });
        setSimplifiedSummaries(map);
      }
    } catch { /* fallback */ }
    finally { setLevelLoading(false); }
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "var(--bg-base)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── Top bar ──────────────────────────────────────── */}
      <header
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: "52px",
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onReset}
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "16px",
              fontWeight: 400,
              color: "var(--sage)",
              background: "none",
              border: "none",
              cursor: "pointer",
              letterSpacing: "-0.01em",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ethereal)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--sage)")}
          >
            Greyline
          </button>
          <div style={{ width: "1px", height: "14px", backgroundColor: "var(--border-medium)" }} />
          <span style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.02em" }}>
            {analysis.documentType.toUpperCase()} · {sorted.length} clause{sorted.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ReadingLevelToggle level={readingLevel} onChange={handleReadingLevel} loading={levelLoading} />
          <ThemeToggle />
          <ExportButton analysis={analysis} />
          <button
            onClick={onReset}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--r-sm)",
              fontSize: "12px",
              color: "var(--text-muted)",
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "var(--font-sans)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-medium)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
          >
            New Analysis
          </button>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left sidebar */}
        <aside
          style={{
            flexShrink: 0,
            width: "268px",
            overflowY: "auto",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            borderRight: "1px solid var(--border)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <RiskGauge score={displayScore} critical={critical} high={high} medium={medium} safe={safe} />
          <div className="gl-divider" />
          <CompliancePanel analysis={analysis} onFlagClick={scrollToClause} />
          <div className="gl-divider" />
          <BenchmarkChart defenderFindings={analysis.defenderFindings} overallRiskScore={displayScore} />
        </aside>

        {/* Center + right */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Contradiction banner */}
          <div
            style={{
              flexShrink: 0,
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <ContradictionAlert contradictions={analysis.contradictions} onClauseClick={scrollToClause} />
          </div>

          {/* Two-column area */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

            {/* Clause list */}
            <div
              style={{
                flexShrink: 0,
                width: "40%",
                overflowY: "auto",
                borderRight: "1px solid var(--border)",
              }}
            >
              {/* Sticky header */}
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  backgroundColor: "var(--bg-surface)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span className="gl-label" style={{ color: "var(--text-muted)" }}>
                  Clause Analysis · {sorted.length} total
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[
                    { color: "var(--risk-critical)" },
                    { color: "var(--risk-high)" },
                    { color: "var(--risk-medium)" },
                    { color: "var(--risk-safe)" },
                  ].map(({ color }, i) => (
                    <div
                      key={i}
                      style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: color, opacity: 0.7 }}
                    />
                  ))}
                </div>
              </div>

              {sorted.length === 0 ? (
                <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  No clauses to display
                </div>
              ) : (
                sorted.map((clause) => (
                  <ClauseCard
                    key={clause.id}
                    clause={clause}
                    selected={selectedClause?.id === clause.id}
                    onClick={() => setSelectedClause(clause)}
                    summary={getSummary(clause)}
                  />
                ))
              )}
            </div>

            {/* Detail panel */}
            <div style={{ flex: 1, overflowY: "auto", backgroundColor: "var(--bg-base)" }}>
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
