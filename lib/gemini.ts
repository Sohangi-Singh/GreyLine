import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAIInstance) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAIInstance;
}

export function getModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: 8192,
    },
  });
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function callAgent(
  systemPrompt: string,
  userContent: string,
  retries = 2
): Promise<string> {
  const model = getModel();
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await delay(300);
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userContent }] }],
        systemInstruction: systemPrompt,
      });
      return result.response.text();
    } catch (err: unknown) {
      if (attempt === retries) throw err;
      await delay(1000 * (attempt + 1));
    }
  }
  throw new Error("Agent call failed after retries");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeToArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data) return [];
  // handle wrapped responses like { clauses: [...] } or { items: [...] } or { results: [...] }
  const values = Object.values(data as Record<string, unknown>);
  const firstArray = values.find((v) => Array.isArray(v));
  if (firstArray) return firstArray as T[];
  return [];
}

export function safeParseJSON<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    // If caller expects an array (fallback is []) but parsed is an object, normalize it
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return normalizeToArray(parsed) as T;
    }
    return parsed as T;
  } catch {
    try {
      const match = raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (match) {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(fallback) && !Array.isArray(parsed)) {
          return normalizeToArray(parsed) as T;
        }
        return parsed as T;
      }
    } catch {
      // ignore
    }
    return fallback;
  }
}
