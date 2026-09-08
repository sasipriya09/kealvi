import { voteInPoll } from "@/lib/polls";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { optionId, voterId } = await req.json();

    if (!optionId) {
      return Response.json({ error: "Missing optionId" }, { status: 400 });
    }

    const updatedPoll = voteInPoll(id, optionId, voterId);
    if (!updatedPoll) {
      return Response.json({ error: "Poll not found" }, { status: 404 });
    }

    return Response.json(updatedPoll);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Voting failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
