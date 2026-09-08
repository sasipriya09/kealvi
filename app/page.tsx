import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:py-12 space-y-10">
      {/* Main Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#0e1126] via-[#090b1a] to-[#070913] p-8 sm:p-12 shadow-[0_0_50px_rgba(139,92,246,0.15)] text-center">
        {/* NovaGlow ambient background glows */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-950/80 px-4 py-1.5 text-xs font-bold text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.25)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            STUDENT LEARNING HUB
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-[family-name:var(--font-heading)]">
            Interactive Student Q&amp;A &amp; <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              Multiple-Choice Learning
            </span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Ask questions in real-time, test your comprehension with instant 4-choice questions, and get clear answers with your class.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 font-[family-name:var(--font-heading)]">
            <Link
              href="/live"
              className="group flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-7 py-3.5 text-base font-extrabold text-white shadow-[0_0_30px_rgba(139,92,246,0.45)] transition-all hover:scale-105"
            >
              <span>🎓 Join Student Q&amp;A Room</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interesting Student Learning Perks / Interactive Feature Highlights */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white font-[family-name:var(--font-heading)]">
            Explore Study Features
          </h2>
          <p className="text-xs text-slate-400">Everything designed for quick, clear student practice</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <Link
            href="/live"
            className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-[#0e1126] p-6 shadow-xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:-translate-y-1"
          >
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-violet-600/10 blur-2xl transition-all group-hover:bg-violet-600/20" />
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-950/60 text-2xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                🎯
              </div>
              <span className="text-xs font-bold text-violet-400 font-[family-name:var(--font-heading)] group-hover:translate-x-1 transition-transform">
                Practice →
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-white font-[family-name:var(--font-heading)]">
              4-Option Practice
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Solve multiple-choice questions with choices A, B, C, D and get instant feedback with step-by-step explanations.
            </p>
          </Link>

          {/* Card 2 */}
          <Link
            href="/live"
            className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-[#0e1126] p-6 shadow-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:-translate-y-1"
          >
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-cyan-600/10 blur-2xl transition-all group-hover:bg-cyan-600/20" />
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/60 text-2xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                💬
              </div>
              <span className="text-xs font-bold text-cyan-400 font-[family-name:var(--font-heading)] group-hover:translate-x-1 transition-transform">
                Ask Now →
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-white font-[family-name:var(--font-heading)]">
              Real-Time Class Q&amp;A
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Post questions during class, vote up peer questions, and see top unanswered topics bubble up automatically.
            </p>
          </Link>

          {/* Card 3 */}
          <Link
            href="/live"
            className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-[#0e1126] p-6 shadow-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:-translate-y-1"
          >
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-600/10 blur-2xl transition-all group-hover:bg-indigo-600/20" />
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-950/60 text-2xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                📝
              </div>
              <span className="text-xs font-bold text-indigo-400 font-[family-name:var(--font-heading)] group-hover:translate-x-1 transition-transform">
                View Summary →
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-white font-[family-name:var(--font-heading)]">
              Session Takeaways
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Review summarized key takeaways and consolidated core concepts after every study session.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
