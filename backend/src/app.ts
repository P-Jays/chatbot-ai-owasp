import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { env } from './utils/env';
import { logger } from './utils/logger';
import chatRouter from './routes/chat';
import ragRouter from './routes/rag';   // debug/search endpoint
import { errorHandler } from './middleware/error';

export const app = express();

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors({ origin: env.ALLOWED_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use(rateLimit({ windowMs: 60_000, max: 60 })); // 60 req/min/ip

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/version', (_req, res) => res.json({
  name: 'chatbot-backend',
  env: env.NODE_ENV
}));

app.use('/api/chat', chatRouter);
app.use('/api/rag', ragRouter); // only for debugging/search

app.use(errorHandler);
