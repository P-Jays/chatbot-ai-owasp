// Centralized API calls. Keep network-only logic here.
import { nanoid } from "nanoid";

let sessionId =
  typeof window !== "undefined" ? localStorage.getItem("chat-session") : null;
if (typeof window !== "undefined" && !sessionId) {
  sessionId = nanoid();
  localStorage.setItem("chat-session", sessionId);
}

export async function sendChatMessage(
  message: string,
  opts?: { timeoutMs?: number }
) {
  const timeoutMs = opts?.timeoutMs ?? 15000;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      throw new Error(`Server responded ${res.status}`);
    }
    const data = await res.json();
    return data?.reply ?? "No response";
  } finally {
    clearTimeout(t);
  }
}
