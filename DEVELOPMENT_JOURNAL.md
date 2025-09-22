
## Security Assistant Chatbot – Development Journal

### 1. Reading the Assignment

When I first opened the brief, I didn’t touch the code. I read it twice, listed the deliverables (frontend widget, backend API, optional RAG, tests, deployment) and the evaluation criteria (UI/UX, prompt engineering, session management, security). This helped me scope the work and pick a tech stack intentionally.

### 2. Choosing the Tech Stack

I considered doing everything inside Next.js, but decided to separate frontend and backend for clarity:

* **Frontend:** Next.js 15 + Tailwind + shadcn/ui. This gives me React with built-in routing, server components, and minimal, responsive styling. Good for a small widget but also production-ready.
* **Backend:** Node.js + Express with TypeScript. This keeps one language across the stack and a clean, testable API surface.

I also added:

* `zod` for request validation.
* `express-rate-limit` to prevent API abuse.
* `pino` logging for structured logs.
* `nanoid` for lightweight session IDs.
* `csv-parse` + `minisearch` for a simple RAG index.

### 3. Iterating on Architecture

My first commit had everything in `routes/chat.ts`. It worked but looked like spaghetti. So I refactored:

* **Routes** just declare endpoints.
* **Controllers** parse input and orchestrate services.
* **Services** hold business logic (Gemini API calls, RAG search).
* **Utils** hold reusable helpers (session store, env loader, logger).

This small “contract engineering” gave the code a clear flow that reviewers can follow without guessing.

### 4. Implementing the Core Chat Flow

* Incoming POST `/api/chat` is validated with `zod`.
* `nanoid` assigns or reuses a `sessionId`.
* The user’s message is appended to an in-memory session store.
* If `ENABLE_RAG=true`, the message goes through `augmentWithRag()` which queries the OWASP MiniSearch index and returns top-k question/answer snippets formatted as `[OWASP Context] …`.
* `getGeminiResponse()` builds a prompt from the last 8 turns + the RAG context and calls Google Gemini API.
* The Gemini reply is appended to the session and returned to the frontend.

### 5. Implementing the RAG Component

* On startup `rag.service.ts` loads `data/owasp.csv` with `csv-parse`, normalizes question/answer fields, and feeds them into `MiniSearch`.
* MiniSearch is memory-efficient and fast enough for a small CSV; no extra DB is needed.
* At runtime `searchRag(query, k)` runs a fuzzy/prefix search to retrieve relevant items.
* `augmentWithRag()` converts hits into a context block that’s injected into the Gemini prompt.

This approach is deliberately simple and transparent — great for a small project and easy for reviewers to debug or replace with a real search engine later.

### 6. Handling CORS Correctly

Initially I thought about solving CORS on the frontend with fetch options. After researching, I found that **best practice is to handle CORS at the backend** by whitelisting allowed origins. I implemented a dynamic CORS middleware that only allows my Vercel frontend and localhost dev, with credentials support.

### 7. Testing Early

I added **Vitest** for unit/integration tests because it’s faster and lighter than Jest, with built-in TypeScript support. That speed made test-driven tweaks practical.
I used **Supertest** for HTTP-level tests of the Express routes (chat route, rate limit, env validation).
I also wrote a **Playwright smoke test** that runs against the deployed frontend: opens the widget, types a message, and expects a reply from the backend. This gives a high-confidence “it all works” signal.

### 8. Handling Security & Deployment

* API keys are stored in `.env` locally and in Fly.io secrets in production.
* Helmet adds common HTTP security headers.
* Rate limiting defends against accidental abuse.

Deployment:

* **Frontend** on Vercel (auto-build from GitHub).
* **Backend** on Fly.io with a Dockerfile. Secrets are set via `flyctl secrets set …`.
* The Makefile wraps install/dev/test/build commands so reviewers can spin everything up or run tests with one command.

### 9. Challenges & How I Solved Them

* **Architecture thinking:** My main struggle was moving from “just ship code” to a small but clean architecture. Solved by iteratively refactoring into routes/controllers/services.
* **Node + TS build issues:** Solved with updated Node 20, `tsx` for dev, and consistent ES module imports.
* **CORS & deployment:** Initially blocked requests from Vercel → Fly.io; solved by reading origin from env and setting CORS whitelist.

### 10. What I Learned

* Planning architecture before coding saves time later.
* Prompt engineering + RAG injection matters to keep Gemini’s answers on-topic.
* Vitest + Supertest + Playwright combo gives both speed and confidence.
* Fly.io + Vercel is a smooth, low-cost way to deploy a full-stack app.



 ---
 
## **Behind the logic**.


### 1. `postChat` Controller

This is the HTTP entry point. It:

* **Validates input** with `zod` so bad payloads fail fast.
* **Generates a session ID** with `nanoid` if the client doesn’t supply one. This lets you keep minimal context per user without a DB.
* **Appends the user message** to an in-memory session store.
* **Calls `augmentWithRag`** only if RAG is enabled, which retrieves the most relevant OWASP Q\&A from a pre-built index.
* **Calls `getGeminiResponse`** with:

  * recent conversation history
  * user’s message
  * optional OWASP context block

It then appends the assistant’s reply to the session and returns JSON.

**Why this works for a small project:** Everything is synchronous and in-memory (no database); `nanoid` makes unique IDs without setup; `zod` gives quick runtime validation.

---

### 2. `rag.service.ts` (RAG Component)

This file is responsible for the **search mechanism**:

* On startup `initRag()`:

  * Loads the fixed CSV at `data/owasp.csv`.
  * Parses it with `csv-parse`.
  * Cleans up and normalises Q\&A.
  * Builds a MiniSearch index on the `question` and `answer` fields.

* `searchRag(query,k)`:

  * Runs a fuzzy search with prefix matching.
  * Returns top `k` question/answer pairs + scores.

* `augmentWithRag(query,k)`:

  * Calls `searchRag`.
  * Formats the hits into a block:

    ```
    [OWASP Context]
    (1) Q: …
    A: …
    [End Context]
    ```
  * This block gets appended to the Gemini prompt.

**Why this approach:**
*MiniSearch* is a zero-dependency, in-memory full-text search library. For a few thousand rows, it’s fast and doesn’t require a DB or external service. That makes it perfect for a coding assignment or small app.

---

### 3. `gemini.service.ts`

This file isolates the **LLM call**:

* Initialises the Google Generative AI client once (using your API key + model).
* Clips the history to the last 8 turns so prompts stay small.
* Builds a `systemPrompt` + conversation transcript + user message + optional `[OWASP Context]`.
* Sends one consolidated prompt to Gemini and returns plain text.

**Why this approach:**
It keeps prompt-building logic in one place, making it easy to tweak. Clipping history avoids token bloat and keeps latency low.

---

### 

For production you’d move sessions and the OWASP index to a proper data store, add background re-indexing, cache Gemini calls, etc. But for an interview assignment this strikes a good balance between clarity and functionality.


### 🔹 What the RAG Component Does

This backend is a **small “retrieval-augmented generation” (RAG)** pipeline: before sending the user’s message to Gemini, it searches a local CSV of OWASP Q\&A, pulls the top hits, and injects them into the prompt. Gemini then sees both the question and the relevant OWASP context and can answer more accurately.

---

### 🔹 How the Search Mechanism Works

**`rag.service.ts`**

* On startup `initRag()`:

  * Reads `data/owasp.csv`.
  * Parses rows with `csv-parse`.
  * Builds an **in-memory MiniSearch index** (fields: `question` and `answer`) with fuzzy/prefix search and boosts the `question` field.
  * Logs how many rows indexed.

* When a user asks something:

  * `searchRag(query, k)` runs MiniSearch’s full-text search for top `k` matches.
  * Returns array of `{question, answer, score}`.

* `augmentWithRag(query, k)`:

  * Calls `searchRag`.
  * Formats each hit as `(1) Q: …\nA: …`.
  * Wraps them in `[OWASP Context]…[End Context]`.
  * This string is concatenated to Gemini’s prompt.

So the CSV is never queried on disk per request — it’s pre-indexed in memory. This is extremely fast and perfect for a small demo.

---

### 🔹 How OWASP Data is Integrated into the Chatbot’s Responses

**`chat.controller.ts`**

* Validates body with `zod`.
* Creates a session ID with `nanoid` and appends the user message to the in-memory `sessionStore`.
* If `ENABLE_RAG` is true, calls `augmentWithRag(message, 5)` to get the context string.
* Passes `history`, `userMessage` and `ragContext` to `getGeminiResponse`.

**`gemini.service.ts`**

* Clips chat history to the last 8 messages for brevity.
* Prepares `systemPrompt` (instructions for Gemini).
* Appends `ragContext` block if present.
* Sends the final prompt to Gemini and returns the text.

**The effect:** Gemini sees:

```
You are a helpful security assistant…

USER: my question
[OWASP Context]
(1) Q: … A: …
[End Context]
```

so it can blend generative text with retrieved facts.

---

### 🔹 Why This Solution Works Well for a Small Project

* **No external DB needed** – just a CSV and an in-memory index.
* **Fast startup** – MiniSearch builds index once on boot.
* **Low latency** – search returns in microseconds.
* **Lightweight dependencies** – `csv-parse` and `MiniSearch` are tiny and battle-tested.
* **Environment toggle** – can disable RAG via `ENABLE_RAG=false` without changing code.
* **Clear separation of concerns** – search logic lives in `rag.service.ts`; controller only orchestrates.
4. Why It’s “OK” for This Size Project

| Choice                                     | Why it fits this assignment                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **In-memory session store**                | No DB to configure, easy for a few testers.                                                      |
| **MiniSearch**                             | Indexes a small CSV instantly at startup; no Elasticsearch/Postgres needed.                      |
| **Single controller/service files**        | Simple structure, easy for reviewers to follow. Later can be swapped for a layered architecture. |
| **Prompt injection via `[OWASP Context]`** | A clear, deterministic way to add RAG context without complex retrieval pipelines.               |
| **`zod` validation**                       | Quick runtime safety without building DTO classes.                                               |

---

### 🔹 Extra Best-Practice Choices in This Code

* **`zod` validation** protects against malformed requests.
* **`sessionStore`** keeps chat context per session.
* **`nanoid`** generates collision-resistant IDs without a database.
* **Rate-limit middleware** stops abuse.
* **CORS on backend** solves cross-origin cleanly (best practice vs front-end hacks).
* **Vitest + Supertest** used for unit/integration tests because:

  * Vitest is faster and TS-native compared to Jest.
  * Supertest makes it easy to hit Express routes directly.

