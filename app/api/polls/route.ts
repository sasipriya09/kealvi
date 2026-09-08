import { getActivePolls, createPoll } from "@/lib/polls";

export async function GET() {
  const polls = getActivePolls();
  return Response.json({ polls });
}

export async function POST(req: Request) {
  try {
    const { questionId, questionBody, prompt, options } = await req.json();

    if (!questionId || !options || !Array.isArray(options) || options.length < 2) {
      return Response.json(
        { error: "Invalid poll payload. Must provide questionId and at least 2 options." },
        { status: 400 }
      );
    }

    const newPoll = createPoll(questionId, questionBody, prompt, options);
    return Response.json(newPoll);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create poll";
    return Response.json({ error: message }, { status: 500 });
  }
}
