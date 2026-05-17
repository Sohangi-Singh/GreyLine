"use client";

import { useEffect, useState } from "react";

interface RiskGaugeProps {
  score: number;
  critical: number;
  high: number;
  medium: number;
  safe: number;
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.round(p * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, duration]);
  return value;
}

function safetyColor(s: number): string {
  if (s >= 70) return "var(--risk-safe)";
  if (s >= 40) return "var(--risk-medium)";
  if (s >= 20) return "var(--risk-high)";
  return "var(--risk-critical)";
}

function safetyLabel(s: number): string {
  if (s >= 70) return "Low Risk";
  if (s >= 40) return "Moderate";
  if (s >= 20) return "Elevated";
  return "High Risk";
}

const STAT_LABELS = [
  { key: "critical", label: "Critical", colorVar: "--risk-critical", bgVar: "--risk-critical-bg", borderVar: "--risk-critical-border" },
  { key: "high",     label: "High",     colorVar: "--risk-high",     bgVar: "--risk-high-bg",     borderVar: "--risk-high-border" },
  { key: "medium",   label: "Medium",   colorVar: "--risk-medium",   bgVar: "--risk-medium-bg",   borderVar: "--risk-medium-border" },
  { key: "safe",     label: "Safe",     colorVar: "--risk-safe",     bgVar: "--risk-safe-bg",     borderVar: "--risk-safe-border" },
];

export default function RiskGauge({ score, critical, high, medium, safe }: RiskGaugeProps) {
  const riskScore   = Math.min(100, Math.max(0, score || 0));
  const safetyScore = 100 - riskScore;
  const color       = safetyColor(safetyScore);
  const label       = safetyLabel(safetyScore);

  const radius      = 48;
  const cx          = 68;
  const cy          = 60;
  const circumference = Math.PI * radius;

  const [offset, setOffset] = useState(circumference);
  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(circumference * (1 - safetyScore / 100));
    }, 80);
    return () => clearTimeout(t);
  }, [safetyScore, circumference]);

  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 0 ${cx + radius} ${cy}`;

  const counts = [
    useCountUp(critical, 900),
    useCountUp(high,     900),
    useCountUp(medium,   900),
    useCountUp(safe,     900),
  ];

  const statValues = [critical, high, medium, safe];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "var(--font-sans)" }}>

      {/* Gauge SVG */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width="136" height="96" viewBox="0 0 136 96">
          {/* Track */}
          <path d={arcPath} fill="none" stroke="var(--bg-elevated)" strokeWidth="8" strokeLinecap="round" />
          {/* Fill */}
          <path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            opacity="0.85"
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease" }}
          />
          {/* 0 label */}
          <text x="16" y={cy + 16} fontSize="9" fill="var(--text-disabled)" textAnchor="middle"
            fontFamily="Inter, system-ui">0</text>
          {/* 100 label */}
          <text x="120" y={cy + 16} fontSize="9" fill="var(--text-disabled)" textAnchor="middle"
            fontFamily="Inter, system-ui">100</text>
          {/* Score */}
          <text x={cx} y={cy - 12} fontSize="30" fontWeight="500" fill={color}
            textAnchor="middle" fontFamily="Instrument Serif, Georgia, serif">
            {safetyScore}
          </text>
          {/* out of */}
          <text x={cx} y={cy + 1} fontSize="9" fill="var(--text-muted)" textAnchor="middle"
            fontFamily="Inter, system-ui">
            out of 100
          </text>
          {/* Label */}
          <text x={cx} y={cy + 32} fontSize="10" fontWeight="500" fill={color}
            textAnchor="middle" fontFamily="Inter, system-ui" letterSpacing="0.06em">
            {label.toUpperCase()}
          </text>
          {/* Subtitle */}
          <text x={cx} y={cy + 46} fontSize="8.5" fill="var(--text-muted)"
            textAnchor="middle" fontFamily="Inter, system-ui" letterSpacing="0.08em">
            SAFETY SCORE
          </text>
        </svg>
      </div>

      {/* Stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {STAT_LABELS.map(({ label: l, colorVar, bgVar, borderVar }, i) => {
          const count   = statValues[i];
          const isEmpty = count === 0;
          return (
            <div
              key={l}
              style={{
                padding: "10px 12px",
                borderRadius: "var(--r-sm)",
                textAlign: "center",
                backgroundColor: isEmpty ? "var(--bg-elevated)" : `var(${bgVar})`,
                border: `1px solid ${isEmpty ? "var(--border)" : `var(${borderVar})`}`,
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 500,
                  fontFamily: "var(--font-display)",
                  color: isEmpty ? "var(--text-disabled)" : `var(${colorVar})`,
                  lineHeight: 1.1,
                  marginBottom: "3px",
                }}
              >
                {counts[i]}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: isEmpty ? "var(--text-disabled)" : `var(${colorVar})`,
                  opacity: isEmpty ? 0.5 : 0.7,
                }}
              >
                {l}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
