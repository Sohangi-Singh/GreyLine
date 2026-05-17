"use client";

import { useEffect, useRef, useState } from "react";
import { EnrichedClause, ReadingLevel } from "@/lib/types";

interface DebatePanelProps {
  clause: EnrichedClause | null;
  onClose: () => void;
  readingLevel: ReadingLevel;
  simplifiedSummary?: string;
}

function TypewriterText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const prevTextRef = useRef("");

  useEffect(() => {
    if (text === prevTextRef.current) return;
    prevTextRef.current = text;
    indexRef.current = 0;
    setDisplayed("");

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayed}</span>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-[10px] px-2 py-0.5 rounded border border-white/10 hover:border-indigo-500/50 text-gray-400 hover:text-indigo-400 transition-colors"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

const VERDICT_COLORS: Record<string, string> = {
  DANGER: "#EF4444",
  WARNING: "#F97316",
  CAUTION: "#EAB308",
  SAFE: "#22C55E",
};

const PROBABILITY_COLORS: Record<string, string> = {
  likely: "#EF4444",
  possible: "#F97316",
  unlikely: "#EAB308",
};

export default function DebatePanel({ clause, onClose, readingLevel, simplifiedSummary }: DebatePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!clause) return null;

  const { prosecutorFinding, defenderFinding, judgeVerdict, negotiatorRewrite } = clause;
  const verdictColor = judgeVerdict ? VERDICT_COLORS[judgeVerdict.verdict] : "#6b7280";

  const displaySummary = simplifiedSummary ?? judgeVerdict?.summary ?? "";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] overflow-y-auto flex flex-col"
        style={{
          backgroundColor: "#111827",
          borderLeft: "1px solid rgba(99,102,241,0.2)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <div className="text-xs tracking-widest text-gray-500 mb-1">{clause.id} — {clause.type.toUpperCase()}</div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold px-2 py-0.5 rounded"
                style={{
                  color: verdictColor,
                  backgroundColor: verdictColor + "20",
                }}
              >
                {judgeVerdict?.verdict ?? "UNKNOWN"}
              </span>
              {judgeVerdict && (
                <span className="text-2xl font-bold" style={{ color: verdictColor, fontFamily: "Georgia, serif" }}>
                  {judgeVerdict.riskScore}
                  <span className="text-sm text-gray-500">/100</span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl leading-none mt-1 ml-4"
          >
            ×
          </button>
        </div>

        <div className="flex-1 px-5 py-4 space-y-5">
          {/* Original text */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs">📄</span>
              <span className="text-[10px] tracking-widest text-gray-500 font-bold">ORIGINAL TEXT</span>
            </div>
            <div
              className="text-sm leading-relaxed text-gray-300 p-3 rounded"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", fontFamily: "Georgia, serif", borderLeft: "2px solid rgba(99,102,241,0.3)" }}
            >
              {clause.text}
            </div>
            <div className="text-[9px] text-gray-600 mt-1">{clause.location}</div>
          </section>

          {/* Prosecutor */}
          {prosecutorFinding && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">🔴</span>
                <span className="text-[10px] tracking-widest font-bold" style={{ color: "#EF444490" }}>PROSECUTOR</span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-bold ml-auto"
                  style={{
                    color: prosecutorFinding.severity === "critical" ? "#EF4444" : prosecutorFinding.severity === "high" ? "#F97316" : prosecutorFinding.severity === "medium" ? "#EAB308" : "#22C55E",
                    backgroundColor: prosecutorFinding.severity === "critical" ? "#EF444415" : "#F9731615",
                  }}
                >
                  {prosecutorFinding.severity.toUpperCase()}
                </span>
              </div>
              <div
                className="text-sm text-gray-300 p-3 rounded leading-relaxed"
                style={{ backgroundColor: "rgba(239,68,68,0.05)", borderLeft: "2px solid rgba(239,68,68,0.3)" }}
              >
                <TypewriterText text={prosecutorFinding.plainEnglish} speed={15} />
              </div>
              {prosecutorFinding.complianceFlags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {prosecutorFinding.complianceFlags.map((flag, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#fca5a5" }}
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              )}
              {prosecutorFinding.worstCaseScenario && (
                <div className="mt-2 text-xs text-red-400/70 italic">
                  ⚠ Worst case: {prosecutorFinding.worstCaseScenario}
                </div>
              )}
            </section>
          )}

          {/* Defender */}
          {defenderFinding && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">🟢</span>
                <span className="text-[10px] tracking-widest font-bold" style={{ color: "#22C55E90" }}>DEFENDER</span>
                {defenderFinding.isStandardIndustryPractice && (
                  <span className="text-[9px] text-emerald-600 ml-auto">INDUSTRY STANDARD</span>
                )}
              </div>
              <div
                className="text-sm text-gray-300 p-3 rounded leading-relaxed"
                style={{ backgroundColor: "rgba(34,197,94,0.05)", borderLeft: "2px solid rgba(34,197,94,0.3)" }}
              >
                {defenderFinding.counterArgument}
              </div>
              {defenderFinding.industryBenchmarkNote && (
                <div className="mt-2 text-xs text-emerald-600/70 italic">
                  📊 {defenderFinding.industryBenchmarkNote}
                </div>
              )}
            </section>
          )}

          {/* Judge */}
          {judgeVerdict && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">🏛️</span>
                <span className="text-[10px] tracking-widest text-gray-500 font-bold">JUDGE&apos;S VERDICT</span>
              </div>
              <div
                className="p-3 rounded"
                style={{
                  backgroundColor: verdictColor + "08",
                  borderLeft: `2px solid ${verdictColor}40`,
                }}
              >
                <div className="text-sm text-gray-300 leading-relaxed mb-2">
                  {judgeVerdict.keyReason}
                </div>
                {judgeVerdict.shouldNegotiate && (
                  <div
                    className="text-xs font-bold tracking-wide"
                    style={{ color: verdictColor }}
                  >
                    ↯ SHOULD NEGOTIATE
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Plain English / Reading level */}
          {displaySummary && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">💡</span>
                <span className="text-[10px] tracking-widest text-gray-500 font-bold">PLAIN ENGLISH</span>
                <span className="text-[9px] text-indigo-500 ml-auto uppercase">{readingLevel}</span>
              </div>
              <div
                className="text-sm text-gray-200 p-3 rounded leading-relaxed"
                style={{ backgroundColor: "rgba(99,102,241,0.06)", borderLeft: "2px solid rgba(99,102,241,0.3)", fontStyle: readingLevel === "eli5" ? "italic" : "normal" }}
              >
                {displaySummary}
              </div>
            </section>
          )}

          {/* Scenarios */}
          {judgeVerdict?.scenarioSimulations && judgeVerdict.scenarioSimulations.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">📊</span>
                <span className="text-[10px] tracking-widest text-gray-500 font-bold">WHAT COULD HAPPEN</span>
              </div>
              <div className="space-y-2">
                {judgeVerdict.scenarioSimulations.map((sim, i) => (
                  <div
                    key={i}
                    className="p-3 rounded"
                    style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-300">{sim.scenario}</span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          color: PROBABILITY_COLORS[sim.probability] ?? "#6b7280",
                          backgroundColor: (PROBABILITY_COLORS[sim.probability] ?? "#6b7280") + "15",
                        }}
                      >
                        {sim.probability.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{sim.consequence}</p>
                    {sim.prevention && (
                      <p className="text-[10px] text-emerald-600">↳ {sim.prevention}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Negotiated rewrite */}
          {negotiatorRewrite && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">✏️</span>
                <span className="text-[10px] tracking-widest text-gray-500 font-bold">NEGOTIATED REWRITE</span>
              </div>
              <div
                className="p-3 rounded mb-2 text-sm leading-relaxed text-emerald-300"
                style={{ backgroundColor: "rgba(34,197,94,0.05)", fontFamily: "Georgia, serif", borderLeft: "2px solid rgba(34,197,94,0.3)" }}
              >
                {negotiatorRewrite.rewrittenText}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CopyButton text={negotiatorRewrite.rewrittenText} />
                {negotiatorRewrite.whatChanged.length > 0 && (
                  <span className="text-[9px] text-gray-500">
                    Changed: {negotiatorRewrite.whatChanged.slice(0, 2).join(", ")}{negotiatorRewrite.whatChanged.length > 2 ? ` +${negotiatorRewrite.whatChanged.length - 2}` : ""}
                  </span>
                )}
              </div>
              {negotiatorRewrite.negotiatingTip && (
                <div className="text-xs text-indigo-400/80 italic">
                  💡 {negotiatorRewrite.negotiatingTip}
                </div>
              )}
            </section>
          )}

          {/* What to say */}
          {negotiatorRewrite?.openingScript && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">🗣️</span>
                <span className="text-[10px] tracking-widest text-gray-500 font-bold">WHAT TO SAY</span>
              </div>
              <div
                className="p-4 rounded"
                style={{
                  backgroundColor: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <div className="text-[10px] text-indigo-400 tracking-wide mb-2">Say this to request the change:</div>
                <p
                  className="text-sm text-gray-200 leading-relaxed italic"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  &ldquo;{negotiatorRewrite.openingScript}&rdquo;
                </p>
                <div className="mt-3">
                  <CopyButton text={negotiatorRewrite.openingScript} />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
