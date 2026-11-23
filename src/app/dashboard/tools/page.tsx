"use client";
import { useEffect, useState } from "react";
import type { ToolInfo } from "@/types";

export default function ToolsPage() {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [result, setResult] = useState("");
  const [running, setRunning] = useState("");
  useEffect(() => { fetch("/api/tools").then((r) => r.json()).then((j) => setTools(j?.data || [])).catch(() => undefined); }, []);
  const run = async (name: string) => {
    setRunning(name); setResult("");
    try {
      const res = await fetch("/api/tools", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, args: {} }) });
      const j = await res.json();
      setResult(j?.message || j?.data?.message || JSON.stringify(j));
    } catch { setResult("The tool could not run."); }
    finally { setRunning(""); }
  };
  return (
    <div>
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>Tools</p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Tools ({tools.length})</h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>Every tool runs a demo without arguments. For full use, give a command by voice or chat.</p>
      {result && <div className="card-surface p-4 mt-4 whitespace-pre-wrap text-sm">{result}</div>}
      <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {tools.map((t) => (
          <div key={t.name} className="card-surface p-5">
            <h3 className="font-bold">{t.name}</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{t.category}</p>
            <p className="text-sm mt-2" style={{ color: "var(--text-2)" }}>{t.description}</p>
            <button className="btn-primary mt-3" disabled={running === t.name} onClick={() => void run(t.name)}>{running === t.name ? "Running…" : "Run"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
