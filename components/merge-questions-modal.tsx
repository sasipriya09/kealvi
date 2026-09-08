"use client";

import { useState } from "react";
import { QuestionItem } from "@/app/questions-list";

type MergeQuestionsModalProps = {
  targetQuestion: QuestionItem | null;
  allQuestions: QuestionItem[];
  isOpen: boolean;
  onClose: () => void;
  onMerged: () => void;
};

export default function MergeQuestionsModal({
  targetQuestion,
  allQuestions,
  isOpen,
  onClose,
  onMerged,
}: MergeQuestionsModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  if (!isOpen || !targetQuestion) return null;

  const candidates = allQuestions.filter(
    (q) => q.id !== targetQuestion.id
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleMerge() {
    if (!targetQuestion || selectedIds.length === 0) return;

    setIsMerging(true);
    try {
      const res = await fetch("/api/questions/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: targetQuestion.id,
          duplicateIds: selectedIds,
        }),
      });

      if (res.ok) {
        onMerged();
        onClose();
      }
    } catch (err) {
      console.error("Error merging questions:", err);
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl text-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-[family-name:var(--font-heading)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔗</span>
            <h2 className="text-base font-bold text-white">Merge Duplicate Question Threads</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Master Target Question */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs">
          <span className="text-amber-400 font-bold block mb-1 font-[family-name:var(--font-heading)]">Primary Master Question:</span>
          <p className="text-slate-100 font-medium leading-relaxed">{targetQuestion.body}</p>
          <span className="mt-1.5 inline-block text-[10px] text-amber-300/80 font-mono">
            Current Votes: {targetQuestion.votes} | Duplicates detected: {targetQuestion.duplicate_count}
          </span>
        </div>

        {/* Candidate Questions List */}
        <div className="space-y-2 text-xs">
          <label className="block text-slate-300 font-semibold font-[family-name:var(--font-heading)]">
            Select similar questions to merge into master thread:
          </label>

          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {candidates.length > 0 ? (
              candidates.map((q) => {
                const isChecked = selectedIds.includes(q.id);
                return (
                  <label
                    key={q.id}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                      isChecked
                        ? "border-amber-500/60 bg-amber-950/30 text-amber-200"
                        : "border-slate-800 bg-[#090d16] text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(q.id)}
                      className="mt-0.5 rounded accent-amber-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-xs leading-snug">{q.body}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>by {q.author || "Anonymous"}</span>
                        <span>•</span>
                        <span>▲ {q.votes} votes</span>
                      </div>
                    </div>
                  </label>
                );
              })
            ) : (
              <p className="text-slate-400 text-center py-4">No candidate questions available to merge.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs font-[family-name:var(--font-heading)]">
          <span className="text-slate-400 font-mono text-[11px]">
            {selectedIds.length} question(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-[#090d16] px-4 py-2 font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleMerge}
              disabled={isMerging || selectedIds.length === 0}
              className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white shadow-md transition-all hover:bg-amber-500 disabled:opacity-40"
            >
              {isMerging ? "Merging..." : "🔗 Consolidate into Master Thread"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
