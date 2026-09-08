import { addQuestionAnswer, getQuestionAnswers } from "@/lib/questions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const answers = getQuestionAnswers(id);
  return Response.json({ answers });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { body, author, role } = await req.json();

  if (!body || !body.trim()) {
    return Response.json({ error: "Answer body cannot be empty" }, { status: 400 });
  }

  const answer = addQuestionAnswer(id, {
    question_id: id,
    body: body.trim(),
    author: author || "Live Participant",
    role: role || "student",
  });

  return Response.json(answer);
}
