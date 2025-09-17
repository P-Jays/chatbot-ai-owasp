"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  role: "user" | "assistant";
  text: string;
};

export default function MessageBubble({ role, text }: Props) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div aria-label={`${role} message`}
        className={`max-w-[80%] rounded-2xl px-3 py-2 break-words ${
          isUser
            ? "bg-neutral-900 text-white"
            : "bg-neutral-100 text-neutral-900"
        }`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
