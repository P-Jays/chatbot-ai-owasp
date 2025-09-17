"use client";

import { create } from "zustand";

type Msg = { role: "user" | "assistant"; text: string };

type ChatState = {
  msgs: Msg[];
  addUserMessage: (text: string) => void;
  addAssistantMessage: (text: string) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  msgs: [],
  addUserMessage: (text) =>
    set((state) => ({ msgs: [...state.msgs, { role: "user", text }] })),
  addAssistantMessage: (text) =>
    set((state) => ({ msgs: [...state.msgs, { role: "assistant", text }] })),
  clearMessages: () => set({ msgs: [] }),
}));
