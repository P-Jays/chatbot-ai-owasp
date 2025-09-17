# backend/README

Project: Chatbot Backend (Express + Gemini + OWASP RAG)

## 1. Overview

This is the backend service for the Chatbot-AI-OWASP project.
It exposes a REST API at /api/chat for chatbot conversations and /api/rag for OWASP search debugging.
It integrates Google’s Gemini API (free tier) to generate responses and can augment them with OWASP security Q&A data.

## 2. Tech Stack

* Node.js 20
* Express
* Zod for env validation
* Helmet for secure headers
* Express Rate Limit
* Pino for logging
* MiniSearch for OWASP dataset search
* Docker + Fly.io deployment

## 3. Directory Structure

* src/ – application source code
* data/ – OWASP Q&A CSV dataset
* dist/ – compiled JavaScript output (after npm run build)

## 4. Running Locally
```
npm install

Create .env with:
GEMINI_API_KEY=…
GEMINI_MODEL=gemini-1.5-flash
ALLOWED_ORIGIN=http://localhost:3000
ENABLE_RAG=true
RAG_DEBUG=true
```
npm run dev to start local server. Default port 8080.

5. Docker

Build and run with environment variables:
```
docker build -t chatbot-backend .
docker run -p 8181:8080 \
  -e GEMINI_API_KEY=yourkey \
  -e GEMINI_MODEL=gemini-1.5-flash \
  -e ALLOWED_ORIGIN=http://localhost:3000 \
  -e ENABLE_RAG=true \
  -e RAG_DEBUG=true \
  chatbot-backend
```
6. Deployment (Fly.io)

flyctl launch inside backend folder.
```
flyctl secrets set GEMINI_API_KEY=… GEMINI_MODEL=… ALLOWED_ORIGIN=… ENABLE_RAG=true RAG_DEBUG=true

flyctl deploy --remote-only (recommended for Apple Silicon).

flyctl logs -a your-app-name to monitor logs.
```
7. API Endpoints

* ```GET /health``` – health check
* ```GET /version``` – returns name and env
* ```POST /api/chat``` – main chatbot endpoint
* ```GET /api/rag?q=… ```– OWASP debug search

8. Testing

* ```npm test ```runs Vitest unit tests
* Rate-limit and env validation tests included
* E2E smoke test runs from root with Playwright
* /api/chat route with RAG
* session store