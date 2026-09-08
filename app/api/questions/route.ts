import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions, addLocalQuestion, QuestionWithMeta } from "@/lib/questions";
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

  let qualityScore = 88;
  let options = [
    `Option A: Primary solution for ${body.slice(0, 25)}...`,
    "Option B: Secondary alternative pattern",
    "Option C: Traditional approach",
    "Option D: Performance optimized pattern",
  ];
  let correctOptionIndex = 0;
  let explanation = "The primary solution addresses the core issue efficiently.";

  try {
    const prompt = `
Given this technical student question:
"${body}"

Analyze the question and respond with ONLY a valid JSON object with the following structure (no markdown formatting, no code blocks):
{
  "qualityScore": <number between 0 and 100 representing clarity and depth>,
  "options": [
    "<Option 1 concise sentence>",
    "<Option 2 concise sentence>",
    "<Option 3 concise sentence>",
    "<Option 4 concise sentence>"
  ],
  "correctOptionIndex": <index 0, 1, 2, or 3 corresponding to the correct or best option>,
  "explanation": "<1-2 sentence concise explanation of why the correct option is right>"
}
`;

    const aiRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = aiRes.text?.trim() || "";
    const cleanJson = rawText.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed.qualityScore && typeof parsed.qualityScore === "number") {
      qualityScore = Math.max(0, Math.min(100, Math.round(parsed.qualityScore)));
    }

    if (Array.isArray(parsed.options) && parsed.options.length >= 4) {
      options = parsed.options.slice(0, 4);
    }

    if (typeof parsed.correctOptionIndex === "number" && parsed.correctOptionIndex >= 0 && parsed.correctOptionIndex <= 3) {
      correctOptionIndex = parsed.correctOptionIndex;
    }

    if (parsed.explanation && typeof parsed.explanation === "string") {
      explanation = parsed.explanation;
    }
  } catch (err) {
    console.warn("AI Question options & quality score generation fallback:", err);
  }

  let duplicateCount = 0;
  try {
    const { data: similarQuestions } = await supabase
      .from("questions")
      .select("id")
      .textSearch("body", body, {
        type: "websearch",
        config: "english",
      });

    duplicateCount = similarQuestions?.length ?? 0;
  } catch (err) {
    console.warn("Duplicate count check error:", err);
  }

  const questionId = "q_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5);

  const newQuestion: QuestionWithMeta = {
    id: questionId,
    body,
    author: author || "Anonymous Student",
    quality_score: qualityScore,
    duplicate_count: duplicateCount,
    options,
    correct_option_index: correctOptionIndex,
    explanation,
    votes: 1,
    status: "answered",
    answers: [
      {
        id: "ans_" + Date.now(),
        question_id: questionId,
        body: explanation,
        author: "Smart Assistant",
        role: "student",
        created_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("questions")
      .insert({
        body,
        author: author || "Anonymous Student",
      })
      .select()
      .single();

    if (!error && data) {
      newQuestion.id = data.id;
    }
  } catch (err) {
    console.warn("Supabase insert warning:", err);
  }

  addLocalQuestion(newQuestion);

  return Response.json(newQuestion);
}