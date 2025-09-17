import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../utils/env';

// init model once
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL as string });

// keep only last N turns to control prompt size
function clip<T>(arr: T[], n: number) {
  return arr.slice(Math.max(0, arr.length - n));
}

export async function getGeminiResponse(opts: {
  history: { role: 'user' | 'assistant'; content: string }[];
  userMessage: string;
  ragContext?: string; // optional OWASP context block
}): Promise<string> {
  const { history, userMessage, ragContext = '' } = opts;

  // take only the last 8 turns for brevity
  const recent = clip(history, 8);

  // build prompt pieces
  const systemPrompt = `You are a helpful security assistant.
Answer concisely. If you cite OWASP, be accurate.`;

  const ragPrompt = ragContext
    ? `\n\n[OWASP Context]\n${ragContext}\n[End Context]\n`
    : '';

  // join into a single string for Gemini
  const conversation = recent
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');

  const finalPrompt =
    systemPrompt + '\n\n' + conversation + '\nUSER: ' + userMessage + ragPrompt;

  const result = await model.generateContent(finalPrompt);
  return result.response.text();
}
