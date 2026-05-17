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

export default function UploadZone({ onSubmit, loading }: UploadZoneProps) {
  const [mode, setMode] = useState<InputMode>("pdf");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragError, setDragError] = useState("");

  const acceptMap: Record<InputMode, Record<string, string[]>> = {
    pdf: { "application/pdf": [".pdf"] },
    docx: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    image: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".tiff"] },
    text: {},
    url: {},
  };

  const onDrop = useCallback(
    (accepted: File[], rejected: { file: File }[]) => {
      if (rejected.length > 0) {
        setDragError(`File type not accepted for ${mode.toUpperCase()} mode`);
        return;
      }
      setDragError("");
      if (accepted[0]) setFile(accepted[0]);
    },
    [mode]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mode !== "text" && mode !== "url" ? acceptMap[mode] : undefined,
    multiple: false,
    disabled: mode === "text" || mode === "url" || loading,
  });

  const handleSubmit = () => {
    if (mode === "text") {
      if (!text.trim()) return;
      onSubmit({ text, documentType: "text" });
    } else if (mode === "url") {
      if (!url.trim()) return;
      onSubmit({ url, documentType: "url" });
    } else if (file) {
      onSubmit({ file, documentType: mode });
    }
  };

  const isReady = (mode === "text" && text.trim().length > 20) ||
    (mode === "url" && url.trim().startsWith("http")) ||
    (["pdf", "docx", "image"].includes(mode) && file !== null);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode selector pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {(["pdf", "docx", "image", "text", "url"] as InputMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setFile(null); setDragError(""); }}
            className="px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200"
            style={{
              backgroundColor: mode === m ? "#6366F1" : "transparent",
              borderColor: mode === m ? "#6366F1" : "rgba(99,102,241,0.3)",
              color: mode === m ? "white" : "#818CF8",
            }}
          >
            {m === "pdf" ? "PDF" : m === "docx" ? "DOCX" : m === "image" ? "Image/Photo" : m === "text" ? "Paste Text" : "URL"}
          </button>
        ))}
      </div>

      {/* Upload area */}
      {mode !== "text" && mode !== "url" ? (
        <div
          {...getRootProps()}
          className="relative rounded-xl cursor-pointer transition-all duration-300 p-10 text-center"
          style={{
            border: `2px dashed ${isDragActive ? "#6366F1" : file ? "#22C55E" : "rgba(99,102,241,0.4)"}`,
            backgroundColor: isDragActive ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.03)",
            animation: !file && !isDragActive ? "pulse-border 2s ease-in-out infinite" : "none",
          }}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="text-emerald-400 text-3xl">✓</div>
              <div className="text-sm font-medium text-gray-300">{file.name}</div>
              <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</div>
              <button
                className="text-xs text-gray-500 hover:text-red-400 mt-1"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl text-indigo-400/40">
                {mode === "pdf" ? "📄" : mode === "docx" ? "📝" : "🖼️"}
              </div>
              <div className="text-sm text-gray-400">
                {isDragActive ? "Drop to analyze" : `Drop your ${mode.toUpperCase()} here`}
              </div>
              <div className="text-xs text-gray-600">or click to browse</div>
            </div>
          )}
          {dragError && <div className="text-xs text-red-400 mt-2">{dragError}</div>}
        </div>
      ) : mode === "text" ? (
        <textarea
          className="w-full rounded-xl p-4 text-sm text-gray-300 resize-none focus:outline-none"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(99,102,241,0.3)",
            minHeight: "180px",
          }}
          placeholder="Paste any legal or quasi-legal document text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            className="flex-1 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
            placeholder="https://example.com/terms-of-service"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && isReady && handleSubmit()}
          />
        </div>
      )}

      {/* Submit button */}
      <button
        className="w-full mt-4 py-3 rounded-xl text-sm font-bold tracking-widest transition-all duration-200 disabled:opacity-40"
        style={{
          backgroundColor: isReady && !loading ? "#6366F1" : "rgba(99,102,241,0.2)",
          color: isReady && !loading ? "white" : "#6b7280",
          cursor: isReady && !loading ? "pointer" : "not-allowed",
        }}
        disabled={!isReady || loading}
        onClick={handleSubmit}
      >
        {loading ? "ANALYSING..." : "ANALYSE DOCUMENT →"}
      </button>
    </div>
  );
}
