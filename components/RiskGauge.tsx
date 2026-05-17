"use client";

import { useEffect, useState } from "react";

interface RiskGaugeProps {
  score: number; // overall risk score (0–100); converted to safety internally
  critical: number;
  high: number;
  medium: number;
  safe: number;
}

function useCountUp(target: number, duration = 1000) {
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

// Safety score = 100 - riskScore. High safety = green, low safety = red.
function safetyColor(s: number) {
  if (s >= 70) return "#22C55E";  // very safe  → green
  if (s >= 40) return "#EAB308";  // moderate   → amber
  if (s >= 20) return "#F97316";  // low safety → orange
  return "#EF4444";               // unsafe     → red
}

function safetyLabel(s: number) {
  if (s >= 70) return "VERY SAFE";
  if (s >= 40) return "MODERATE";
  if (s >= 20) return "LOW SAFETY";
  return "UNSAFE";
}

export default function RiskGauge({ score, critical, high, medium, safe }: RiskGaugeProps) {
  const riskScore    = Math.min(100, Math.max(0, score || 0));
  const safetyScore  = 100 - riskScore;           // invert: high = safer
  const color        = safetyColor(safetyScore);
  const label        = safetyLabel(safetyScore);

  const radius       = 50;
  const cx           = 70;
  const cy           = 62;                        // arc baseline
  const circumference = Math.PI * radius;

  // Arc fill represents safety: more fill = safer
  const [offset, setOffset] = useState(circumference);
  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(circumference * (1 - safetyScore / 100));
    }, 80);
    return () => clearTimeout(t);
  }, [safetyScore, circumference]);

  // sweep-flag=0 → top semicircle (left→top→right), stays inside viewBox
  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 0 ${cx + radius} ${cy}`;

  const stats = [
    { label: "CRITICAL", count: critical, bg: "rgba(239,68,68,0.18)",  border: "rgba(239,68,68,0.4)",  text: "#fca5a5" },
    { label: "HIGH",     count: high,     bg: "rgba(249,115,22,0.18)", border: "rgba(249,115,22,0.4)", text: "#fdba74" },
    { label: "MEDIUM",   count: medium,   bg: "rgba(234,179,8,0.18)",  border: "rgba(234,179,8,0.4)",  text: "#fde047" },
    { label: "SAFE",     count: safe,     bg: "rgba(34,197,94,0.18)",  border: "rgba(34,197,94,0.4)",  text: "#86efac" },
  ];

  const animCounts = [
    useCountUp(critical, 1000),
    useCountUp(high,     1000),
    useCountUp(medium,   1000),
    useCountUp(safe,     1000),
  ];

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {/* All gauge content inside SVG — no negative margins, no overlap */}
      <svg width="140" height="100" viewBox="0 0 140 100">
        {/* Background track */}
        <path d={arcPath} fill="none" stroke="#2a3a4a" strokeWidth="10" strokeLinecap="round" />
        {/* Safety fill */}
        <path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.5s ease, stroke 0.3s ease" }}
        />
        {/* Side labels */}
        <text x="14"  y={cy + 18} fontSize="10" fill="#6B7280" textAnchor="middle">0</text>
        <text x="126" y={cy + 18} fontSize="10" fill="#6B7280" textAnchor="middle">100</text>
        {/* Score number centred in the arc bowl */}
        <text x={cx} y={cy - 14} fontSize="34" fontWeight="700" fill={color} textAnchor="middle" fontFamily="Georgia, serif">
          {safetyScore}
        </text>
        {/* "out of 100" */}
        <text x={cx} y={cy - 1} fontSize="10" fill="#6B7280" textAnchor="middle" fontFamily="system-ui">
          out of 100
        </text>
        {/* Verdict label */}
        <text x={cx} y={cy + 36} fontSize="11" fontWeight="600" fill={color} textAnchor="middle" fontFamily="system-ui" letterSpacing="1">
          {label}
        </text>
        {/* "SAFETY SCORE" subtitle */}
        <text x={cx} y={cy + 50} fontSize="9" fill="#6B7280" textAnchor="middle" fontFamily="system-ui" letterSpacing="1">
          SAFETY SCORE
        </text>
      </svg>

      {/* Stat boxes — muted when count is 0 */}
      <div className="grid grid-cols-2 gap-2 w-full">
        {stats.map(({ label: l, bg, border, text, count }, i) => {
          const isEmpty = count === 0;
          return (
            <div
              key={l}
              className="rounded-lg p-2 text-center"
              style={{
                backgroundColor: isEmpty ? "rgba(255,255,255,0.03)" : bg,
                border: `1px solid ${isEmpty ? "rgba(255,255,255,0.07)" : border}`,
              }}
            >
              <div className="text-xl font-bold" style={{ color: isEmpty ? "#4b5563" : text, fontFamily: "Georgia, serif" }}>
                {animCounts[i]}
              </div>
              <div className="text-[9px] tracking-widest" style={{ color: isEmpty ? "#4b5563" : text, opacity: isEmpty ? 0.6 : 0.7 }}>
                {l}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
