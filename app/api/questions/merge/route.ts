import { mergeQuestions } from "@/lib/questions";

export async function POST(req: Request) {
  try {
    const { targetId, duplicateIds } = await req.json();

    if (!targetId || !duplicateIds || !Array.isArray(duplicateIds) || duplicateIds.length === 0) {
      return Response.json(
        { error: "Invalid payload. Provide targetId and duplicateIds array." },
        { status: 400 }
      );
    }

    const updatedTarget = mergeQuestions(targetId, duplicateIds);
    if (!updatedTarget) {
      return Response.json({ error: "Target question not found" }, { status: 404 });
    }

    return Response.json({ success: true, mergedQuestion: updatedTarget });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Merge failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
