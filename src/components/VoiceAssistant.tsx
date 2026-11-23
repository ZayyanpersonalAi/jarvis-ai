"use client";
// Jarvis Voice Assistant — mic, waveform, transcript, chat.
// UI is English. Voice understands Urdu script, Roman Urdu and English;
// replies come back in the same language the user spoke.
import { useEffect, useState } from "react";
import { useMemoryStore } from "@/store/memory";
import { getCharacter } from "@/lib/character";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";
import { useVoiceStore } from "@/store/voice";

const STATUS_LABEL: Record<string, string> = {
  idle: "Ready",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  error: "Something went wrong",
};

export default function VoiceAssistant() {
  const { status, error, isDemo, startLive, stop, sendText } = useRealtimeVoice();
  const messages = useVoiceStore((s) => s.messages);
  const transcript = useVoiceStore((s) => s.transcript);
  const [input, setInput] = useState("");
  const characterId = useMemoryStore((s) => s.character);
  const character = getCharacter(characterId);

  // Push-to-talk shortcut: ` (Backquote) or Ctrl+Space — hold to talk.
  // Does not fire while typing in an input field.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.code === "Backquote" || (e.ctrlKey && e.code === "Space")) { e.preventDefault(); if (useVoiceStore.getState().status !== "listening") void startLive(); }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Backquote" || (e.ctrlKey && e.code === "Space")) stop();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [startLive, stop]);

  const listening = status === "listening";

  return (
    <div className="card-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ letterSpacing: "-0.01em" }}>Jarvis Voice Assistant — {character.name}</h2>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>Speak or type in Urdu, Roman Urdu or English</p>
        </div>
        <span className="badge" style={{ borderColor: "var(--border)" }}>{isDemo ? "Demo Mode" : "Live Mode"}</span>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <button
          onClick={listening ? stop : startLive}
          onMouseDown={(e) => { if (e.button === 0) void startLive(); }}
          onMouseUp={() => stop()}
          onTouchStart={() => void startLive()}
          onTouchEnd={() => stop()}
          className="btn-primary" style={{ width: 92, height: 92, borderRadius: "50%", fontSize: 28, boxShadow: listening ? "0 0 0 8px rgba(45,212,191,0.18), 0 0 0 16px rgba(45,212,191,0.08), 0 8px 32px rgba(45,212,191,0.45)" : "0 0 0 6px rgba(45,212,191,0.10), 0 8px 28px rgba(45,212,191,0.35)" }} aria-label="Hold to talk" title="Push-to-talk: hold to talk, release for a reply. Shortcut: ` or Ctrl+Space">
          {listening ? (
            <span aria-hidden style={{ display: "inline-block", width: 22, height: 22, background: "#052e2b", borderRadius: 4 }} />
          ) : (
            <svg aria-hidden width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#052e2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
          )}
        </button>
        <p className="text-sm font-semibold">{listening ? "Listening — hold to talk" : "Hold the mic to talk"}</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>Push-to-talk: hold the mic, or hold ` / Ctrl+Space</p>
        <p className="text-sm font-semibold">{STATUS_LABEL[status] || status}</p>
        {listening && (
          <div className="flex items-end gap-1" style={{ height: 28 }} aria-hidden>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <span key={i} className="waveform-bar" style={{ height: 10 + (i % 4) * 5 }} />)}
          </div>
        )}
        {transcript && <p className="text-sm" style={{ color: "var(--text-2)" }}>You said: {transcript}</p>}
        {error && <p className="text-sm" style={{ color: "#b91c1c" }}>{error}</p>}
        {isDemo && <p className="text-xs" style={{ color: "var(--text-3)", maxWidth: 480 }}>Demo Mode: real OpenAI voice needs OPENAI_API_KEY. Your browser&apos;s speech recognition is being used instead — it understands Urdu too.</p>}
      </div>

      <div className="mt-6 space-y-2" style={{ maxHeight: 320, overflowY: "auto" }}>
        {messages.length === 0 && (
          <div className="text-sm" style={{ color: "var(--text-3)" }}>
            <p>No conversation yet — hold the mic or type below. Try:</p>
            <p className="mt-1">“appointment book karo” — Book an appointment</p>
            <p className="mt-1">“waqt kya hua hai?” — What time is it?</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="p-3 rounded-lg" style={{ background: m.role === "user" ? "var(--bg-subtle)" : "var(--bg-raised)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold">{m.role === "user" ? "You" : "Jarvis"}{m.toolUsed ? ` · Tool: ${m.toolUsed}` : ""}</p>
            <p className="text-sm whitespace-pre-wrap mt-0.5">{m.text}</p>
          </div>
        ))}
      </div>

      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!input.trim()) return; const t = input; setInput(""); void sendText(t); }}>
        <input className="input-field" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type here, or hold the mic to speak…" />
        <button className="btn-primary" type="submit">Send</button>
      </form>
    </div>
  );
}
