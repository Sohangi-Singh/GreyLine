"use client";

import { useState } from "react";
import LandingHero from "@/components/LandingHero";
import ProcessingScreen from "@/components/ProcessingScreen";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import { AnalysisResult } from "@/lib/types";
import { EMPLOYMENT_CONTRACT_SAMPLE } from "@/data/employment_contract_sample";
import { APP_TOS_SAMPLE } from "@/data/app_tos_sample";
import { RENTAL_AGREEMENT_SAMPLE } from "@/data/rental_agreement_sample";

type AppState = "landing" | "processing" | "results";

interface AgentStatusMap {
  [key: string]: {
    agent: string;
    status: "waiting" | "running" | "complete" | "error";
    clauseCount?: number;
    contradictionsFound?: number;
  };
}

const SAMPLE_MAP: Record<string, string> = {
  employment: EMPLOYMENT_CONTRACT_SAMPLE,
  tos: APP_TOS_SAMPLE,
  rental: RENTAL_AGREEMENT_SAMPLE,
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [agentStatuses, setAgentStatuses] = useState<AgentStatusMap>({});
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    file?: File;
    text?: string;
    url?: string;
    sampleKey?: string;
    documentType: string;
  }) => {
    setAppState("processing");
    setAgentStatuses({});
    setError(null);

    try {
      const formData = new FormData();

      if (data.sampleKey) {
        const sampleText = SAMPLE_MAP[data.sampleKey];
        if (!sampleText) throw new Error("Unknown sample key");
        formData.append("sampleText", sampleText);
        formData.append("documentType", data.sampleKey);
      } else if (data.text) {
        formData.append("text", data.text);
        formData.append("documentType", "text");
      } else if (data.url) {
        formData.append("url", data.url);
        formData.append("documentType", "url");
      } else if (data.file) {
        formData.append("file", data.file);
        formData.append("documentType", data.documentType);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis request failed");
      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "final") {
              setAnalysis(event.analysis);
              setAppState("results");
              return;
            }

            if (event.type === "error") {
              setError(event.message ?? "Analysis failed");
              setAppState("landing");
              return;
            }

            if (event.agent) {
              setAgentStatuses((prev) => ({
                ...prev,
                [event.agent]: {
                  agent: event.agent,
                  status: event.status,
                  clauseCount: event.clauseCount,
                  contradictionsFound: event.contradictionsFound,
                },
              }));
            }
          } catch {
            // skip malformed event
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      setAppState("landing");
    }
  };

  const handleReset = () => {
    setAppState("landing");
    setAnalysis(null);
    setAgentStatuses({});
    setError(null);
  };

  if (appState === "processing") {
    return <ProcessingScreen agentStatuses={agentStatuses} />;
  }

  if (appState === "results" && analysis) {
    return <AnalysisDashboard analysis={analysis} onReset={handleReset} />;
  }

  return (
    <main style={{ backgroundColor: "#0F1623" }}>
      {error && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg border text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.4)", color: "#fca5a5" }}
        >
          ⚠ {error}
        </div>
      )}
      <LandingHero onSubmit={handleSubmit} loading={false} />
    </main>
  );
}
