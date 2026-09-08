import { setQuestionStatus } from "@/lib/questions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();

  if (status !== "answered" && status !== "unanswered") {
    return Response.json({ error: "Invalid status value" }, { status: 400 });
  }

  setQuestionStatus(id, status);
  return Response.json({ ok: true, status });
}
