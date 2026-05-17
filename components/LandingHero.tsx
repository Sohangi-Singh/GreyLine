"use client";

import { useState } from "react";
import UploadZone from "./UploadZone";
import { EMPLOYMENT_CONTRACT_META } from "@/data/employment_contract_sample";
import { APP_TOS_META } from "@/data/app_tos_sample";
import { RENTAL_AGREEMENT_META } from "@/data/rental_agreement_sample";

const SAMPLES = [
  { key: "employment", meta: EMPLOYMENT_CONTRACT_META, icon: "💼" },
  { key: "tos", meta: APP_TOS_META, icon: "📱" },
  { key: "rental", meta: RENTAL_AGREEMENT_META, icon: "🏠" },
];

interface LandingHeroProps {
  onSubmit: (data: {
    file?: File;
    text?: string;
    url?: string;
    sampleKey?: string;
    documentType: string;
  }) => void;
  loading?: boolean;
}

export default function LandingHero({ onSubmit, loading }: LandingHeroProps) {
  const [activeSample, setActiveSample] = useState<string | null>(null);

  const handleSampleClick = (key: string) => {
    setActiveSample(key);
    onSubmit({ sampleKey: key, documentType: "sample" });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Floating document silhouettes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute opacity-5"
            style={{
              left: `${10 + i * 12}%`,
              top: `${5 + (i % 3) * 25}%`,
              animation: `float-doc ${6 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          >
            <svg width="60" height="80" viewBox="0 0 60 80">
              <rect x="5" y="5" width="50" height="70" rx="3" fill="#6366F1" />
              <rect x="12" y="15" width="36" height="2" fill="white" opacity="0.6" />
              <rect x="12" y="22" width="36" height="2" fill="white" opacity="0.4" />
              <rect x="12" y="29" width="28" height="2" fill="white" opacity="0.4" />
              <rect x="12" y="36" width="36" height="2" fill="white" opacity="0.3" />
              <rect x="12" y="43" width="20" height="2" fill="white" opacity="0.3" />
              <rect x="12" y="55" width="36" height="2" fill="white" opacity="0.2" />
              <rect x="12" y="62" width="24" height="2" fill="white" opacity="0.2" />
            </svg>
          </div>
        ))}
      </div>

      {/* Horizontal rule decorations */}
      <div className="absolute top-8 w-full max-w-4xl px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-2">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-indigo-500/40" />
            <span className="text-xs tracking-[0.4em] text-indigo-400 font-medium">CONTRACT INTELLIGENCE</span>
            <div className="h-px w-12 bg-indigo-500/40" />
          </div>
          <h1
            className="text-6xl sm:text-8xl font-bold tracking-tight mb-3"
            style={{ color: "#6366F1", fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}
          >
            Greyline
          </h1>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mb-6" />
          <p
            className="text-xl sm:text-2xl text-gray-300 max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Read before you sign.
            <br />
            <span className="text-gray-500">Understand before you agree.</span>
          </p>
        </div>

        {/* Stats row */}
        <div className="flex justify-center gap-8 my-8">
          {[
            { n: "6", label: "AI Agents" },
            { n: "100%", label: "Adversarial" },
            { n: "∞", label: "Clauses Analyzed" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-indigo-400" style={{ fontFamily: "Georgia, serif" }}>{s.n}</div>
              <div className="text-xs tracking-widest text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Sample cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {SAMPLES.map(({ key, meta, icon }) => (
            <button
              key={key}
              onClick={() => handleSampleClick(key)}
              disabled={loading}
              className="group relative text-left p-4 rounded-xl border transition-all duration-200 hover:border-indigo-500/50 disabled:opacity-50"
              style={{
                backgroundColor: activeSample === key ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
                borderColor: activeSample === key ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-sm font-bold text-gray-300 mb-1">{meta.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed mb-3">{meta.description}</div>
              <div
                className="text-[9px] font-bold tracking-wide px-2 py-1 rounded"
                style={{
                  color: meta.riskPreview.startsWith("CRITICAL") ? "#fca5a5" : "#fdba74",
                  backgroundColor: meta.riskPreview.startsWith("CRITICAL") ? "rgba(239,68,68,0.1)" : "rgba(249,115,22,0.1)",
                }}
              >
                {meta.riskPreview.split(" — ")[0]}
              </div>
              <div className="absolute top-3 right-3 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Try →
              </div>
            </button>
          ))}
        </div>

        {/* Upload zone */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          <div className="text-xs tracking-widest text-gray-500 mb-5 text-center">— OR UPLOAD YOUR OWN DOCUMENT —</div>
          <UploadZone onSubmit={onSubmit} loading={loading} />
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["Prosecutor vs Defender Debate", "Contradiction Detection", "Negotiation Scripts", "ELI5 Mode", "PDF Export"].map((f) => (
            <span
              key={f}
              className="text-[10px] px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.15)" }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 w-full max-w-4xl px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="text-center text-xs text-gray-700 mt-3">
          Not legal advice. For educational and negotiation assistance only.
        </div>
      </div>
    </div>
  );
}
