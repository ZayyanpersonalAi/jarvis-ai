"use client";
import { useEffect, useState } from "react";
import { PC_COMMANDS } from "@/lib/pc-commands";

export default function PcControlPage() {
  const [enabled, setEnabled] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [confirmDanger, setConfirmDanger] = useState(false);

  const AGENT = "http://127.0.0.1:8787";
  const getToken = () => { try { return localStorage.getItem("jarvis-pc-token") || ""; } catch { return ""; } };
  const check = async () => {
    try {
      const res = await fetch(`${AGENT}/status`);
      const j = await res.json();
      setConnected(Boolean(j.ok));
      setStatusMsg(j.ok ? `Connected ✓ — ${j.platform || ""} (${j.hostname || ""})` : "PC Agent is not connected");
    } catch { setConnected(false); setStatusMsg("PC Agent is not connected — desktop app kholein (agent khud chal jata hai)"); }
  };
  useEffect(() => {
    try { setEnabled(localStorage.getItem("jarvis-pc-enabled") === "1"); } catch { /* ignore */ }
    void check();
  }, []);
  const toggle = (v: boolean) => {
    setEnabled(v);
    try { localStorage.setItem("jarvis-pc-enabled", v ? "1" : "0"); } catch { /* ignore */ }
  };
  const send = async (commandText: string, confirm = false) => {
    if (!enabled) { setResult("PC Control is OFF — turn on the toggle above first."); return; }
    setResult("Sending…");
    try {
      const res = await fetch(`${AGENT}/command`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: commandText, confirm, token: getToken() }) });
      const j = await res.json();
      if (res.status === 401) { setResult("Token ghalat hai — neeche apne PC ka token ek dafa paste karein (desktop app me khud lag jata hai)."); return; }
      if (j.needsConfirmation) { setResult(`⚠️ ${j.message}\n\nPress "Send with confirmation" to send it again.`); setConfirmDanger(true); return; }
      setConfirmDanger(false);
      setResult(j.message || JSON.stringify(j));
    } catch { setResult("Could not reach the PC agent."); }
  };

  return (
    <div>
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>PC Control</p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>PC Control</h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-3)", maxWidth: 640 }}>
        Control your whole PC by voice — open apps and websites, volume, lock, screenshots and more.
        <b style={{ color: "var(--text-1)" }}> Desktop app me PC agent khud-ba-khud chal jata hai — koi command chalane ki zaroorat nahi.</b> Sirf browser me hon to agent wale PC par ye page kholein.
      </p>

      <div className="card-surface p-5 mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold">PC Control {enabled ? "ON" : "OFF"}</h3>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>Status: {connected === null ? "Checking…" : statusMsg}</p>
          </div>
          <div className="flex gap-2">
            <button className={enabled ? "btn-primary" : "btn-secondary"} onClick={() => toggle(!enabled)}>{enabled ? "ON ✓" : "OFF — turn on"}</button>
            <button className="btn-secondary" onClick={() => void check()}>Check status again</button>
          </div>
        </div>
        {!connected && (
          <div className="mt-3 p-4 rounded-xl text-sm" style={{ background: "var(--bg-subtle)" }}>
            <b>PC Agent connect karein (koi command nahi chalani):</b>
            <ol className="mt-1 space-y-1" style={{ paddingInlineStart: 20 }}>
              <li>1. <b>Desktop app</b> kholein — PC agent usi ke andar khud chal jata hai, token bhi khud lag jata hai. Bas ye page refresh karein.</li>
              <li>2. Sirf browser use kar rahe hain to: desktop app ek dafa khol kar band kar dein, phir token file <code>pc-agent/.jarvis-pc-token</code> se token neeche paste kar dein — sirf ek dafa, save ho jayega.</li>
            </ol>
            <div className="flex gap-2 mt-2">
              <input className="input-field" id="pc-token-input" placeholder="PC token (sirf browser ke liye)" />
              <button className="btn-secondary" onClick={() => { const el = document.getElementById("pc-token-input") as HTMLInputElement | null; if (el?.value) { try { localStorage.setItem("jarvis-pc-token", el.value.trim()); } catch { /* ignore */ } void check(); } }}>Save token</button>
            </div>
          </div>
        )}
      </div>

      <div className="card-surface p-5 mt-4">
        <h3 className="font-bold mb-2">Connection Key (Pairing)</h3>
        <p className="text-sm" style={{ color: "var(--text-2)" }}>Ye key is web app me save rehti hai. <b>Desktop app isi key ko utha kar khud connect ho jata hai</b> — app me alag se kuch dalna nahi parta. Agar kabhi alag PC agent chalana ho to us PC par <code>JARVIS_PC_TOKEN</code> me yehi key dalni hai, bas.</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <input className="input-field" id="pair-key-input" placeholder="Apni key likhein, ya Generate dabayein" style={{ maxWidth: 360 }} />
          <button className="btn-secondary" onClick={() => { const el = document.getElementById("pair-key-input") as HTMLInputElement | null; if (el?.value?.trim()) { try { localStorage.setItem("jarvis-pc-token", el.value.trim()); } catch { /* ignore */ } void check(); } }}>Key save karein</button>
          <button className="btn-secondary" onClick={() => { const k = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10); try { localStorage.setItem("jarvis-pc-token", k); } catch { /* ignore */ } const el = document.getElementById("pair-key-input") as HTMLInputElement | null; if (el) el.value = k; void check(); }}>Generate key</button>
          <button className="btn-secondary" onClick={() => { const el = document.getElementById("pair-key-input") as HTMLInputElement | null; try { if (el) el.value = localStorage.getItem("jarvis-pc-token") || ""; } catch { /* ignore */ } }}>Meri saved key dikhao</button>
        </div>
      </div>

      <div className="card-surface p-5 mt-4">
        <h3 className="font-bold mb-2">Try a PC command (or say it on the Voice page)</h3>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) void send(text); }}>
          <input className="input-field" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. chrome kholo / open Chrome" />
          <button className="btn-primary" type="submit">Send</button>
        </form>
        {confirmDanger && <button className="btn-primary mt-2" onClick={() => void send(text, true)}>⚠️ Send with confirmation (shutdown/restart)</button>}
        {result && <p className="text-sm mt-3 whitespace-pre-wrap">{result}</p>}
      </div>

      <div className="card-surface p-5 mt-4">
        <h3 className="font-bold mb-3">All PC Commands</h3>
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {PC_COMMANDS.map((c) => (
            <button key={c.id} className="card-surface card-hover p-4" style={{ textAlign: "left" }} onClick={() => { setText(c.urdu); void send(c.urdu); }}>
              <p className="urdu-phrase font-bold" lang="ur">{c.urdu}</p>
              <p className="text-sm mt-1">{c.romanUrdu}</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>{c.english}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card-surface p-5 mt-4">
        <h3 className="font-bold">⚠️ Safety</h3>
        <ul className="text-sm mt-2 space-y-1" style={{ paddingInlineStart: 20, color: "var(--text-2)" }}>
          <li>Delete and Format are <b style={{ color: "var(--text-1)" }}>BLOCKED</b> — they never run.</li>
          <li>Shutdown / Restart only run after a second confirmation.</li>
          <li>Only allowlisted apps open — no random programs.</li>
          <li>The PC agent only listens on localhost (127.0.0.1) — no internet access.</li>
          <li>Never share your token.</li>
        </ul>
      </div>
    </div>
  );
}
