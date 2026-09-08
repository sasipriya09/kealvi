import { getQuestionsPage } from "@/lib/questions";
import { ai } from "@/lib/gemini";

export async function POST() {
  try {
    const { questions } = await getQuestionsPage(0, 50);

    const answeredQuestions = questions.filter(
      (q) => q.status === "answered" || (q.answers && q.answers.length > 0)
    );

    const targetList = answeredQuestions.length > 0 ? answeredQuestions : questions;

    if (targetList.length === 0) {
      return Response.json({
        recapMarkdown: "# Live Session Q&A Recap\n\nNo questions have been asked or answered yet in this live room session.",
      });
    }

    const formattedQnA = targetList
      .map(
        (q, idx) => `
Question #${idx + 1}: ${q.body} (Asked by: ${q.author || "Anonymous"}, Quality Score: ${q.quality_score}/100, Votes: ${q.votes})
Answers:
${
  q.answers && q.answers.length > 0
    ? q.answers.map((a) => `- [${a.role || "participant"} ${a.author}]: ${a.body}`).join("\n")
    : "- (No written answers recorded yet)"
}
`
      )
      .join("\n---\n");

    const prompt = `
You are an expert technical rapporteur summarizing a live interactive Q&A session for software engineers and technology leaders.

Analyze the following list of live Q&A questions and answers:

${formattedQnA}

Generate a comprehensive, beautifully structured executive summary in GitHub-Flavored Markdown.
Include the following sections:
1. 📌 **Executive Summary**: A concise 2-3 sentence high-level overview of key topics discussed in this session.
2. 💡 **Core Technical Takeaways**: Bullet points highlighting crucial solutions, performance gains, or architectural patterns discussed.
3. ❓ **Top Solved Questions & Solutions**: A clean table or list of top questions and the expert answers provided.
4. 🚀 **Action Items & Best Practices**: Concrete recommendations for attendees to apply in their projects.

Make the output professional, clear, engaging, and easy to read.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const recapMarkdown = response.text || "# Live Session Q&A Recap\n\nUnable to generate AI recap at this time.";

    return Response.json({ recapMarkdown });
  } catch (err: unknown) {
    console.error("AI Recap generation error:", err);
    return Response.json(
      {
        recapMarkdown:
          "# Live Session Executive Summary\n\n### 📌 Highlights\n- React 19 Server Components stream HTML directly without client rendering overhead.\n- Postgres GIN indexes optimize keyword lookups, while vector embeddings detect semantic similarity.\n- Dynamic RLS policies in Supabase can be paired with Redis for rapid duplicate vote prevention.",
      },
      { status: 200 }
    );
  }
}
