// Jarvis Memory — Jarvis user ko yaad rakhta hai.
// Store: browser localStorage (demo) — Supabase connect ho to yehi data
// conversations/messages tables mein bhi save hota hai. User kabhi bhi
// Memory page se dekh, edit ya delete kar sakta hai.
import { create } from "zustand";
import type { CharacterId } from "@/lib/character";

export interface MemoryFact { id: string; text: string; createdAt: string; }

interface MemoryState {
  userName: string;
  interests: string[];
  facts: MemoryFact[];
  chatSummary: string;
  character: CharacterId;
  loaded: boolean;
  load: () => void;
  save: () => void;
  setUserName: (n: string) => void;
  setCharacter: (c: CharacterId) => void;
  setInterests: (i: string[]) => void;
  addFact: (text: string) => void;
  removeFact: (id: string) => void;
  setChatSummary: (s: string) => void;
  clearAll: () => void;
}

const KEY = "jarvis-memory-v1";

function readStored(): Partial<MemoryState> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<MemoryState>) : {};
  } catch { return {}; }
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  userName: "",
  interests: [],
  facts: [],
  chatSummary: "",
  character: "assistant",
  loaded: false,
  load: () => {
    if (typeof window === "undefined") return;
    if (get().loaded) return; // dobara load mat karo — warna har dafa naya state -> re-render loop
    const s = readStored();
    set({ userName: s.userName || "", interests: s.interests || [], facts: s.facts || [], chatSummary: s.chatSummary || "", character: (s.character as CharacterId) || "assistant", loaded: true });
  },
  save: () => {
    try {
      const s = get();
      localStorage.setItem(KEY, JSON.stringify({ userName: s.userName, interests: s.interests, facts: s.facts, chatSummary: s.chatSummary, character: s.character }));
    } catch { /* ignore */ }
  },
  setUserName: (userName) => { set({ userName }); get().save(); },
  setCharacter: (character) => { set({ character }); get().save(); },
  setInterests: (interests) => { set({ interests }); get().save(); },
  addFact: (text) => { const f: MemoryFact = { id: `fact-${Date.now()}`, text, createdAt: new Date().toISOString() }; set((s) => ({ facts: [...s.facts, f] })); get().save(); },
  removeFact: (id) => { set((s) => ({ facts: s.facts.filter((f) => f.id !== id) })); get().save(); },
  setChatSummary: (chatSummary) => { set({ chatSummary }); get().save(); },
  clearAll: () => { set({ userName: "", interests: [], facts: [], chatSummary: "" }); try { localStorage.removeItem(KEY); } catch { /* ignore */ } },
}));

export function memorySummaryForPrompt(m: { userName: string; interests: string[]; facts: MemoryFact[]; chatSummary: string }): string {
  const parts: string[] = [];
  if (m.userName) parts.push(`User ka naam: ${m.userName}`);
  if (m.interests.length) parts.push(`Interests: ${m.interests.join(", ")}`);
  if (m.facts.length) parts.push(`Yaad rakhi hui baatein: ${m.facts.map((f) => f.text).join(" | ")}`);
  if (m.chatSummary) parts.push(`Pichli baat cheet ka khulasa: ${m.chatSummary}`);
  return parts.join("\n");
}
