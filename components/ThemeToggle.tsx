"use client";

import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "var(--r-sm)",
        border: "1px solid var(--border-medium)",
        backgroundColor: "var(--bg-elevated)",
        color: "var(--text-muted)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.02em",
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--flora-border)";
        el.style.color = "var(--flora)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border-medium)";
        el.style.color = "var(--text-muted)";
      }}
    >
      {/* Sun icon */}
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{
          opacity: isDark ? 0.4 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2"  x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
        <line x1="2"  y1="12" x2="5"  y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66" />
        <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22" />
      </svg>

      {/* Track */}
      <div
        style={{
          position: "relative",
          width: "28px",
          height: "16px",
          borderRadius: "8px",
          backgroundColor: isDark ? "var(--bg-base)" : "var(--flora-dim)",
          border: "1px solid var(--border-strong)",
          transition: "background-color 0.2s ease",
          flexShrink: 0,
        }}
      >
        {/* Thumb */}
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: isDark ? "2px" : "12px",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "var(--flora)",
            transition: "left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>

      {/* Moon icon */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{
          opacity: isDark ? 1 : 0.4,
          transition: "opacity 0.2s ease",
        }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
