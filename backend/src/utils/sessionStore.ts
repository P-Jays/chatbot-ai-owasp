export type Msg = { role:'user'|'assistant'; content:string };
type Session = { id: string; messages: Msg[]; updatedAt: number };

const store = new Map<string, Session>();
const MAX_MSGS = 50;

export function getSession(id: string): Session {
  let s = store.get(id);
  if (!s) {
    s = { id, messages: [], updatedAt: Date.now() };
    store.set(id, s);
  }
  return s;
}
export function appendMessage(id: string, m: Msg) {
  const s = getSession(id);
  s.messages.push(m);
  s.updatedAt = Date.now();
  if (s.messages.length > MAX_MSGS) s.messages.shift();
}
