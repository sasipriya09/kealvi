"use client";

import { useEffect, useState, useCallback } from "react";
import { LivePoll } from "@/lib/polls";
import { getVoterId } from "@/lib/voter";

export default function PollsWidget({ limit }: { limit?: number }) {
  const [polls, setPolls] = useState<LivePoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingMap, setVotingMap] = useState<Record<string, boolean>>({});

  const fetchPolls = useCallback(async () => {
    try {
      const res = await fetch("/api/polls");
      const data = await res.json();
      if (data.polls) {
        setPolls(data.polls);
      }
    } catch (err) {
      console.error("Error fetching live polls:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls();
    const interval = setInterval(fetchPolls, 3500);
    return () => clearInterval(interval);
  }, [fetchPolls]);

  async function handleVote(pollId: string, optionId: string) {
    setVotingMap((prev) => ({ ...prev, [pollId]: true }));
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId,
          voterId: getVoterId(),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setPolls((prev) => prev.map((p) => (p.id === pollId ? updated : p)));
      }
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setVotingMap((prev) => ({ ...prev, [pollId]: false }));
    }
  }

  if (loading && polls.length === 0) {
    return (
      <div className="rounded-2xl border border-cyan-500/20 bg-[#0d111a] p-4 text-center text-xs text-slate-400">
        Loading active audience polls...
      </div>
    );
  }

  if (polls.length === 0) {
    return null;
  }

  const displayedPolls = limit ? polls.slice(0, limit) : polls;

  return (
    <div className="space-y-4">
      {displayedPolls.map((poll) => {
        const voterId = typeof window !== "undefined" ? getVoterId() : "";
        const hasVoted = poll.voted_users.includes(voterId);

        return (
          <div
            key={poll.id}
            className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0c101a] p-5 shadow-[0_4px_25px_rgba(0,242,254,0.08)] transition-all hover:border-cyan-400/50"
          >
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-all" />

            <div className="relative z-10 space-y-3.5">
              {/* Header Badge & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/80 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,254,0.2)]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                    📊 LIVE AUDIENCE POLL
                  </span>
                  {hasVoted && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      ✓ Vote Recorded
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {poll.total_votes} Total Votes
                </span>
              </div>

              {/* Poll Question Prompt */}
              <h3 className="text-sm font-bold text-slate-100 leading-snug">
                {poll.prompt}
              </h3>

              {/* Options & Progress Bars */}
              <div className="space-y-2.5 pt-1">
                {poll.options.map((opt) => {
                  const percentage =
                    poll.total_votes > 0
                      ? Math.round((opt.votes / poll.total_votes) * 100)
                      : 0;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleVote(poll.id, opt.id)}
                      disabled={votingMap[poll.id]}
                      className="group/opt relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#06080e] p-3 text-left transition-all hover:border-cyan-400/60 active:scale-[0.99] disabled:opacity-80"
                    >
                      {/* Animated Progress Fill */}
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/30 transition-all duration-700 ease-out group-hover/opt:from-cyan-500/30 group-hover/opt:to-blue-500/40"
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-slate-200 group-hover/opt:text-cyan-200 transition-colors">
                          {opt.text}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {opt.votes} votes
                          </span>
                          <span className="font-extrabold text-cyan-400 tabular-nums min-w-[35px] text-right">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
