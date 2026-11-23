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

  const check = async () => {
    try {
      const res = await fetch("/api/pc/status");
      const j = await res.json();
      setConnected(Boolean(j.connected));
      setStatusMsg(j.connected ? `Connected ✓ — ${j.info?.platform || ""} (${j.info?.hostname || ""})` : (j.error || "PC Agent is not connected"));
    } catch { setConnected(false); setStatusMsg("PC Agent is not connected"); }
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
      const res = await fetch("/api/pc/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: commandText, confirm }) });
      const j = await res.json();
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
        <b style={{ color: "var(--text-1)" }}> The web app alone cannot control a PC</b> — the <code>pc-agent</code> must be running on your PC (steps below).
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
            <b>Connect the PC Agent:</b>
            <ol className="mt-1 space-y-1" style={{ paddingInlineStart: 20 }}>
              <li>1. On your PC, open a terminal and run: <code>cd pc-agent && node agent.js</code></li>
              <li>2. Copy the token from the terminal</li>
              <li>3. Add it to Jarvis&apos; <code>.env.local</code>: <code>JARVIS_PC_URL=http://127.0.0.1:8787</code> and <code>JARVIS_PC_TOKEN=your-token</code></li>
              <li>4. Restart the web app (<code>npm run dev</code>)</li>
            </ol>
            <p className="mt-2" style={{ color: "var(--text-3)" }}>Full guide: <code>pc-agent/README.md</code></p>
          </div>
        )}
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
