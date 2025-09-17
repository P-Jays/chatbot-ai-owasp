import { describe, it, expect, vi, Mock } from 'vitest';
import request from 'supertest';
import express from 'express';
import chatRouter from '../src/routes/chat';

vi.mock('../src/services/gemini.service', () => ({
  getGeminiResponse: vi.fn().mockResolvedValue('mock gemini reply'),
}));
vi.mock('../src/services/rag.service', () => ({
  augmentWithRag: vi.fn().mockImplementation((q: string) => {
    return '\n\n[OWASP Context]\n(fake rag context)\n[End Context]\n';
  }),
}));
vi.mock('../src/utils/env', async (importActual) => {
  const actual = await importActual<typeof import('../src/utils/env')>();
  return {
    ...actual,
    isRagEnabled: () => true,
    isRagDebug: () => true,
  };
});

import { getGeminiResponse } from '../src/services/gemini.service';
import { augmentWithRag } from '../src/services/rag.service';

const app = express();
app.use(express.json());
app.use('/api/chat', chatRouter);

describe('POST /api/chat with RAG', () => {
  it('appends RAG context and returns sessionId and reply', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'Tell me about BOLA' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sessionId');
    expect(res.body.reply).toBe('mock gemini reply');

    // Check that augmentWithRag was called correctly
    expect(augmentWithRag).toHaveBeenCalledWith('Tell me about BOLA', 5);

    // Check that getGeminiResponse was called with correct data
    const callArg = (getGeminiResponse as Mock).mock.calls[0][0];
    expect(callArg.userMessage).toBe('Tell me about BOLA');
    expect(callArg.ragContext).toContain('[OWASP Context]');
  });
});
