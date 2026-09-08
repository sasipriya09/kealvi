"use client";

import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";
import { getCurrentUser, UserProfile } from "@/lib/auth";

import AIRecapModal from "@/components/ai-recap-modal";
import MergeQuestionsModal from "@/components/merge-questions-modal";

export type AnswerItem = {
  id: string;
  question_id: string;
  body: string;
  author: string;
  role?: string;
  created_at: string;
};

export type QuestionItem = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
  quality_score: number;
  duplicate_count: number;
  options?: string[];
  correct_option_index?: number;
  explanation?: string;
  status?: "unanswered" | "answered";
  answers?: AnswerItem[];
  merged_ids?: string[];
  is_merged?: boolean;
};

type FilterType = "all" | "top" | "unanswered" | "answered";

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: QuestionItem[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Option State: map of question ID to selected option index
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});

  // Expanded answer drawers: map of question ID to boolean
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});

  // User Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Live Auto-polling state
  const [liveSync, setLiveSync] = useState(true);

  // Filter tab state
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Modals state
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const [mergeTargetQuestion, setMergeTargetQuestion] = useState<QuestionItem | null>(null);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setCurrentUser(getCurrentUser());

    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener("kealvi_auth_change", handleAuthChange);
    return () => {
      window.removeEventListener("kealvi_auth_change", handleAuthChange);
    };
  }, []);

  const refreshQuestions = async () => {
    try {
      const url = query
        ? `/api/questions?q=${encodeURIComponent(query)}`
        : `/api/questions`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.questions || []);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error("Refresh error:", err);
    }
  };

  // Search filter effect
  useEffect(() => {
    const id = setTimeout(refreshQuestions, 300);
    return () => clearTimeout(id);
  }, [query]);

  // Live Sync auto-polling every 4 seconds
  useEffect(() => {
    if (!liveSync || query) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/questions");
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions((prev) => {
            return data.questions.map((newQ: QuestionItem) => {
              const existing = prev.find((p) => p.id === newQ.id);
              return {
                ...newQ,
                answers:
                  existing?.answers && existing.answers.length > (newQ.answers?.length || 0)
                    ? existing.answers
                    : newQ.answers || [],
              };
            });
          });
        }
      } catch (err) {
        console.error("Live sync fetch error:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [liveSync, query]);

  async function improveQuestion() {
    if (!draft.trim()) return;
    setIsImproving(true);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: draft }),
      });
      const data = await res.json();
      if (data.improvedQuestion) {
        setDraft(data.improvedQuestion);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsImproving(false);
    }
  }

  async function submit() {
    if (!draft.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const authorName = currentUser?.name || "Student Participant";

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft, author: authorName }),
      });
      const created = await res.json();

      setQuestions((qs) => [created, ...qs]);
      setDraft("");
    } catch (err) {
      console.error("Submit question error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function upvote(id: string) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q))
    );

    const res = await fetch(`/api/questions/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: getVoterId() }),
    });

    if (!res.ok) {
      setQuestions((qs) =>
        qs.map((q) => (q.id === id ? { ...q, votes: q.votes - 1 } : q))
      );
    }
  }

  async function loadMore() {
    setLoading(true);
    const res = await fetch(`/api/questions?offset=${questions.length}`);
    const data = await res.json();
    setQuestions((qs) => [...qs, ...(data.questions || [])]);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  const toggleAnswerDrawer = (id: string) => {
    setExpandedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectOption = (questionId: string, optIndex: number) => {
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optIndex }));
  };

  const filteredQuestions = questions
    .filter((q) => {
      if (q.is_merged) return false;
      if (activeFilter === "unanswered") return q.status !== "answered";
      if (activeFilter === "answered")
        return q.status === "answered" || (q.answers && q.answers.length > 0);
      return true;
    })
    .sort((a, b) => {
      if (activeFilter === "top") return b.votes - a.votes;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-[#0e1126]/90 p-4 shadow-[0_0_25px_rgba(139,92,246,0.1)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 font-bold text-slate-950 shadow-[0_0_15px_rgba(139,92,246,0.4)] font-[family-name:var(--font-heading)] text-lg">
            🎓
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-[family-name:var(--font-heading)]">
              Student Q&amp;A Room
            </h2>
            <p className="text-xs text-slate-400">
              {currentUser
                ? `Logged in as ${currentUser.name}`
                : "Ask questions, select 4-choice answers & view explanations"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsRecapOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/50 px-3.5 py-2 text-xs font-bold text-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all hover:bg-purple-900/80 hover:scale-105 font-[family-name:var(--font-heading)]"
          >
            📝 Session Summary
          </button>
        </div>
      </div>

      {/* Ask Question Box */}
      <div className="rounded-2xl border border-purple-500/30 bg-[#0e1126] p-4.5 shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all focus-within:border-purple-400/60 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5 tracking-wide font-[family-name:var(--font-heading)]">
            💬 Ask a Student Question
          </span>
          {currentUser && (
            <span className="text-[11px] text-purple-300 font-semibold">
              Asking as {currentUser.name}
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type your question (e.g. How does React Server Components work?)"
            className="flex-1 rounded-xl border border-purple-500/20 bg-[#070913] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-400 focus:bg-[#0a0d20]"
          />

          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={isSubmitting || !draft.trim()}
              className="rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-40 font-[family-name:var(--font-heading)]"
            >
              {isSubmitting ? "Asking…" : "Ask Question"}
            </button>

            <button
              onClick={improveQuestion}
              disabled={isImproving || !draft.trim()}
              className="rounded-xl border border-purple-500/40 bg-purple-950/40 px-4 py-2.5 text-sm font-semibold text-purple-300 transition-colors hover:bg-purple-900/60 disabled:opacity-40 font-[family-name:var(--font-heading)]"
              title="Refine and polish question wording"
            >
              {isImproving ? "Refining…" : "✨ Smart Refine"}
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search + Live Sync Toggle + Filter Tabs */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student questions..."
              className="w-full rounded-xl border border-purple-500/20 bg-[#0e1126] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-400"
            />
          </div>

          <button
            onClick={() => setLiveSync(!liveSync)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all font-[family-name:var(--font-heading)] ${
              liveSync
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "border-purple-500/20 bg-[#0e1126] text-slate-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                liveSync ? "animate-pulse bg-emerald-400" : "bg-slate-500"
              }`}
            />
            {liveSync ? "Live Feed: Active" : "Live Feed: Paused"}
          </button>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5 text-xs font-[family-name:var(--font-heading)]">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveFilter("all")}
              className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                activeFilter === "all"
                  ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                  : "text-slate-400 hover:bg-[#0e1126] hover:text-slate-200"
              }`}
            >
              All ({questions.filter((q) => !q.is_merged).length})
            </button>

            <button
              onClick={() => setActiveFilter("top")}
              className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                activeFilter === "top"
                  ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                  : "text-slate-400 hover:bg-[#0e1126] hover:text-slate-200"
              }`}
            >
              🔥 Top Voted
            </button>
          </div>

          <span className="hidden sm:inline text-[11px] text-purple-300 font-medium">
            {hydrated ? "Realtime Q&A Active ✓" : "Syncing..."}
          </span>
        </div>
      </div>

      {/* NovaGlow Questions Feed (4 Multiple Choice Options) */}
      <ul className="space-y-4">
        {filteredQuestions.map((q) => {
          const answersList = q.answers || [];
          const isExpanded = expandedAnswers[q.id] || false;
          const hasMerged = q.merged_ids && q.merged_ids.length > 0;
          const optionsList = q.options && q.options.length >= 4 ? q.options : [
            `Option A: Primary solution`,
            `Option B: Alternative design`,
            `Option C: Traditional approach`,
            `Option D: Performance pattern`
          ];
          const correctIdx = typeof q.correct_option_index === "number" ? q.correct_option_index : 0;
          const selectedIdx = selectedOptions[q.id];
          const hasSelected = typeof selectedIdx === "number";

          return (
            <li
              key={q.id}
              className="group relative rounded-2xl border border-purple-500/20 bg-[#0e1126] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all hover:border-purple-400/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]"
            >
              <div className="flex items-start gap-4">
                {/* Upvote Counter */}
                <button
                  onClick={() => upvote(q.id)}
                  className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-purple-500/30 bg-[#070913] px-3.5 py-2.5 text-purple-300 transition-all hover:border-purple-400 hover:bg-purple-950/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-95 font-[family-name:var(--font-heading)]"
                  title="Upvote question"
                >
                  <span className="text-xs leading-none">▲</span>
                  <span className="text-sm font-extrabold tabular-nums">
                    {q.votes}
                  </span>
                </button>

                {/* Question Body & Content */}
                <div className="min-w-0 flex-1 pt-0.5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base font-bold leading-snug text-slate-100 font-[family-name:var(--font-heading)]">
                      {q.body}
                    </p>
                  </div>

                  {/* 4 Multiple-Choice Options (A, B, C, D) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-[family-name:var(--font-heading)]">
                    {optionsList.map((optText, idx) => {
                      const isOptionSelected = selectedIdx === idx;
                      const isCorrectOption = idx === correctIdx;

                      let btnStyle = "border-purple-500/20 bg-[#070913] text-slate-200 hover:border-purple-400/60 hover:bg-[#0c0f24]";

                      if (hasSelected) {
                        if (isOptionSelected && isCorrectOption) {
                          btnStyle = "border-emerald-500/80 bg-emerald-950/60 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                        } else if (isOptionSelected && !isCorrectOption) {
                          btnStyle = "border-red-500/80 bg-red-950/60 text-red-200 font-bold";
                        } else if (isCorrectOption) {
                          btnStyle = "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-semibold";
                        } else {
                          btnStyle = "border-white/5 bg-[#04050a]/60 text-slate-500 opacity-60";
                        }
                      }

                      const labelChar = String.fromCharCode(65 + idx); // A, B, C, D

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(q.id, idx)}
                          className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs text-left transition-all ${btnStyle}`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono font-bold text-xs ${
                              hasSelected && isOptionSelected
                                ? isCorrectOption
                                  ? "bg-emerald-400 text-slate-950"
                                  : "bg-red-400 text-slate-950"
                                : "bg-purple-950 text-purple-300 border border-purple-500/30"
                            }`}
                          >
                            {labelChar}
                          </span>
                          <span className="flex-1 leading-snug">{optText}</span>
                          {hasSelected && isOptionSelected && (
                            <span className="text-xs shrink-0">
                              {isCorrectOption ? "✅ Correct" : "❌ Incorrect"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Metadata Chips & Actions */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-purple-500/20 pt-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20"
                        title="Community rating based on depth and clarity"
                      >
                        ⭐ Rating: {q.quality_score}/100
                      </span>

                      <span
                        className="inline-flex items-center gap-1 font-semibold text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20"
                        title="Similar questions asked in room"
                      >
                        🔁 Similar: {q.duplicate_count}
                      </span>

                      {hasMerged && (
                        <span className="inline-flex items-center gap-1 font-bold text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                          🔗 Merged ({q.merged_ids?.length} aggregated)
                        </span>
                      )}

                      {q.duplicate_count > 0 && (
                        <button
                          onClick={() => setMergeTargetQuestion(q)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded transition-all hover:bg-amber-900/60 font-[family-name:var(--font-heading)]"
                          title="Merge similar duplicate questions into this thread"
                        >
                          🔗 Merge Duplicates
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => toggleAnswerDrawer(q.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-purple-200 transition-colors ml-auto font-[family-name:var(--font-heading)]"
                    >
                      <span>💡 {isExpanded ? "Hide Answer & Explanation" : "View Answer & Explanation"}</span>
                      <span className="text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                    </button>
                  </div>

                  {/* Answer & Explanation Drawer */}
                  {isExpanded && (
                    <div className="mt-3 space-y-3 rounded-xl border border-purple-500/20 bg-[#070913] p-4 text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold font-[family-name:var(--font-heading)]">
                        <span>✅ Correct Answer: Option {String.fromCharCode(65 + correctIdx)}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed bg-[#0e1126] p-3 rounded-lg border border-purple-500/20 font-mono text-[11px]">
                        {q.explanation || (answersList[0]?.body ?? "The primary solution addresses the question requirements efficiently.")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {filteredQuestions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-purple-500/20 p-10 text-center bg-[#0e1126]/50">
          <p className="text-sm font-semibold text-slate-200 font-[family-name:var(--font-heading)]">No questions found</p>
          <p className="mt-1 text-xs text-slate-400">
            {query
              ? `No questions matched "${query}"`
              : "Be the first student to submit a question above!"}
          </p>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-xl border border-purple-500/30 bg-[#0e1126] px-5 py-2.5 text-sm font-bold text-purple-300 transition-all hover:border-purple-400 hover:bg-purple-950/40 disabled:opacity-40 font-[family-name:var(--font-heading)]"
          >
            {loading ? "Loading…" : "Load More Questions"}
          </button>
        </div>
      )}

      {/* Session Summary Modal */}
      <AIRecapModal
        isOpen={isRecapOpen}
        onClose={() => setIsRecapOpen(false)}
      />

      {/* Merge Questions Modal */}
      <MergeQuestionsModal
        targetQuestion={mergeTargetQuestion}
        allQuestions={questions}
        isOpen={!!mergeTargetQuestion}
        onClose={() => setMergeTargetQuestion(null)}
        onMerged={refreshQuestions}
      />
    </div>
  );
}
