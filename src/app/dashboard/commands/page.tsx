"use client";
import { useState } from "react";
import { JARVIS_COMMANDS, TOOL_CATEGORIES } from "@/constants";

export default function CommandsPage() {
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState("");
  const list = JARVIS_COMMANDS.filter((c) => filter === "all" || c.category === filter);
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(text); setTimeout(() => setCopied(""), 1500); } catch { /* ignore */ }
  };
  return (
    <div>
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>Voice Commands</p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Commands</h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-3)", maxWidth: 640 }}>
        Say these to the voice assistant, or type them in chat — in Urdu script, Roman Urdu or English. Jarvis recognises the command and runs the matching tool.
      </p>
      <div className="flex flex-wrap gap-2 mt-5">
        <button className={filter === "all" ? "btn-primary" : "btn-secondary"} onClick={() => setFilter("all")}>All</button>
        {TOOL_CATEGORIES.map((c) => (
          <button key={c.id} className={filter === c.id ? "btn-primary" : "btn-secondary"} onClick={() => setFilter(c.id)}>{c.name}</button>
        ))}
      </div>
      <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {list.map((c) => (
          <div key={c.id} className="card-surface p-5">
            <p className="urdu-phrase text-lg font-bold" lang="ur">{c.urdu}</p>
            <p className="text-sm mt-1">{c.romanUrdu}</p>
            <p className="text-sm font-semibold mt-1" style={{ color: "var(--teal-700)" }}>{c.english}</p>
            <p className="text-xs mt-3" style={{ color: "var(--text-3)" }}>Example: <span className="urdu-phrase" lang="ur">{c.example}</span></p>
            <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>Tool: <code>{c.tool}</code></p>
            <button className="btn-secondary mt-3" onClick={() => void copy(c.urdu)}>{copied === c.urdu ? "Copied ✓" : "Copy Urdu phrase"}</button>
          </div>
        ))}
      </div>
      <div className="card-surface p-5 mt-5">
        <h3 className="font-bold">How a command works</h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>1) You speak or type → 2) <code>src/lib/command-parser.ts</code> recognises the command → 3) the matching tool runs in <code>src/ai/tools.ts</code> → 4) Jarvis tells you the result in the same language you used. To add a command, add one line to <code>JARVIS_COMMANDS</code>.</p>
      </div>
    </div>
  );
}
