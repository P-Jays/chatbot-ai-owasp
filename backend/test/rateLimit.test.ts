// tests/rateLimit.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Rate limit middleware', () => {
  it('returns 429 after exceeding the limit', async () => {
    // hit the same endpoint multiple times
    for (let i = 0; i < 60; i++) {
      await request(app).post('/api/chat').send({ message: 'hi' });
    }
    // next request should be blocked
    const res = await request(app).post('/api/chat').send({ message: 'hi again' });
    expect(res.status).toBe(429);
    expect(res.body.error).toContain('Too many requests');
  }, 15000);
});
