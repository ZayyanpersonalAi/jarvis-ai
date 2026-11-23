"use client";
import { useEffect, useState } from "react";
import { useMemoryStore } from "@/store/memory";

export default function MemoryPage() {
  const m = useMemoryStore();
  const [name, setName] = useState("");
  const [interestsText, setInterestsText] = useState("");
  const [fact, setFact] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { m.load(); }, []);
  useEffect(() => { if (m.loaded) { setName(m.userName); setInterestsText(m.interests.join(", ")); } }, [m.loaded]);

  return (
    <div>
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>Memory</p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Memory — how Jarvis remembers you</h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-3)", maxWidth: 640 }}>
        Jarvis remembers your name, interests and important notes so replies feel personal. Everything is saved in your browser (and in Supabase when connected). You can view, change or erase it anytime.
      </p>

      <div className="card-surface p-5 mt-5">
        <h3 className="font-bold mb-3">About you</h3>
        <div className="grid gap-2" style={{ maxWidth: 480 }}>
          <label className="text-sm font-bold">Your name</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Zayyan" />
          <label className="text-sm font-bold">Interests (separate with commas)</label>
          <input className="input-field" value={interestsText} onChange={(e) => setInterestsText(e.target.value)} placeholder="e.g. cricket, AI, business" />
          <button className="btn-primary" onClick={() => { m.setUserName(name); m.setInterests(interestsText.split(",").map((s) => s.trim()).filter(Boolean)); setSaved(true); setTimeout(() => setSaved(false), 1500); }}>{saved ? "Saved ✓" : "Save"}</button>
        </div>
      </div>

      <div className="card-surface p-5 mt-4">
        <h3 className="font-bold mb-3">Remembered notes ({m.facts.length})</h3>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (fact.trim()) { m.addFact(fact.trim()); setFact(""); } }}>
          <input className="input-field" value={fact} onChange={(e) => setFact(e.target.value)} placeholder="Remember something new — e.g. I like waking up early" />
          <button className="btn-primary" type="submit">Remember</button>
        </form>
        <div className="mt-3 space-y-2">
          {m.facts.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-2 p-2 rounded" style={{ background: "var(--bg-subtle)" }}>
              <span className="text-sm">{f.text}</span>
              <button className="btn-secondary" onClick={() => m.removeFact(f.id)}>Delete</button>
            </div>
          ))}
          {m.facts.length === 0 && <p className="text-sm mt-2" style={{ color: "var(--text-3)" }}>Nothing remembered yet.</p>}
        </div>
        {m.chatSummary && <p className="text-sm mt-3">Chat summary: {m.chatSummary}</p>}
      </div>

      <div className="card-surface p-5 mt-4">
        <h3 className="font-bold mb-2">Erase memory</h3>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>One click and Jarvis forgets everything — name, interests, notes.</p>
        <button className="btn-secondary mt-2" onClick={() => { if (confirm("Are you sure you want to erase all memory?")) { m.clearAll(); setName(""); setInterestsText(""); } }}>Erase all memory</button>
      </div>
    </div>
  );
}
