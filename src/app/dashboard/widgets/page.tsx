"use client";
import { useEffect, useState } from "react";
import { getEmbedCode, getWidgetConfig } from "@/services/widgets";

export default function WidgetsPage() {
  const [slug, setSlug] = useState("demo");
  const [copied, setCopied] = useState(false);
  const [base, setBase] = useState("");
  useEffect(() => { setBase(window.location.origin); }, []);
  const cfg = getWidgetConfig(slug);
  const code = getEmbedCode(slug, base || "http://localhost:3000");
  return (
    <div>
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>Widgets</p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Widgets</h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>Put the Jarvis chat widget on your website — paste the code below before your site&apos;s &lt;/body&gt; tag.</p>
      <div className="card-surface p-5 mt-5">
        <label className="text-sm font-bold">Business slug</label>
        <input className="input-field mt-1" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <p className="text-sm mt-3">Title: {cfg.title}</p>
        <p className="text-sm mt-1">Greeting: {cfg.greeting}</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>Language: English · Voice also understands Urdu · Colour: {cfg.primaryColor}</p>
        <pre className="p-3 mt-3 rounded-xl text-xs overflow-auto" style={{ background: "var(--bg-subtle)" }}>{code}</pre>
        <button className="btn-primary mt-3" onClick={() => { void navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "Copied ✓" : "Copy embed code"}</button>
        <a className="btn-secondary mt-3" style={{ marginInlineStart: 8 }} href="/widget-demo">See widget demo</a>
      </div>
    </div>
  );
}
