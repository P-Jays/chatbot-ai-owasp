# README (root)

Project name: Chatbot-AI-OWASP
This repository contains both the frontend (React/Next.js) and the backend (Node.js/Express) for an OWASP-augmented Gemini chatbot.
It is built as a monorepo with a Makefile to coordinate installation, dev, test, and deployment tasks.

## 1. Project Overview

This project implements a secure, production-ready chatbot that:

• Provides conversational responses using Google’s Gemini API (free tier).
• Maintains per-session context using a simple in-memory session store.
• Optionally augments Gemini responses with information from a fixed OWASP Q&A dataset (RAG).
• Is fully dockerized, deployed with Vercel (frontend) and Fly.io (backend).
• Includes automated unit tests and an end-to-end smoke test (Playwright) to ensure reliability.

## 2. Tech Stack

Frontend: Next.js + React + Tailwind + Framer Motion + ShadCN UI + Playwright for E2E
Backend: Node.js 20 + Express + Zod + MiniSearch + Express Rate Limit + Pino + Helmet + Docker
RAG Dataset: CSV file stored in backend/data/owasp.csv
Deployment: Vercel (frontend), Fly.io (backend)
Testing: Vitest + Supertest (backend), Playwright (E2E)

## 3. Directory Structure

• frontend/ – Next.js app and chatbot widget
• backend/ – Express server, Gemini API integration, RAG logic
• backend/src – source files
• backend/data – OWASP CSV dataset
• tests/ – Playwright end-to-end tests
• Makefile – top-level convenience commands

## 4. Makefile Commands

Available commands:
make install – install dependencies for frontend and backend
make dev – run backend and frontend concurrently
make dev-frontend – run only frontend in dev mode
make dev-backend – run only backend in dev mode
make test – run frontend + backend tests
make test-frontend – run only frontend tests
make test-backend – run only backend tests
make build – build frontend and backend

Use make dev locally to spin up both apps. Use make test before pushing to verify everything.

## 5. Backend Environment Variables

The backend requires the following environment variables (set in Fly.io secrets or .env.local):

GEMINI_API_KEY – your Google Generative AI API key
GEMINI_MODEL – e.g., gemini-1.5-flash
ALLOWED_ORIGIN – URL of the frontend (http://localhost:3000
 or your Vercel URL)
ENABLE_RAG – true/false to toggle OWASP context augmentation
RAG_DEBUG – true/false to include debug info about retrieved OWASP entries

Example run locally with Docker:
```
docker run -p 8181:8080
-e GEMINI_API_KEY=yourkey
-e GEMINI_MODEL=gemini-1.5-flash
-e ALLOWED_ORIGIN=http://localhost:3000

-e ENABLE_RAG=true
-e RAG_DEBUG=true
chatbot-backend
```
## 6. Running Locally

Clone repo
```
make install

cd backend && cp .env.example .env (fill in your values)

make dev (runs both apps)
```
Open http://localhost:3000
 to see the chatbot widget.

## 7. Testing

### Unit Tests:
```
cd backend && npm test
```
### E2E Smoke Test (Playwright):
```
npx playwright install
npx playwright test tests/e2e-smoke.spec.ts
```
This will:
1. Launch a headless browser
2. Open the deployed frontend widget
3. Type a message
4. Wait for a chatbot reply

If it passes, your entire stack (Vercel + Fly.io) is working.

## 8. Deployment

Frontend: push to main branch → Vercel auto deploys (uses frontend/.vercel config)
Backend: cd backend && flyctl deploy (or flyctl deploy --remote-only for Apple Silicon)

Set secrets in Fly.io:
```
flyctl secrets set GEMINI_API_KEY=… GEMINI_MODEL=… ALLOWED_ORIGIN=https://your-vercel.app
 ENABLE_RAG=true RAG_DEBUG=true
```
After deploy:
```
flyctl logs -a your-app-name to view logs.
```
## 9. API Contract

The backend’s API contract is described in openapi.yaml. You can load this file into https://editor.swagger.io
 to view and test endpoints interactively.

## 10. Security

• API key stored securely as environment variables / Fly.io secrets.
• Helmet for secure headers.
• Rate limiting middleware (60 req/min default).
• Zod input validation to prevent injection attacks.
• OWASP dataset retrieval is read-only.

## 11. Troubleshooting

• CORS Errors: Ensure ALLOWED_ORIGIN matches your frontend URL.
• Crash on Fly.io: Run ``` fly logs -a <app-name>``` to view logs. Usually caused by missing secrets or mis-placed data/owasp.csv.
• nanoid missing: Add nanoid to dependencies in backend/package.json and rebuild.
• Docker Port Conflicts: Use docker run -p 8181:8080 to map container port 8080 to local 8181.

## 10. Roadmap / Next Steps

• Expand E2E to test multiple OWASP queries.
• Add CI pipeline (GitHub Actions) to run tests on every push.
• Add monitoring/alerting for Fly.io machine health.
• Expand session store to Redis or database for multi-instance scaling.
• Document the OpenAPI spec fully.