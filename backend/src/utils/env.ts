import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development","test","production"]).default("development"),
  PORT: z.string().default("8080"),
  GEMINI_API_KEY: z.string().min(10, "GEMINI_API_KEY is required"),
  ALLOWED_ORIGIN: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  ENABLE_RAG: z.string().optional().default('true'),
  RAG_DEBUG: z.string().optional().default('false')
});

export type Env = z.infer<typeof EnvSchema>;
export const env: Env = EnvSchema.parse(process.env);

export const isRagEnabled = () => env.ENABLE_RAG.toLowerCase() !== 'false';
export const isRagDebug = () => env.RAG_DEBUG.toLowerCase() === 'true';