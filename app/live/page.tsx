import QuestionsList from "@/app/questions-list";
import { getQuestionsPage } from "@/lib/questions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function LiveRoomPage() {
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:py-10">
      <header className="relative overflow-hidden mb-8 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-[#0e1126] via-[#090b1a] to-[#070913] p-6 sm:p-8 backdrop-blur-md shadow-[0_0_40px_rgba(139,92,246,0.12)]">
        {/* NovaGlow ambient radial lights */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-purple-950/80 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(139,92,246,0.2)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            LIVE STUDENT Q&amp;A
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-[family-name:var(--font-heading)]">
            Interactive Q&amp;A Room
          </h1>
        </div>
      </header>

      <QuestionsList initialQuestions={questions} initialHasMore={hasMore} />
    </main>
  );
}
