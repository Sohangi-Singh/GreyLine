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
  { key: "extractor",    label: "Parsing document",              desc: "Extracting all clauses" },
  { key: "prosecutor",   label: "Prosecutor building case",       desc: "Identifying risks" },
  { key: "defender",     label: "Defender preparing arguments",   desc: "Building counterarguments" },
  { key: "contradiction",label: "Scanning for contradictions",    desc: "Finding inconsistencies" },
  { key: "judge",        label: "Judge reviewing all arguments",  desc: "Delivering verdicts" },
  { key: "negotiator",   label: "Negotiator drafting rewrites",   desc: "Crafting fair language" },
];

const QUOTES = [
  "The most dangerous phrase in any contract: 'at our sole discretion'",
  "If you don't negotiate a contract, you accept someone else's terms.",
  "Ambiguity in contracts always benefits the party who wrote them.",
  "Read the fine print — it was written by lawyers who hope you won't.",
  "Every word in a contract was placed there for a reason, usually not yours.",
];

export default function ProcessingScreen({ agentStatuses }: ProcessingScreenProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [visible,    setVisible]    = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(cycle);
  }, []);

  const completed = Object.values(agentStatuses).filter((s) => s.status === "complete").length;
  const progress  = (completed / AGENTS.length) * 100;

  const getStatus = (key: string) => agentStatuses[key]?.status;

  const getLabel = (agent: typeof AGENTS[0]) => {
    const s = agentStatuses[agent.key];
    if (s?.status === "complete") {
      if (agent.key === "extractor" && s.clauseCount)
        return `${agent.label} — ${s.clauseCount} clauses found`;
      if (agent.key === "contradiction")
        return `${agent.label} — ${s.contradictionsFound ?? 0} found`;
      return agent.label;
    }
    return agent.label;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-base)",
        fontFamily: "var(--font-sans)",
        padding: "48px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }} className="gl-fade-up">

        {/* Wordmark */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "22px",
              color: "var(--sage)",
              letterSpacing: "-0.01em",
              marginBottom: "8px",
            }}
          >
            Greyline
          </div>
          <div className="gl-label" style={{ color: "var(--text-muted)", letterSpacing: "0.16em" }}>
            Analysis in progress
          </div>
          <div style={{ marginTop: "20px" }} className="gl-divider" />
        </div>

        {/* Agent list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "40px" }}>
          {AGENTS.map((agent) => {
            const status  = getStatus(agent.key);
            const running  = status === "running";
            const done     = status === "complete";
            const waiting  = !status || status === "waiting";

            return (
              <div
                key={agent.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "10px 14px",
                  borderRadius: "var(--r-sm)",
                  borderLeft: `2px solid ${running ? "var(--flora)" : done ? "var(--risk-safe)" : "transparent"}`,
                  backgroundColor: running ? "var(--flora-dim)" : done ? "rgba(122,158,138,0.06)" : "transparent",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Status indicator */}
                <div style={{ flexShrink: 0, width: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--risk-safe)" strokeWidth="1.5">
                      <polyline points="1.5 6.5 4.5 9.5 10.5 3" />
                    </svg>
                  )}
                  {running && (
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        border: "1.5px solid var(--flora)",
                        borderTopColor: "transparent",
                      }}
                      className="gl-spin"
                    />
                  )}
                  {waiting && (
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--text-disabled)" }} />
                  )}
                </div>

                {/* Label */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: running ? 500 : 400,
                      color: running ? "var(--sage)" : done ? "var(--text-secondary)" : "var(--text-disabled)",
                      lineHeight: 1.4,
                    }}
                  >
                    {getLabel(agent)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
            }}
          >
            <span>PROCESSING</span>
            <span>{completed} / {AGENTS.length}</span>
          </div>
          <div
            style={{
              width: "100%",
              height: "2px",
              backgroundColor: "var(--border-medium)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                backgroundColor: "var(--flora)",
                borderRadius: "2px",
                transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
        </div>

        {/* Quote */}
        <div style={{ textAlign: "center" }}>
          <div className="gl-divider" style={{ marginBottom: "24px" }} />
          <p
            style={{
              fontSize: "12px",
              fontStyle: "italic",
              fontFamily: "var(--font-display)",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              maxWidth: "340px",
              margin: "0 auto",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            &ldquo;{QUOTES[quoteIndex]}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
