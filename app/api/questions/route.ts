import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";
import { ai } from "@/lib/gemini";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (q) {
    const questions = await searchQuestions(q, PAGE_SIZE);
    return Response.json({ questions, hasMore: false });
  }

  const offset = Number(searchParams.get("offset") ?? 0);
  const { questions, hasMore } = await getQuestionsPage(
    offset,
    PAGE_SIZE
  );

  return Response.json({ questions, hasMore });
}

export async function POST(req: Request) {
  const { body, author } = await req.json();

  // AI Quality Score
  const scoreResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
Rate the quality of this question from 0 to 100.

Question:
"${body}"

Respond with ONLY a number.
`,
  });

  const qualityScore =
    Number(scoreResponse.text?.trim()) || 0;

  // Duplicate Count
  const { data: similarQuestions, error: searchError } =
    await supabase
      .from("questions")
      .select("id")
      .textSearch("body", body, {
        type: "websearch",
        config: "english",
      });

  if (searchError) {
    console.error(searchError);
  }

  const duplicateCount =
    similarQuestions?.length ?? 0;

  // Save Question
  const { data, error } = await supabase
    .from("questions")
    .insert({
      body,
      author,
      quality_score: qualityScore,
      duplicate_count: duplicateCount,
    })
    .select()
    .single();

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json(data);
}