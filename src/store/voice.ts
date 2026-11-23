import { create } from "zustand";
import type { ChatMessage, Language, VoiceStatus } from "@/types";

interface VoiceState {
  status: VoiceStatus;
  language: Language;
  messages: ChatMessage[];
  transcript: string;
  isDemo: boolean;
  setStatus: (s: VoiceStatus) => void;
  setLanguage: (l: Language) => void;
  setDemo: (d: boolean) => void;
  addMessage: (m: ChatMessage) => void;
  setTranscript: (t: string) => void;
  clearMessages: () => void;
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  status: "idle",
  language: "ur",
  messages: [],
  transcript: "",
  isDemo: true,
  // Guard: same value par set() mat karo — warna har render par
  // store update -> re-render -> dobara update ka infinite loop banta hai.
  setStatus: (status) => { if (get().status !== status) set({ status }); },
  setLanguage: (language) => { if (get().language === language) return; try { localStorage.setItem("jarvis-lang", language); } catch { /* ignore */ } set({ language }); },
  setDemo: (isDemo) => { if (get().isDemo !== isDemo) set({ isDemo }); },
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setTranscript: (transcript) => { if (get().transcript !== transcript) set({ transcript }); },
  clearMessages: () => set({ messages: [], transcript: "" }),
}));
