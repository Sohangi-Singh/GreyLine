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
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
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
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 hover:bg-indigo-500/10 disabled:opacity-50"
      style={{
        borderColor: "rgba(99,102,241,0.4)",
        color: "#a5b4fc",
      }}
    >
      {loading ? (
        <>
          <span className="animate-spin text-xs">⟳</span>
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <span>⬇</span>
          <span>Export PDF</span>
        </>
      )}
    </button>
  );
}
