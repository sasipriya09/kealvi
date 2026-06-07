import { ai } from "@/lib/gemini";

export async function POST(req: Request) {
  const { question } = await req.json();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
Improve this question so it is clearer, more professional, and more specific.

Question:
"${question}"

Respond with ONLY the improved question.
`,
  });

  return Response.json({
    improvedQuestion: response.text?.trim(),
  });
}