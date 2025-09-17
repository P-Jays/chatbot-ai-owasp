# frontend/README

Project: Chatbot Frontend (Next.js widget)

## 1. Overview

This is the frontend UI for the Chatbot-AI-OWASP project.
It renders a floating chatbot widget at the bottom-right of the page, allowing users to open, send messages, and view responses from the backend API.

## 2. Tech Stack

• Next.js 15
• React
• Tailwind CSS + ShadCN UI
• Framer Motion for animations
• Playwright for E2E tests

## 3. Directory Structure

• app/ – Next.js app routes
• components/ – reusable UI components including ChatWidget and MessageBubble
• public/ – static assets

## 4. Running Locally
```
npm install
```
Create .env.local with:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/chat
```
```npm run dev ```to start the Next.js dev server (port 3000 by default).

## 5. Deployment (Vercel)

• Push to GitHub and import repository into Vercel.
• Set environment variable NEXT_PUBLIC_API_URL to your Fly.io backend URL (e.g., https://chatbot-backend.fly.dev/api/chat
).
• Vercel auto-builds and deploys the frontend.

## 6. Testing

• ```npm test``` runs any frontend unit tests
• Root Playwright test (tests/e2e-smoke.spec.ts) clicks the widget, sends a message, and checks for a reply.

## 7. UI Features

• Floating button at bottom-right
• Opens/closes smoothly with Framer Motion
• Chat bubbles for user and assistant messages
• Markdown rendering for assistant replies
• Mobile-friendly responsive design