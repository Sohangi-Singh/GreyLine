"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

type InputMode = "pdf" | "docx" | "image" | "text" | "url";

interface UploadZoneProps {
  onSubmit: (data: {
    file?: File;
    text?: string;
    url?: string;
    sampleKey?: string;
    documentType: string;
  }) => void;
  loading?: boolean;
}

const MODES: { value: InputMode; label: string }[] = [
  { value: "pdf",   label: "PDF" },
  { value: "docx",  label: "DOCX" },
  { value: "image", label: "Image" },
  { value: "text",  label: "Paste Text" },
  { value: "url",   label: "URL" },
];

const ACCEPT_MAP: Record<InputMode, Record<string, string[]>> = {
  pdf:   { "application/pdf": [".pdf"] },
  docx:  { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
  image: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".tiff"] },
  text:  {},
  url:   {},
};

export default function UploadZone({ onSubmit, loading }: UploadZoneProps) {
  const [mode, setMode]         = useState<InputMode>("pdf");
  const [text, setText]         = useState("");
  const [url, setUrl]           = useState("");
  const [file, setFile]         = useState<File | null>(null);
  const [dragError, setDragError] = useState("");

  const onDrop = useCallback(
    (accepted: File[], rejected: { file: File }[]) => {
      if (rejected.length > 0) {
        setDragError(`File type not accepted for ${mode.toUpperCase()}`);
        return;
      }
      setDragError("");
      if (accepted[0]) setFile(accepted[0]);
    },
    [mode]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mode !== "text" && mode !== "url" ? ACCEPT_MAP[mode] : undefined,
    multiple: false,
    disabled: mode === "text" || mode === "url" || !!loading,
  });

  const handleSubmit = () => {
    if (mode === "text" && text.trim()) {
      onSubmit({ text, documentType: "text" });
    } else if (mode === "url" && url.trim()) {
      onSubmit({ url, documentType: "url" });
    } else if (file) {
      onSubmit({ file, documentType: mode });
    }
  };

  const isReady =
    (mode === "text" && text.trim().length > 20) ||
    (mode === "url"  && url.trim().startsWith("http")) ||
    (["pdf", "docx", "image"].includes(mode) && file !== null);

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-6" style={{ backgroundColor: "var(--bg-base)", borderRadius: "var(--r-sm)", padding: "3px" }}>
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => { setMode(m.value); setFile(null); setDragError(""); }}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.02em",
              transition: "all 0.15s ease",
              backgroundColor: mode === m.value ? "var(--bg-elevated)" : "transparent",
              color: mode === m.value ? "var(--sage)" : "var(--text-muted)",
              border: mode === m.value ? "1px solid var(--border-medium)" : "1px solid transparent",
              cursor: "pointer",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      {mode !== "text" && mode !== "url" ? (
        <div
          {...getRootProps()}
          className={`relative text-center transition-all duration-300 ${!file && !isDragActive ? "gl-border-breathe" : ""}`}
          style={{
            padding: "40px 24px",
            borderRadius: "var(--r-md)",
            cursor: loading ? "not-allowed" : "pointer",
            border: `1px dashed ${
              isDragActive ? "var(--flora)"
              : file        ? "var(--risk-safe)"
              : "var(--border-medium)"
            }`,
            backgroundColor: isDragActive
              ? "var(--flora-dim)"
              : file
              ? "rgba(122, 158, 138, 0.06)"
              : "var(--bg-base)",
          }}
        >
          <input {...getInputProps()} />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--risk-safe)" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{file.name}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {(file.size / 1024).toFixed(0)} KB
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                style={{
                  marginTop: "4px",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--flora)" strokeWidth="1.2" opacity="0.6">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9"  y1="15" x2="15" y2="15" />
              </svg>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                {isDragActive ? "Release to analyze" : `Drop your ${mode.toUpperCase()}`}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>or click to browse files</div>
            </div>
          )}

          {dragError && (
            <p style={{ marginTop: "12px", fontSize: "11px", color: "var(--risk-critical)" }}>{dragError}</p>
          )}
        </div>

      ) : mode === "text" ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste any legal or quasi-legal document text here…"
          style={{
            width: "100%",
            minHeight: "180px",
            padding: "16px",
            borderRadius: "var(--r-md)",
            fontSize: "13px",
            lineHeight: 1.65,
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-base)",
            border: "1px solid var(--border-medium)",
            resize: "vertical",
            outline: "none",
            fontFamily: "var(--font-sans)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--flora)")}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border-medium)")}
        />
      ) : (
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && isReady && handleSubmit()}
          placeholder="https://example.com/terms-of-service"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "var(--r-md)",
            fontSize: "13px",
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-base)",
            border: "1px solid var(--border-medium)",
            outline: "none",
            fontFamily: "var(--font-sans)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--flora)")}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border-medium)")}
        />
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isReady || !!loading}
        style={{
          width: "100%",
          marginTop: "16px",
          padding: "13px 24px",
          borderRadius: "var(--r-md)",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          transition: "all 0.2s ease",
          cursor: isReady && !loading ? "pointer" : "not-allowed",
          backgroundColor: isReady && !loading ? "var(--flora)" : "var(--bg-elevated)",
          color: isReady && !loading ? "#1A1916" : "var(--text-disabled)",
          border: `1px solid ${isReady && !loading ? "var(--flora)" : "var(--border)"}`,
        }}
        onMouseEnter={(e) => {
          if (isReady && !loading) {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sage)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--sage)";
          }
        }}
        onMouseLeave={(e) => {
          if (isReady && !loading) {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--flora)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--flora)";
          }
        }}
      >
        {loading ? "Analysing…" : "Analyse Document"}
      </button>
    </div>
  );
}
