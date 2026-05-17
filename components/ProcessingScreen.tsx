"use client";

import { useEffect, useState } from "react";

interface AgentStatus {
  agent: string;
  status: "waiting" | "running" | "complete" | "error";
  clauseCount?: number;
  contradictionsFound?: number;
}

interface ProcessingScreenProps {
  agentStatuses: Record<string, AgentStatus>;
}

const AGENTS = [
  { key: "extractor", label: "Document parsed", desc: "Extracting clauses" },
  { key: "prosecutor", label: "Prosecutor building case", desc: "Identifying risks" },
  { key: "defender", label: "Defender preparing arguments", desc: "Building counterarguments" },
  { key: "contradiction", label: "Contradiction detector scanning", desc: "Finding inconsistencies" },
  { key: "judge", label: "Judge reviewing all arguments", desc: "Delivering verdicts" },
  { key: "negotiator", label: "Negotiator drafting rewrites", desc: "Crafting fair language" },
];

const QUOTES = [
  "\"The most dangerous phrase in any contract: 'at our sole discretion'\"",
  "\"If you don't negotiate a contract, you accept someone else's terms.\"",
  "\"Ambiguity in contracts always benefits the party who wrote them.\"",
  "\"Read the fine print. It was written by lawyers who hope you won't.\"",
  "\"Every word in a contract was put there for a reason — usually not yours.\"",
];

export default function ProcessingScreen({ agentStatuses }: ProcessingScreenProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const qTimer = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 4000);
    const dTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => {
      clearInterval(qTimer);
      clearInterval(dTimer);
    };
  }, []);

  const getIcon = (key: string) => {
    const s = agentStatuses[key];
    if (!s || s.status === "waiting") return <span className="text-gray-600">○</span>;
    if (s.status === "running") return <span className="text-indigo-400 animate-pulse">⟳</span>;
    if (s.status === "complete") return <span className="text-emerald-400">✓</span>;
    if (s.status === "error") return <span className="text-red-400">✗</span>;
    return <span className="text-gray-600">○</span>;
  };

  const getLabel = (agent: { key: string; label: string; clauseCount?: number; contradictionsFound?: number }) => {
    const s = agentStatuses[agent.key];
    if (s?.status === "complete") {
      if (agent.key === "extractor" && s.clauseCount) return `${agent.label} — ${s.clauseCount} clauses extracted`;
      if (agent.key === "contradiction") return `${agent.label} — ${s.contradictionsFound ?? 0} contradiction(s) found`;
      return agent.label;
    }
    if (s?.status === "running") return `${agent.label}${dots}`;
    return agent.label;
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#0F1623", fontFamily: "system-ui" }}
    >
      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full"
            style={{
              height: "1px",
              top: `${i * 5}%`,
              backgroundColor: "rgba(99,102,241,0.04)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="text-2xl font-bold tracking-widest" style={{ color: "#6366F1", fontFamily: "Georgia, serif" }}>
            GREYLINE
          </div>
          <div className="text-xs tracking-[0.3em] text-gray-500 mt-1">ANALYSIS IN PROGRESS</div>
          <div className="mt-3 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        </div>

        {/* Agent statuses */}
        <div className="space-y-3 mb-10">
          {AGENTS.map((agent) => {
            const s = agentStatuses[agent.key];
            const isRunning = s?.status === "running";
            const isDone = s?.status === "complete";

            return (
              <div
                key={agent.key}
                className="flex items-center gap-4 px-4 py-2 rounded transition-all duration-300"
                style={{
                  backgroundColor: isRunning ? "rgba(99,102,241,0.08)" : isDone ? "rgba(34,197,94,0.04)" : "transparent",
                  borderLeft: isRunning ? "2px solid #6366F1" : isDone ? "2px solid #22C55E" : "2px solid transparent",
                }}
              >
                <div className="w-6 text-lg flex-shrink-0">{getIcon(agent.key)}</div>
                <div className="flex-1">
                  <div
                    className="text-sm font-mono"
                    style={{
                      color: isRunning ? "#a5b4fc" : isDone ? "#86efac" : "#4b5563",
                    }}
                  >
                    [{getLabel(agent)}]
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>PROCESSING</span>
            <span>
              {Object.values(agentStatuses).filter((s) => s.status === "complete").length} / {AGENTS.length}
            </span>
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(Object.values(agentStatuses).filter((s) => s.status === "complete").length / AGENTS.length) * 100}%`,
                background: "linear-gradient(90deg, #6366F1, #818CF8)",
              }}
            />
          </div>
        </div>

        {/* Rotating quotes */}
        <div className="text-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mb-4" />
          <div
            key={quoteIndex}
            className="text-xs text-gray-500 italic max-w-sm mx-auto leading-relaxed animate-fade-in"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {QUOTES[quoteIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}
