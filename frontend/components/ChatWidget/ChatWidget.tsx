"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { sendChatMessage } from "@/lib/api";
import MessageBubble from "./MessageBubble";
import { useChatStore } from "./useChatStore";
import { X, Loader2, MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { msgs, addUserMessage, addAssistantMessage } = useChatStore();

  // Auto-scroll to bottom on new messages (fallback if el.scrollTo unsupported)
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (typeof el.scrollTo === "function")
      el.scrollTo({ top: 1e9, behavior: "smooth" });
    else el.scrollTop = 1e9;
  }, [msgs]);

  // Focus input when opened, restore focus to trigger when closed
  useEffect(() => {
    if (open && msgs.length === 0) {
      setTimeout(() => 
      addAssistantMessage(
        "👋 Hi! I’m your Security Assistant. Ask me anything about OWASP or web security."
      ), 200);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (!open) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, [open]);

  async function doSend() {
    const message = input.trim();
    if (!message || isSending) return;

    addUserMessage(message);
    setInput("");
    setIsSending(true);

    try {
      const text = await sendChatMessage(message);
      addAssistantMessage(text);
    } catch {
      addAssistantMessage("Error contacting server.");
    } finally {
      setIsSending(false);
      // Re-focus input after sending so user can keep typing
      if (open) setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      // Cmd/Ctrl+Enter also sends; Shift+Enter would add newline (we keep single line UX)
      if (e.metaKey || e.ctrlKey || !e.shiftKey) {
        e.preventDefault();
        void doSend();
      }
    }
  }

  return (
    <>
      {!open && (
        <button
          ref={triggerRef}
          id="chat-trigger"
          aria-label="Open chat"
          aria-controls="chat-dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-neutral-900 text-white shadow-lg flex items-center justify-center hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black/30"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Chat</span>
        </button>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {open && (
          <motion.div
            key="chat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-4 right-4"
            role="dialog"
            aria-modal="true"
            aria-label="Security Assistant"
            id="chat-dialog"
            aria-describedby="chat-messages"
          >
            <Card className="w-96 shadow-xl rounded-2xl overflow-hidden border border-neutral-200 bg-white">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="font-medium">Security Assistant</div>
                <Button
                  onClick={() => setOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full text-neutral-600 hover:text-neutral-900"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex flex-col h-96">
                <div
                  id="chat-messages"
                  ref={listRef}
                  className="flex-1 overflow-auto p-3 space-y-2"
                  role="list"
                  aria-live="polite"
                >
                  <AnimatePresence initial={false}>
                    {msgs.map((m, i) => (
                      <motion.div
                        key={`${i}-${m.role}-${m.text.slice(0, 8)}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16 }}
                        role="listitem"
                      >
                        <MessageBubble role={m.role} text={m.text} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="p-3 flex gap-2 border-t">
                  <Input
                    ref={inputRef}
                    className="flex-1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Ask about OWASP…"
                    disabled={isSending}
                    aria-label="Message input"
                  />
                  <Button
                    onClick={doSend}
                    disabled={isSending || !input.trim()}
                    aria-label="Send message"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending
                      </>
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
