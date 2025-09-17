import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { getGeminiResponse } from '../services/gemini.service';
import { augmentWithRag } from '../services/rag.service';
import { getSession, appendMessage } from '../utils/sessionStore';
import { isRagEnabled, isRagDebug } from '../utils/env';

const bodySchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1),
});

export async function postChat(req: Request, res: Response, next: NextFunction) {
  try {
    const { sessionId: providedSessionId, message } = bodySchema.parse(req.body);
    const sessionId = providedSessionId ?? nanoid();

    const session = getSession(sessionId);
    appendMessage(sessionId, { role: 'user', content: message });

    const ragContext = isRagEnabled() ? augmentWithRag(message, 5) : '';

    const reply = await getGeminiResponse({
      history: session.messages,
      userMessage: message,
      ragContext,
    });

    appendMessage(sessionId, { role: 'assistant', content: reply });

    res.json({
      sessionId,
      reply,
      ragDebug: isRagDebug() ? ragContext : undefined,
    });
  } catch (err) {
    next(err);
  }
}
