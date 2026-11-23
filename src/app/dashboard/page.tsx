"use client";
import { useEffect, useState } from "react";
import { useBusinessStore } from "@/store/business";
import DailyPicks from "@/components/DailyPicks";
import Link from "next/link";

export default function DashboardPage() {
  const business = useBusinessStore((s) => s.business);
  const appointments = useBusinessStore((s) => s.appointments);
  const [toolCount, setToolCount] = useState(0);
  useEffect(() => { fetch("/api/tools").then((r) => r.json()).then((j) => setToolCount(j?.data?.length || 0)).catch(() => undefined); }, []);
  const confirmed = appointments.filter((a) => a.status === "confirmed").length;
  const pending = appointments.filter((a) => a.status === "pending").length;
  const stats = [
    { label: "Total appointments", value: appointments.length },
    { label: "Confirmed", value: confirmed },
    { label: "Pending", value: pending },
    { label: "Tools ready", value: toolCount },
  ];
  return (
    <div>
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>Dashboard</p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>{business.name}</h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>Welcome back — run Jarvis from here: voice, tools, commands and appointments.</p>

      <div className="grid gap-3 mt-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card p-4"><p className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>{s.value}</p><p className="text-sm font-medium mt-1" style={{ color: "var(--text-2)" }}>{s.label}</p></div>
        ))}
      </div>

      <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <Link href="/dashboard/voice" className="card-surface card-hover p-5 block"><h3 className="font-bold">Voice Assistant</h3><p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Speak in Urdu, Roman Urdu or English — Jarvis answers in the same language.</p><span className="text-sm font-semibold mt-3 inline-block" style={{ color: "var(--teal-700)" }}>Talk now →</span></Link>
        <Link href="/dashboard/commands" className="card-surface card-hover p-5 block"><h3 className="font-bold">Commands</h3><p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Every voice command in one list — Urdu phrase with its English meaning.</p><span className="text-sm font-semibold mt-3 inline-block" style={{ color: "var(--teal-700)" }}>See commands →</span></Link>
        <Link href="/dashboard/tools" className="card-surface card-hover p-5 block"><h3 className="font-bold">Tools</h3><p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>{toolCount} tools — try them and run them from here.</p><span className="text-sm font-semibold mt-3 inline-block" style={{ color: "var(--teal-700)" }}>Open tools →</span></Link>
        <Link href="/dashboard/appointments" className="card-surface card-hover p-5 block"><h3 className="font-bold">Appointments</h3><p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>See today&apos;s appointments and book a new one.</p><span className="text-sm font-semibold mt-3 inline-block" style={{ color: "var(--teal-700)" }}>View →</span></Link>
        <Link href="/dashboard/pc-control" className="card-surface card-hover p-5 block"><h3 className="font-bold">PC Control</h3><p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Control your whole PC by voice, with the local PC agent.</p><span className="text-sm font-semibold mt-3 inline-block" style={{ color: "var(--teal-700)" }}>Set up →</span></Link>
      </div>

      <div className="card-surface p-5 mt-5">
        <p className="eyebrow" style={{ color: "var(--text-3)" }}>System Core</p>
        <h3 className="font-bold text-lg mt-1">Four parts, always on</h3>
        <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <Link href="/dashboard/memory" className="p-4 rounded-xl block card-hover" style={{ background: "var(--bg-subtle)" }}><p className="font-bold">Memory</p><p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Name, interests and remembered notes — view, change or erase.</p></Link>
          <Link href="/dashboard/tools" className="p-4 rounded-xl block card-hover" style={{ background: "var(--bg-subtle)" }}><p className="font-bold">Skills</p><p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>{toolCount} tools ready — appointments, email, PC control and more.</p></Link>
          <Link href="/dashboard/settings" className="p-4 rounded-xl block card-hover" style={{ background: "var(--bg-subtle)" }}><p className="font-bold">Character</p><p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Assistant, Mentor or Best Friend — choose your Jarvis.</p></Link>
          <Link href="/dashboard/settings" className="p-4 rounded-xl block card-hover" style={{ background: "var(--bg-subtle)" }}><p className="font-bold">Settings</p><p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Business profile and API key status.</p></Link>
        </div>
      </div>

      <DailyPicks />

      <div className="card-surface p-5 mt-5">
        <h3 className="font-bold">Today&apos;s appointments</h3>
        {appointments.length === 0 ? <p className="text-sm mt-2" style={{ color: "var(--text-3)" }}>No appointments yet.</p> : appointments.slice(0, 5).map((a) => (
          <p key={a.id} className="text-sm mt-2">{a.customerName} — {a.service} — {a.date} {a.time} ({a.status})</p>
        ))}
      </div>
    </div>
  );
}
