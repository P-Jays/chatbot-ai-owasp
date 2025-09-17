# Project Overview

This repository contains a full-stack chatbot application built as an interview assignment.
It combines a modern React/Next.js frontend with a TypeScript/Node.js backend and integrates Google Gemini API for conversational AI.
An optional RAG (Retrieval Augmented Generation) component enriches answers with data from an OWASP security Q&A dataset.

# Monorepo Layout

/ frontend – Next.js + Tailwind + Shadcn + TypeScript UI
/ backend – Node.js + Express + TypeScript server with Gemini integration and RAG service
Makefile at the root for easy install, dev, test, and build commands.

# Features

• Floating chatbot widget at the bottom-right of the page
• Open/close button with smooth animation and message bubbles
• Handles multiple user inputs and maintains session context
• Backend integration with Google Gemini API (free tier)
• Optional RAG augmentation from OWASP CSV file
• Security best practices: API key in environment variables, helmet, rate-limit, input validation with Zod
• Ready for deployment to Fly.io with Dockerfile and fly.toml

# API Endpoints

POST /api/chat
Accepts: { sessionId?: string, message: string }
Returns: { sessionId: string, reply: string, ragDebug?: string }

GET /api/rag/search?q=your+query
Returns: { results: [ { question, answer, score } ] }

# Running Locally

Clone the repository

Create a .env in backend with:
GEMINI_API_KEY=your_google_api_key
GEMINI_MODEL=gemini-1.5-flash
ALLOWED_ORIGIN=http://localhost:3000

Using Makefile commands at the root:
make install — install dependencies in both frontend and backend
make dev — run backend and frontend together (backend on 8080, frontend on 3000)
make dev-backend — run only backend
make dev-frontend — run only frontend

Or run manually:
cd backend && npm run dev
cd frontend && npm run dev

# Testing

You can run all tests with:
make test

Or individually:
make test-frontend
make test-backend

Backend tests:
– chat.test.ts covers /api/chat
– rateLimit.test.ts covers 429 rate-limit behavior
– envValidation.test.ts covers missing GEMINI_API_KEY handling

Frontend tests:
– ChatWidget.test.ts covers widget open/close, input focus, sending messages

# Building for Production

make build — builds both frontend and backend

# Deployment

• Fly.io Dockerfile and fly.toml included in backend
• Set Fly.io secrets: fly secrets set GEMINI_API_KEY=your_key
• Deploy with: fly deploy

# End-to-End Smoke Test

A Playwright script is provided under /tests/e2e. It opens the deployed frontend, clicks the chatbot widget, sends one message, and verifies a reply from the backend.

# Contributing

Keep frontend code modular in /components and /store
Keep backend code modular in /routes /services /utils

# License

MIT