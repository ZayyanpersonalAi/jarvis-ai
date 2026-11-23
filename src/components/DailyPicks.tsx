"use client";
import { useEffect, useState } from "react";
import { useMemoryStore } from "@/store/memory";

interface Pick { title: string; summary: string; tag: string; }

export default function DailyPicks() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [date, setDate] = useState("");
  const interests = useMemoryStore((s) => s.interests);
  const interestsKey = interests.join(",");
  useEffect(() => {
    fetch(`/api/daily-picks?interests=${encodeURIComponent(interestsKey)}`)
      .then((r) => r.json())
      .then((j) => { setPicks(j?.picks || []); setDate(j?.date || ""); })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interestsKey]);
  if (!picks.length) return null;
  return (
    <div className="card-surface p-5 mt-10">
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>Your World</p>
      <h3 className="font-bold text-lg mt-1" style={{ letterSpacing: "-0.01em" }}>Daily Picks {date ? `· ${date}` : ""}</h3>
      <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>Three picks a day, based on your interests. Demo picks — live news needs a search key.</p>
      <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {picks.map((p) => (
          <div key={p.title} className="p-4 rounded-xl" style={{ background: "var(--bg-subtle)" }}>
            <span className="badge" style={{ borderColor: "var(--border)" }}>{p.tag}</span>
            <h4 className="font-bold mt-2 text-sm">{p.title}</h4>
            <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>{p.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
