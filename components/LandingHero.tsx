"use client";

import { useState } from "react";
import UploadZone from "./UploadZone";
import ThemeToggle from "./ThemeToggle";
import { EMPLOYMENT_CONTRACT_META } from "@/data/employment_contract_sample";
import { APP_TOS_META } from "@/data/app_tos_sample";
import { RENTAL_AGREEMENT_META } from "@/data/rental_agreement_sample";

const SAMPLES = [
  { key: "employment", meta: EMPLOYMENT_CONTRACT_META, tag: "Employment" },
  { key: "tos",        meta: APP_TOS_META,             tag: "Terms of Service" },
  { key: "rental",     meta: RENTAL_AGREEMENT_META,    tag: "Rental" },
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
    <div
      className="relative min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-base)", fontFamily: "var(--font-sans)" }}
    >
      {/* Top rule */}
      <div className="w-full px-8 pt-8">
        <div className="max-w-3xl mx-auto">
          <div className="gl-divider" />
        </div>
      </div>

      {/* Nav */}
      <header className="w-full px-8 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: "var(--sage)", fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            Greyline
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="gl-label" style={{ color: "var(--text-muted)" }}>
              Contract Intelligence
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl mx-auto gl-fade-up" style={{ animationDelay: "0.05s" }}>

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div style={{ height: "1px", width: "32px", backgroundColor: "var(--flora)" }} />
            <span className="gl-label" style={{ color: "var(--flora)", letterSpacing: "0.14em" }}>
              Read before you sign
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mb-6 text-balance"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(2.6rem, 6vw, 4rem)",
              fontWeight: 400,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              color: "var(--ethereal)",
            }}
          >
            Understand every clause
            <br />
            <span style={{ color: "var(--sage)" }}>before you agree.</span>
          </h1>

          {/* Sub */}
          <p
            className="mb-12"
            style={{
              fontSize: "15px",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              maxWidth: "480px",
            }}
          >
            Six adversarial AI agents — prosecutor, defender, judge, and negotiator —
            debate every clause so you know exactly what you&apos;re signing.
          </p>

          {/* Sample cards */}
          <div className="mb-10">
            <p className="gl-label mb-4" style={{ color: "var(--text-muted)" }}>
              Try a sample document
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLES.map(({ key, meta, tag }) => (
                <button
                  key={key}
                  onClick={() => handleSampleClick(key)}
                  disabled={!!loading}
                  className="group text-left transition-all duration-200"
                  style={{
                    padding: "16px 18px",
                    borderRadius: "var(--r-md)",
                    backgroundColor: activeSample === key ? "var(--flora-dim)" : "var(--bg-elevated)",
                    border: `1px solid ${activeSample === key ? "var(--flora-border)" : "var(--border)"}`,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (activeSample !== key) {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-medium)";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSample !== key) {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)";
                    }
                  }}
                >
                  <div
                    className="gl-label mb-2"
                    style={{ color: activeSample === key ? "var(--flora)" : "var(--text-muted)" }}
                  >
                    {tag}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      lineHeight: 1.4,
                      marginBottom: "6px",
                    }}
                  >
                    {meta.title}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {meta.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-10">
            <div className="gl-divider flex-1" />
            <span className="gl-label" style={{ color: "var(--text-disabled)" }}>or upload your document</span>
            <div className="gl-divider flex-1" />
          </div>

          {/* Upload zone */}
          <div
            style={{
              borderRadius: "var(--r-lg)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              padding: "32px",
            }}
          >
            <UploadZone onSubmit={onSubmit} loading={loading} />
          </div>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-2 mt-8">
            {[
              "Prosecutor vs Defender",
              "Contradiction Detection",
              "Negotiation Scripts",
              "ELI5 Mode",
              "PDF Export",
            ].map((f) => (
              <span
                key={f}
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-sm)",
                  padding: "4px 10px",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="gl-divider mb-4" />
          <p className="gl-label text-center" style={{ color: "var(--text-disabled)", letterSpacing: "0.06em" }}>
            Not legal advice — for educational and negotiation assistance only
          </p>
        </div>
      </footer>
    </div>
  );
}
