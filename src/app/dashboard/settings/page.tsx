"use client";
import { useEffect, useState } from "react";
import { useBusinessStore } from "@/store/business";
import { useMemoryStore } from "@/store/memory";
import { CHARACTERS } from "@/lib/character";

export default function SettingsPage() {
  const business = useBusinessStore((s) => s.business);
  const setBusiness = useBusinessStore((s) => s.setBusiness);
  const [name, setName] = useState(business.name);
  const [phone, setPhone] = useState(business.phone || "");
  const [saved, setSaved] = useState(false);
  const character = useMemoryStore((s) => s.character);
  const setCharacter = useMemoryStore((s) => s.setCharacter);
  const loadMemory = useMemoryStore((s) => s.load);
  useEffect(() => { loadMemory(); }, [loadMemory]);
  const [keyStatus, setKeyStatus] = useState<Record<string, boolean>>({});
  useEffect(() => { fetch("/api/status").then((r) => r.json()).then((j) => setKeyStatus(j || {})).catch(() => undefined); }, []);
  const keys = [
    { key: "GEMINI_API_KEY", need: "AI replies + live voice transcription (FREE)", set: Boolean(keyStatus.gemini) },
    { key: "OPENAI_API_KEY", need: "Realtime voice (paid, optional)", set: Boolean(keyStatus.openai) },
    { key: "NEXT_PUBLIC_SUPABASE_URL + ANON_KEY", need: "Real login + data", set: Boolean(keyStatus.supabase) },
    { key: "RESEND_API_KEY", need: "Real email sending", set: Boolean(keyStatus.resend) },
    { key: "STRIPE_SECRET_KEY", need: "Payments", set: Boolean(keyStatus.stripe) },
  ];
  return (
    <div>
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>Settings</p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Settings</h1>

      <div className="card-surface p-5 mt-5">
        <h3 className="font-bold mb-3">Business Profile</h3>
        <div className="grid gap-2" style={{ maxWidth: 480 }}>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Business name" />
          <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
          <button className="btn-primary" onClick={() => { setBusiness({ ...business, name, phone }); setSaved(true); setTimeout(() => setSaved(false), 1500); }}>{saved ? "Saved ✓" : "Save"}</button>
        </div>
      </div>

      <div className="card-surface p-5 mt-4">
        <h3 className="font-bold mb-1">Jarvis Character</h3>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>Jarvis is a character, not just a tool — pick a style. Replies will follow that tone.</p>
        <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {CHARACTERS.map((c) => (
            <button key={c.id} className={character === c.id ? "btn-primary" : "btn-secondary"} style={{ textAlign: "left", padding: 12 }} onClick={() => setCharacter(c.id)}>
              <span className="font-bold block">{c.name}</span>
              <span className="text-sm block">{c.tagline}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card-surface p-5 mt-4">
        <h3 className="font-bold mb-1">Voice Language</h3>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>Jarvis understands Urdu, Roman Urdu and English automatically — speak in any of them. Replies come back in the same language you spoke. No setting to change.</p>
      </div>

      <div className="card-surface p-5 mt-4">
        <h3 className="font-bold mb-1">API Key Status</h3>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>Keys live on the server in .env.local — they are never shown in the browser. Below is only what each key unlocks:</p>
        {keys.map((k) => (
          <p key={k.key} className="text-sm mt-2"><code>{k.key}</code> — {k.need} — <b style={{ color: k.set ? "#2dd4bf" : "#f87171" }}>{k.set ? "Connected ✓" : "Not connected"}</b></p>
        ))}
        <p className="text-sm mt-3" style={{ color: "var(--text-2)" }}>Apps connect karne ke liye <a href="/dashboard/connections" style={{ color: "var(--teal-400)", fontWeight: 600 }}>Connections page</a> par tamam options hain.</p>
      </div>
    </div>
  );
}
