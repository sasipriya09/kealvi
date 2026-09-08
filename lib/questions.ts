import { supabase } from "@/lib/supabase";

export type Answer = {
  id: string;
  question_id: string;
  body: string;
  author: string;
  role?: string;
  created_at: string;
};

export type QuestionWithMeta = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
  quality_score: number;
  duplicate_count: number;
  options: string[];
  correct_option_index: number;
  explanation?: string;
  status: "unanswered" | "answered";
  answers: Answer[];
  created_at: string;
  merged_ids?: string[];
  is_merged?: boolean;
};

// Default seed questions with 4 multiple-choice options (A, B, C, D)
const SEED_QUESTIONS: QuestionWithMeta[] = [
  {
    id: "q_seed_1",
    body: "How do React 19 Server Components improve real-time performance in live Q&A sessions?",
    author: "Dr. Sarah Chen",
    votes: 24,
    quality_score: 96,
    duplicate_count: 0,
    options: [
      "Server components execute on server node, reducing client JS bundle and streaming HTML directly",
      "They cache all app data inside browser LocalStorage automatically",
      "They convert React JSX into WebAssembly binaries at runtime",
      "They require a dedicated GraphQL proxy layer for client rendering"
    ],
    correct_option_index: 0,
    explanation: "Server components execute exclusively on the server node, reducing client JavaScript bundle size and streaming HTML directly with zero client rendering delay.",
    status: "answered",
    answers: [
      {
        id: "ans_seed_1",
        question_id: "q_seed_1",
        body: "Server components execute exclusively on the server node, reducing client JavaScript bundle size and streaming HTML directly with zero client rendering delay.",
        author: "Dr. Sarah Chen",
        role: "student",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "q_seed_2",
    body: "What is the best pattern to prevent duplicate voting in Supabase without performance bottlenecks?",
    author: "Alex Rivera",
    votes: 18,
    quality_score: 91,
    duplicate_count: 1,
    options: [
      "Client-side alert popups with window.reload()",
      "Row Level Security (RLS) paired with atomic UPSERT triggers or voter ID tokens",
      "Clearing browser cookies on every page refresh",
      "Disabling database indexes on the votes table"
    ],
    correct_option_index: 1,
    explanation: "Row Level Security (RLS) policies paired with atomic voter token verification prevents duplicate votes at the database layer with sub-millisecond execution time.",
    status: "unanswered",
    answers: [],
    created_at: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: "q_seed_3",
    body: "How does Postgres GIN full-text index compare to vector embeddings for live duplicate detection?",
    author: "Priya Sharma",
    votes: 15,
    quality_score: 94,
    duplicate_count: 0,
    options: [
      "GIN indexes do not support text columns",
      "GIN tsvector handles sub-ms keyword matching, while vector embeddings detect semantic similarity",
      "Vector embeddings are only supported in Python environments",
      "Both indexing methods produce identical search score rankings"
    ],
    correct_option_index: 1,
    explanation: "GIN tsvector indexes excel at keyword lexical matching with sub-millisecond execution times, while vector embeddings detect semantic similarity regardless of wording.",
    status: "answered",
    answers: [
      {
        id: "ans_seed_3",
        question_id: "q_seed_3",
        body: "GIN tsvector indexes excel at keyword lexical matching with sub-millisecond execution times, while vector embeddings detect semantic similarity regardless of wording.",
        author: "Dr. Sarah Chen",
        role: "student",
        created_at: new Date(Date.now() - 2700000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "q_seed_4",
    body: "Can we configure automatic real-time WebSocket subscriptions with Supabase row level security?",
    author: "Diego Morales",
    votes: 11,
    quality_score: 87,
    duplicate_count: 0,
    options: [
      "Yes, Supabase Realtime automatically respects RLS policies for subscribed channels",
      "No, real-time WebSockets bypass database security completely",
      "Only if using Firebase authentication instead of Supabase",
      "WebSockets require disabling RLS on all database tables"
    ],
    correct_option_index: 0,
    explanation: "Supabase Realtime integrates directly with Postgres WAL and RLS policies to broadcast row changes safely to authorized clients.",
    status: "unanswered",
    answers: [],
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "q_seed_5",
    body: "How do Gemini models calculate quality scores for incoming questions in under 200ms?",
    author: "Marcus Vance",
    votes: 8,
    quality_score: 89,
    duplicate_count: 2,
    options: [
      "By placing questions into manual human moderation queues",
      "Using low-latency flash models optimized for text scoring and structured JSON output",
      "By checking character length count only",
      "By sending questions through email webhooks"
    ],
    correct_option_index: 1,
    explanation: "Gemini Flash models are optimized for ultra-low latency inference, evaluating text clarity, depth, and relevance in under 200ms.",
    status: "unanswered",
    answers: [],
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
];

// In-memory store for newly posted questions, answers & status overrides
let localQuestionsStore: QuestionWithMeta[] = [...SEED_QUESTIONS];
const inMemoryAnswers = new Map<string, Answer[]>();
const inMemoryStatus = new Map<string, "unanswered" | "answered">();

// Initialize seed answers into inMemoryAnswers map
SEED_QUESTIONS.forEach((q) => {
  if (q.answers && q.answers.length > 0) {
    inMemoryAnswers.set(q.id, q.answers);
  }
  if (q.status) {
    inMemoryStatus.set(q.id, q.status);
  }
});

export function getQuestionAnswers(questionId: string): Answer[] {
  return inMemoryAnswers.get(questionId) || [];
}

export function addQuestionAnswer(
  questionId: string,
  answer: Omit<Answer, "id" | "created_at">
): Answer {
  const newAnswer: Answer = {
    ...answer,
    id: "ans_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
    created_at: new Date().toISOString(),
  };

  const list = inMemoryAnswers.get(questionId) || [];
  list.push(newAnswer);
  inMemoryAnswers.set(questionId, list);

  // automatically mark question as answered
  inMemoryStatus.set(questionId, "answered");

  // update local store if present
  localQuestionsStore = localQuestionsStore.map((q) => {
    if (q.id === questionId) {
      return {
        ...q,
        status: "answered",
        answers: list,
      };
    }
    return q;
  });

  return newAnswer;
}

export function setQuestionStatus(questionId: string, status: "unanswered" | "answered") {
  inMemoryStatus.set(questionId, status);
  localQuestionsStore = localQuestionsStore.map((q) => {
    if (q.id === questionId) {
      return { ...q, status };
    }
    return q;
  });
}

export function addLocalQuestion(question: QuestionWithMeta) {
  localQuestionsStore = [question, ...localQuestionsStore];
}

export async function getQuestionsPage(offset: number, limit: number) {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id, body, author, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit);

    if (error || !data || data.length === 0) {
      const rows = localQuestionsStore
        .filter((q) => !q.is_merged)
        .map((q) => {
          const answers = inMemoryAnswers.get(q.id) || q.answers || [];
          const status = inMemoryStatus.get(q.id) || (answers.length > 0 ? "answered" : "unanswered");
          return {
            ...q,
            status,
            answers,
          };
        });

      const hasMore = rows.length > offset + limit;
      return {
        questions: rows.slice(offset, offset + limit),
        hasMore,
      };
    }

    // Process Supabase database rows
    const supabaseRows: QuestionWithMeta[] = data
      .map((q) => {
        const answers = inMemoryAnswers.get(q.id) || [];
        const status = inMemoryStatus.get(q.id) || (answers.length > 0 ? "answered" : "unanswered");
        const existingLocal = localQuestionsStore.find((l) => l.id === q.id);

        return {
          id: q.id,
          body: q.body,
          author: q.author || "Anonymous Student",
          quality_score: existingLocal?.quality_score ?? 88,
          duplicate_count: existingLocal?.duplicate_count ?? 0,
          options: existingLocal?.options || [
            `Option A: ${q.body.slice(0, 30)}...`,
            "Option B: Standard pattern implementation",
            "Option C: Alternative architecture choice",
            "Option D: Performance optimized approach",
          ],
          correct_option_index: existingLocal?.correct_option_index ?? 0,
          explanation: existingLocal?.explanation || existingLocal?.answers[0]?.body || "Standard answer explanation.",
          votes: existingLocal?.votes ?? 1,
          status,
          answers,
          created_at: q.created_at || new Date().toISOString(),
          merged_ids: existingLocal?.merged_ids,
          is_merged: existingLocal?.is_merged,
        };
      })
      .filter((q) => !q.is_merged);

    const supabaseIds = new Set(supabaseRows.map((s) => s.id));
    const onlyLocal = localQuestionsStore.filter((l) => !supabaseIds.has(l.id) && !l.is_merged);
    const merged = [...onlyLocal, ...supabaseRows];

    const hasMore = merged.length > offset + limit;

    return {
      questions: merged.slice(offset, offset + limit),
      hasMore,
    };
  } catch (err) {
    console.error("Error in getQuestionsPage:", err);

    const validLocal = localQuestionsStore.filter((q) => !q.is_merged);
    return {
      questions: validLocal.slice(offset, offset + limit),
      hasMore: validLocal.length > offset + limit,
    };
  }
}

export async function searchQuestions(q: string, limit: number) {
  const queryLower = q.toLowerCase();
  const filtered = localQuestionsStore.filter(
    (item) =>
      !item.is_merged &&
      (item.body.toLowerCase().includes(queryLower) ||
        (item.author && item.author.toLowerCase().includes(queryLower)))
  );

  return filtered.slice(0, limit);
}

export function mergeQuestions(targetId: string, duplicateIds: string[]) {
  const target = localQuestionsStore.find((q) => q.id === targetId);
  if (!target) return null;

  let addedVotes = 0;
  duplicateIds.forEach((id) => {
    const dupe = localQuestionsStore.find((q) => q.id === id);
    if (dupe) {
      addedVotes += dupe.votes;
    }
  });

  localQuestionsStore = localQuestionsStore.map((q) => {
    if (q.id === targetId) {
      const merged_ids = Array.from(
        new Set([...(q.merged_ids || []), ...duplicateIds])
      );
      return {
        ...q,
        votes: q.votes + Math.max(addedVotes, 1),
        duplicate_count: Math.max(0, q.duplicate_count - duplicateIds.length),
        merged_ids,
      };
    }
    if (duplicateIds.includes(q.id)) {
      return {
        ...q,
        is_merged: true,
      };
    }
    return q;
  });

  return localQuestionsStore.find((q) => q.id === targetId);
}