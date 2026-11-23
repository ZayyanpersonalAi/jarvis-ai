"use client";
// Always-on-top mini bar — small floating bar, mic + push-to-talk.
// Collapses to a small button on the side.
import { useState } from "react";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";
import { useVoiceStore } from "@/store/voice";

export default function MiniBar() {
  const [collapsed, setCollapsed] = useState(false);
  const { status, startLive, stop } = useRealtimeVoice();
  const isDemo = useVoiceStore((s) => s.isDemo);
  const listening = status === "listening";
  if (collapsed) {
    return (
      <button onClick={() => setCollapsed(false)} className="btn-primary" style={{ position: "fixed", top: 12, right: 12, zIndex: 60, borderRadius: 999, padding: "8px 14px" }} aria-label="Open Jarvis mini bar">J</button>
    );
  }
  return (
    <div className="card-surface" style={{ position: "fixed", top: 12, right: 12, zIndex: 60, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
      <span className="font-bold text-sm">Jarvis</span>
      <span className="badge" style={{ borderColor: "var(--border)" }}>{isDemo ? "Demo" : "Live"}</span>
      <button className="btn-primary" style={{ padding: "6px 12px" }} onMouseDown={() => void startLive()} onMouseUp={() => stop()} onTouchStart={() => void startLive()} onTouchEnd={() => stop()} title="Hold to talk (push-to-talk). Shortcut: ` or Ctrl+Space">
        {listening ? "Listening…" : "Hold to talk"}
      </button>
      <button className="btn-secondary" style={{ padding: "6px 10px" }} onClick={() => setCollapsed(true)} aria-label="Hide mini bar">—</button>
    </div>
  );
}
