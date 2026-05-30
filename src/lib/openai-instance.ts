import OpenAI from "openai";

export function openai(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
  const g = globalThis as unknown as { _openai: OpenAI | undefined };
  if (!g._openai) g._openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return g._openai;
}
