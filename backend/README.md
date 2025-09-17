# Chatbot Backend (Express + TypeScript)

**Contracts**: env validation, /health, /version, helmet, cors, rate-limit, pino logs, central error, tests.  
**SLE**: p95 < 1.2s for /api/chat; ≤ 300 req/15min/IP; 100% /health uptime.

## Commands
npm i
npm run dev
npm test
npm run build && npm start
