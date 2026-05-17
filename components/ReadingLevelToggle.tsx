"use client";

import { ReadingLevel } from "@/lib/types";

interface ReadingLevelToggleProps {
  level: ReadingLevel;
  onChange: (level: ReadingLevel) => void;
  loading?: boolean;
}

const LEVELS: { value: ReadingLevel; label: string }[] = [
  { value: "legal",  label: "Legal" },
  { value: "simple", label: "Simple" },
  { value: "eli5",   label: "ELI5" },
];

export default function ReadingLevelToggle({ level, onChange, loading }: ReadingLevelToggleProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        backgroundColor: "var(--bg-elevated)",
        borderRadius: "var(--r-sm)",
        padding: "3px",
        border: "1px solid var(--border)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {LEVELS.map((l) => (
        <button
          key={l.value}
          onClick={() => onChange(l.value)}
          disabled={loading}
          style={{
            padding: "5px 12px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: level === l.value ? 600 : 400,
            color: level === l.value ? "var(--ethereal)" : "var(--text-muted)",
            backgroundColor: level === l.value ? "var(--bg-hover)" : "transparent",
            border: level === l.value ? "1px solid var(--border-medium)" : "1px solid transparent",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            opacity: loading && level === l.value ? 0.6 : 1,
          }}
        >
          {loading && level === l.value ? (
            <span style={{ opacity: 0.6 }}>{l.label}</span>
          ) : l.label}
        </button>
      ))}
    </div>
  );
}
