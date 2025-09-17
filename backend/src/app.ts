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
// app.use(cors({ origin: env.ALLOWED_ORIGIN || '*', credentials: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // allowed origins list
      const allowedOrigins = [
        'http://localhost:3000',           // local dev
        'https://chatbot-ai-owasp.vercel.app', // your Vercel frontend
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS not allowed for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));


// Rate limit middleware (60 req / min by default)
const maxReqs = env.NODE_ENV === 'test' ? 3 : 60;
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: maxReqs,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many requests, slow down.' });
  },
});
app.use(limiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/version', (_req, res) => res.json({
  name: 'chatbot-backend',
  env: env.NODE_ENV
}));

app.use('/api/chat', chatRouter);
app.use('/api/rag', ragRouter); // only for debugging/search

app.use(errorHandler);
