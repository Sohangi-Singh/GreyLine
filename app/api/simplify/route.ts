import { NextRequest, NextResponse } from "next/server";
import { callAgent, safeParseJSON } from "@/lib/gemini";

export const maxDuration = 60;

const SIMPLIFY_PROMPTS: Record<string, string> = {
  legal: `You are a legal document formatter. Return the summaries exactly as provided in formal legal language. Return ONLY valid JSON array of strings: ["summary1", "summary2", ...]`,
  simple: `You are a plain-language translator. Rewrite each legal summary in simple, clear English that anyone can understand. Use short sentences, no jargon. Return ONLY valid JSON array of strings: ["summary1", "summary2", ...]`,
  eli5: `You are explaining contract clauses to a curious 10-year-old. Use funny, memorable analogies and simple language. For example: "They're saying they can use your photos on their cereal boxes forever, even after you delete your account" or "It's like lending your bike to someone and them saying they now own all bikes you'll ever buy." Make each analogy specific and memorable. Return ONLY valid JSON array of strings: ["analogy1", "analogy2", ...]`,
};

export async function POST(req: NextRequest) {
  try {
    const { summaries, level } = await req.json();

    if (!summaries || !Array.isArray(summaries)) {
      return NextResponse.json({ error: "Invalid summaries array" }, { status: 400 });
    }

    const validLevel = (["legal", "simple", "eli5"] as const).includes(level)
      ? (level as "legal" | "simple" | "eli5")
      : "simple";

    if (validLevel === "legal") {
      return NextResponse.json({ summaries });
    }

    const prompt = SIMPLIFY_PROMPTS[validLevel];
    const raw = await callAgent(
      prompt,
      `Rewrite these ${summaries.length} summaries:\n${JSON.stringify(summaries, null, 2)}`
    );

    const result = safeParseJSON<string[]>(raw, summaries);
    return NextResponse.json({ summaries: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Simplification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
