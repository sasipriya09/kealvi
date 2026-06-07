import { supabase } from "@/lib/supabase";

export async function getQuestionsPage(offset: number, limit: number) {
  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, body, author, quality_score, duplicate_count, created_at, votes(count)"
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) throw new Error(error.message);

  const rows = (data ?? []).map((q) => ({
    id: q.id,
    body: q.body,
    author: q.author,
    quality_score: q.quality_score,
    duplicate_count: q.duplicate_count,
    votes: q.votes?.[0]?.count ?? 0,
  }));

  const hasMore = rows.length > limit;

  return {
    questions: rows.slice(0, limit),
    hasMore,
  };
}

export async function searchQuestions(q: string, limit: number) {
  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, body, author, quality_score, duplicate_count, created_at, votes(count)"
    )
    .textSearch("body", q, {
      type: "websearch",
      config: "english",
    })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    body: row.body,
    author: row.author,
    quality_score: row.quality_score,
    duplicate_count: row.duplicate_count,
    votes: row.votes?.[0]?.count ?? 0,
  }));
}