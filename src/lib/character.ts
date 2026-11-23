// Jarvis character — Stonic-style: one character, not just a tool.
// The user picks a personality in Settings or on the home page:
// Assistant / Mentor / Best Friend. Each has its own tone, but facts
// are never invented. promptSuffixUrdu is Roman-Urdu voice-prompt text
// (voice behaviour, not UI) — it tells the model how to speak.
export type CharacterId = "assistant" | "mentor" | "friend";

export interface CharacterDef {
  id: CharacterId;
  name: string;
  tagline: string;
  promptSuffixUrdu: string;
  voiceRate: number;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: "assistant", name: "Assistant",
    tagline: "Professional, short and helpful — work first",
    promptSuffixUrdu: "Lehja: peshawar, mukhtasar aur madadgaar. Pehle kaam ki baat, phir tafseel.",
    voiceRate: 1.0,
  },
  {
    id: "mentor", name: "Mentor",
    tagline: "A teacher — a little guidance in every answer",
    promptSuffixUrdu: "Lehja: ek ustaad jaisa — samjhao, rehnumai karo, aur user ko behtar karne ki targheeb do. Lambay lecture mat do.",
    voiceRate: 0.95,
  },
  {
    id: "friend", name: "Best Friend",
    tagline: "Friendly and warm — like talking to someone close",
    promptSuffixUrdu: "Lehja: ek behtareen dost jaisa — garmajosh, halka phulka, kabhi kabhi halki si mazaah. Phir bhi kaam poora karo.",
    voiceRate: 1.05,
  },
];

export function getCharacter(id: string): CharacterDef {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}
