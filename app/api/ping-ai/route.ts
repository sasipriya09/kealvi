import { GoogleGenAI } from "@google/genai";

export async function GET() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Say 'it works' and nothing else.",
  });

  return Response.json({
    reply: res.text,
  });
}