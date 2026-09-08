"use client";

import { useState } from "react";
import { QuestionItem } from "@/app/questions-list";

type CreatePollModalProps = {
  question: QuestionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPollCreated: () => void;
};

export default function CreatePollModal({
  question,
  isOpen,
  onClose,
  onPollCreated,
}: CreatePollModalProps) {
  const [prompt, setPrompt] = useState(question?.body || "");
  const [options, setOptions] = useState<string[]>([
    "Option A: Recommended Pattern",
    "Option B: Alternative Approach",
    "Option C: Needs Evaluation",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !question) return null;

  function handleOptionChange(index: number, val: string) {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  }

  function addOption() {
    if (options.length < 5) {
      setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
    }
  }

  function removeOption(idx: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  }

  async function handleSubmit() {
    if (!question) return;
    const validOptions = options.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          questionBody: question.body,
          prompt: prompt.trim() || question.body,
          options: validOptions,
        }),
      });

      if (res.ok) {
        onPollCreated();
        onClose();
      }
    } catch (err) {
      console.error("Failed to create poll:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[#0a0e1a] p-6 shadow-[0_0_50px_rgba(0,242,254,0.15)] text-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="text-base font-bold text-white">Convert Question to Live Poll</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-[#06080e] p-3 text-xs">
          <span className="text-slate-400 font-semibold block mb-1">Target Question:</span>
          <p className="text-cyan-300 font-medium">{question.body}</p>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Poll Question / Prompt:
            </label>
            <input
              value={prompt || question.body}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#06080e] px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold">Voting Options (2-5):</label>
              {options.length < 5 && (
                <button
                  onClick={addOption}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  + Add Option
                </button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 w-5">{idx + 1}.</span>
                  <input
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}...`}
                    className="flex-1 rounded-xl border border-white/10 bg-[#06080e] px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(idx)}
                      className="text-red-400 hover:text-red-300 px-1 font-bold"
                      title="Remove option"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-3 text-xs">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-[#0d111a] px-4 py-2 font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || options.filter((o) => o.trim()).length < 2}
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 font-bold text-slate-950 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all hover:scale-105 disabled:opacity-40"
          >
            {isSubmitting ? "Launching Poll..." : "🚀 Launch Live Audience Poll"}
          </button>
        </div>
      </div>
    </div>
  );
}
