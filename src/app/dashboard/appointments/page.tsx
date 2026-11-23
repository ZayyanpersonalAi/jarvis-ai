"use client";
import { useEffect, useState } from "react";
import { useBusinessStore } from "@/store/business";
import type { Appointment } from "@/types";

export default function AppointmentsPage() {
  const appointments = useBusinessStore((s) => s.appointments);
  const setAppointments = useBusinessStore((s) => s.setAppointments);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", service: "Consultation", date: new Date().toISOString().slice(0, 10), time: "15:00", notes: "" });
  const [msg, setMsg] = useState("");
  useEffect(() => { fetch("/api/appointments").then((r) => r.json()).then((j) => { if (j?.data) setAppointments(j.data); }).catch(() => undefined); }, [setAppointments]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg("");
    const res = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const j = await res.json();
    if (j?.ok && j.data) { setAppointments([j.data as Appointment, ...appointments]); setMsg("Appointment booked ✓"); setForm({ ...form, customerName: "", customerPhone: "", notes: "" }); }
    else setMsg(j?.error || "Could not book it.");
  };
  const confirm = async (id: string) => {
    const res = await fetch("/api/appointments/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const j = await res.json();
    if (j?.ok) setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: "confirmed" } : a)));
  };

  return (
    <div>
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>Appointments</p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Appointments</h1>
      <div className="card-surface p-5 mt-5">
        <h3 className="font-bold mb-3">Book a new appointment</h3>
        <form onSubmit={create} className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <input className="input-field" required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Customer name" />
          <input className="input-field" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="Phone (optional)" />
          <input className="input-field" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="Service" />
          <input className="input-field" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input className="input-field" type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <input className="input-field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" />
          <button className="btn-primary" type="submit">Book</button>
        </form>
        {msg && <p className="text-sm mt-2">{msg}</p>}
      </div>
      <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {appointments.map((a) => (
          <div key={a.id} className="card-surface p-5">
            <h3 className="font-bold">{a.customerName}</h3>
            <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>{a.service} — {a.date} {a.time}</p>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>{a.customerPhone || ""} {a.notes || ""}</p>
            <p className="text-xs mt-2">Status: <span className="badge" style={{ borderColor: "var(--border)" }}>{a.status}</span></p>
            {a.status === "pending" && <button className="btn-primary mt-3" onClick={() => void confirm(a.id)}>Confirm</button>}
          </div>
        ))}
        {appointments.length === 0 && <p className="text-sm" style={{ color: "var(--text-3)" }}>No appointments yet.</p>}
      </div>
    </div>
  );
}
