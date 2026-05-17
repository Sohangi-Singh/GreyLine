"use client";

import { useState } from "react";
import { AnalysisResult } from "@/lib/types";

interface ExportButtonProps {
  analysis: AnalysisResult;
}

export default function ExportButton({ analysis }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysis),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `greyline-analysis-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "7px 14px",
        borderRadius: "var(--r-sm)",
        fontSize: "12px",
        fontWeight: 500,
        fontFamily: "var(--font-sans)",
        color: loading ? "var(--text-muted)" : "var(--sage)",
        backgroundColor: "var(--bg-elevated)",
        border: "1px solid var(--border-medium)",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.15s ease",
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = "var(--flora-border)"; }}
      onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = "var(--border-medium)"; }}
    >
      {loading ? (
        <>
          <div
            style={{ width: "10px", height: "10px", border: "1.5px solid var(--flora)", borderTopColor: "transparent", borderRadius: "50%" }}
            className="gl-spin"
          />
          <span>Exporting…</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 1v7M3.5 5.5L6 8l2.5-2.5" />
            <path d="M1 9.5v1a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-1" />
          </svg>
          <span>Export PDF</span>
        </>
      )}
    </button>
  );
}
