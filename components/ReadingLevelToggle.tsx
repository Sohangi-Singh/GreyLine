"use client";

import { ReadingLevel } from "@/lib/types";

interface ReadingLevelToggleProps {
  level: ReadingLevel;
  onChange: (level: ReadingLevel) => void;
  loading?: boolean;
}

const LEVELS: { value: ReadingLevel; label: string; desc: string }[] = [
  { value: "legal", label: "Legal", desc: "Technical legal language" },
  { value: "simple", label: "Simple", desc: "Plain English" },
  { value: "eli5", label: "ELI5", desc: "Explain like I'm 5" },
];

export default function ReadingLevelToggle({ level, onChange, loading }: ReadingLevelToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1 border border-white/10">
      {LEVELS.map((l) => (
        <button
          key={l.value}
          onClick={() => onChange(l.value)}
          disabled={loading}
          className="relative px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 disabled:opacity-50"
          style={{
            backgroundColor: level === l.value ? "#6366F1" : "transparent",
            color: level === l.value ? "white" : "#6b7280",
          }}
          title={l.desc}
        >
          {loading && level === l.value ? (
            <span className="animate-pulse">{l.label}</span>
          ) : (
            l.label
          )}
        </button>
      ))}
    </div>
  );
}
