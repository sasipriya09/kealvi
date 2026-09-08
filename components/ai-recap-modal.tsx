"use client";

import { useState } from "react";

type AIRecapModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AIRecapModal({ isOpen, onClose }: AIRecapModalProps) {
  const [loading, setLoading] = useState(false);
  const [recap, setRecap] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  async function generateRecap() {
    setLoading(true);
    setRecap(null);
    try {
      const res = await fetch("/api/recap", { method: "POST" });
      const data = await res.json();
      setRecap(data.recapMarkdown || "No summary generated.");
    } catch (err) {
      console.error(err);
      setRecap("Failed to generate session recap. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!recap) return;
    navigator.clipboard.writeText(recap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!recap) return;
    const blob = new Blob([recap], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Kealvi_Session_Recap_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 font-[family-name:var(--font-heading)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-300 text-lg shadow-sm">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Session Takeaways &amp; Executive Summary
              </h2>
              <p className="text-xs text-slate-400">
                Synthesize key technical insights, answered questions &amp; action items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4 text-xs leading-relaxed">
          {!recap && !loading && (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-950/60 border border-blue-500/30 text-2xl text-blue-400">
                📝
              </div>
              <p className="text-sm font-semibold text-slate-200 font-[family-name:var(--font-heading)]">
                Ready to generate live session key takeaways?
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Generates a clean markdown executive report of answered questions, discussions, and upvoted topics.
              </p>
              <button
                onClick={generateRecap}
                className="mt-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-3 font-bold text-white shadow-md transition-all hover:opacity-95 font-[family-name:var(--font-heading)]"
              >
                ⚡ Generate Session Summary Now
              </button>
            </div>
          )}

          {loading && (
            <div className="py-16 text-center space-y-4">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
              <p className="text-sm font-bold text-blue-300 animate-pulse font-[family-name:var(--font-heading)]">
                Analyzing session Q&amp;A data...
              </p>
              <p className="text-xs text-slate-400">Extracting core insights and action items...</p>
            </div>
          )}

          {recap && !loading && (
            <div className="rounded-xl border border-slate-800 bg-[#090d16] p-4 text-slate-300 font-mono space-y-2 select-text whitespace-pre-wrap">
              {recap}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs font-[family-name:var(--font-heading)]">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-[#090d16] px-4 py-2 font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>

          {recap && (
            <div className="flex items-center gap-2">
              <button
                onClick={generateRecap}
                disabled={loading}
                className="rounded-xl border border-purple-500/30 bg-purple-950/40 px-3.5 py-2 font-semibold text-purple-300 hover:bg-purple-900/60 transition-colors"
              >
                🔄 Regenerate
              </button>
              <button
                onClick={handleCopy}
                className="rounded-xl border border-blue-500/30 bg-blue-950/50 px-3.5 py-2 font-semibold text-blue-300 hover:bg-blue-900/60 transition-colors"
              >
                {copied ? "✓ Copied!" : "📋 Copy Markdown"}
              </button>
              <button
                onClick={handleDownload}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-bold text-white shadow-md hover:opacity-95 transition-all"
              >
                📥 Download .md
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
