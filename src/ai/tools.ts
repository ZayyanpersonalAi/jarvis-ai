// Jarvis AI — Tool registry
// 20+ working tools. Each tool: name, zod schema, execute().
// Demo mode: runs without keys (in-memory). With real keys, email (Resend)
// and the OpenAI path are used. Path to 150+ apps: CONNECTORS below —
// mock connector definitions, not live connections; each connector needs
// its own API key + OAuth (Composio-style).
import { z } from "zod";
import { demoAppointments, demoNotes, demoReminders } from "@/lib/memory";
import { DEMO_BUSINESS } from "@/constants";
import { sendPcCommand } from "@/lib/pc-agent";

export interface ToolDefinition {
  name: string;
  category: string;
  description: string;
  schema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  execute: (args: Record<string, unknown>) => Promise<{ ok: boolean; message: string; data?: unknown }>;
}

const s = (v: unknown) => String(v ?? "");
const today = () => new Date().toISOString().slice(0, 10);

function calc(expression: string): number | null {
  const clean = expression.replace(/[^\d+\-*/().\s]/g, "").trim();
  if (!clean || !/^[\d+\-*/().\s]+$/.test(clean)) return null;
  try { const v = Function(`"use strict"; return (${clean})`)() as number; return typeof v === "number" && isFinite(v) ? v : null; } catch { return null; }
}

const URDU_TO_EN: Record<string, string> = { "شکریہ": "Thank you", "سلام": "Hello / Peace", "صبح بخیر": "Good morning", "اللہ حافظ": "Goodbye", "کیسے ہو": "How are you", "محبت": "Love", "دوست": "Friend", "کتاب": "Book", "پانی": "Water", "کھانا": "Food" };
const EN_TO_UR: Record<string, string> = { "thank you": "شکریہ", "hello": "سلام", "good morning": "صبح بخیر", "goodbye": "اللہ حافظ", "how are you": "کیسے ہو", "love": "محبت", "friend": "دوست", "book": "کتاب", "water": "پانی", "food": "کھانا" };

export const TOOLS: ToolDefinition[] = [
  { name: "book_appointment", category: "appointments",
    description: "Book a new appointment",
    schema: z.object({ customerName: z.string().optional(), service: z.string().optional(), date: z.string().optional(), time: z.string().optional(), customerPhone: z.string().optional() }),
    execute: async (a) => {
      const apt = { id: `apt-${Date.now()}`, businessId: "demo-business", customerName: s(a.customerName) || "Guest", customerPhone: s(a.customerPhone) || undefined, service: s(a.service) || "Consultation", date: s(a.date) || today(), time: s(a.time) || "15:00", status: "pending" as const, createdAt: new Date().toISOString() };
      demoAppointments.push(apt);
      return { ok: true, message: `Appointment booked — ${apt.customerName}, ${apt.service}, ${apt.date} ${apt.time}.`, data: apt };
    } },
  { name: "list_appointments", category: "appointments",
    description: "List appointments",
    schema: z.object({ date: z.string().optional() }),
    execute: async (a) => {
      const list = demoAppointments.filter((x) => !a.date || x.date === s(a.date));
      const text = list.length ? list.map((x) => `${x.customerName} — ${x.service} — ${x.date} ${x.time} (${x.status})`).join("\n") : "No appointments found.";
      return { ok: true, message: text, data: list };
    } },
  { name: "cancel_appointment", category: "appointments",
    description: "Cancel an appointment by id or customer name",
    schema: z.object({ id: z.string().optional(), customerName: z.string().optional() }),
    execute: async (a) => {
      const apt = demoAppointments.find((x) => (a.id && x.id === s(a.id)) || (a.customerName && x.customerName.includes(s(a.customerName))));
      if (!apt) return { ok: false, message: "That appointment was not found." };
      apt.status = "cancelled";
      return { ok: true, message: `${apt.customerName}'s appointment has been cancelled.`, data: apt };
    } },
  { name: "confirm_appointment", category: "appointments",
    description: "Confirm an appointment",
    schema: z.object({ id: z.string() }),
    execute: async (a) => {
      const apt = demoAppointments.find((x) => x.id === s(a.id));
      if (!apt) return { ok: false, message: "Appointment not found." };
      apt.status = "confirmed";
      return { ok: true, message: `${apt.customerName}'s appointment is confirmed.`, data: apt };
    } },
  { name: "send_email", category: "communication",
    description: "Send an email (Resend if key present, else demo log)",
    schema: z.object({ to: z.string(), subject: z.string(), body: z.string() }),
    execute: async (a) => {
      const key = process.env.RESEND_API_KEY;
      if (key) {
        const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "Jarvis <onboarding@resend.dev>", to: [s(a.to)], subject: s(a.subject), text: s(a.body) }) });
        if (!res.ok) return { ok: false, message: `Email could not be sent (Resend error ${res.status}).` };
        return { ok: true, message: `Email sent to ${s(a.to)}.` };
      }
      return { ok: true, message: `Demo Mode: email to ${s(a.to)} is ready to send — subject: ${s(a.subject)}. Real sending needs RESEND_API_KEY.`, data: { to: a.to, subject: a.subject, demo: true } };
    } },
  { name: "create_reminder", category: "productivity",
    description: "Create a reminder",
    schema: z.object({ text: z.string(), when: z.string().optional() }),
    execute: async (a) => {
      const r = { id: `rem-${Date.now()}`, text: s(a.text), when: s(a.when) || "Today", createdAt: new Date().toISOString() };
      demoReminders.push(r);
      return { ok: true, message: `Reminder set: ${r.text} (${r.when}).`, data: r };
    } },
  { name: "create_note", category: "productivity",
    description: "Save a note",
    schema: z.object({ text: z.string() }),
    execute: async (a) => {
      const n = { id: `note-${Date.now()}`, text: s(a.text), createdAt: new Date().toISOString() };
      demoNotes.push(n);
      return { ok: true, message: `Note saved: ${n.text}`, data: n };
    } },
  { name: "list_notes", category: "productivity",
    description: "List saved notes",
    schema: z.object({}),
    execute: async () => ({ ok: true, message: demoNotes.length ? demoNotes.map((n) => `• ${n.text}`).join("\n") : "No notes yet.", data: demoNotes }) },
  { name: "list_reminders", category: "productivity",
    description: "List reminders",
    schema: z.object({}),
    execute: async () => ({ ok: true, message: demoReminders.length ? demoReminders.map((r) => `• ${r.text} (${r.when})`).join("\n") : "No reminders yet.", data: demoReminders }) },
  { name: "calculate", category: "utility",
    description: "Calculate a maths expression",
    schema: z.object({ expression: z.string() }),
    execute: async (a) => {
      const v = calc(s(a.expression));
      if (v === null) return { ok: false, message: "Could not understand that calculation — try something like 1500 + 2500." };
      return { ok: true, message: `${s(a.expression)} = ${v}`, data: { result: v } };
    } },
  { name: "get_time", category: "utility",
    description: "Current time in Pakistan",
    schema: z.object({}),
    execute: async () => {
      const t = new Date().toLocaleTimeString("en-PK", { timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit" });
      return { ok: true, message: `The time is: ${t} (Pakistan)`, data: { time: t } };
    } },
  { name: "get_date", category: "utility",
    description: "Today's date",
    schema: z.object({}),
    execute: async () => {
      const d = new Date().toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", weekday: "long", year: "numeric", month: "long", day: "numeric" });
      return { ok: true, message: `Today is: ${d}`, data: { date: d } };
    } },
  { name: "translate_to_english", category: "language",
    description: "Translate Urdu text to English (small built-in dictionary; full translation needs OpenAI key)",
    schema: z.object({ text: z.string() }),
    execute: async (a) => {
      const t = s(a.text).trim();
      return { ok: true, message: `English: ${URDU_TO_EN[t] || `[${t}] — full translation needs an OpenAI key`}`, data: { translation: URDU_TO_EN[t] || null } };
    } },
  { name: "translate_to_urdu", category: "language",
    description: "Translate English text to Urdu (small built-in dictionary)",
    schema: z.object({ text: z.string() }),
    execute: async (a) => {
      const t = s(a.text).trim().toLowerCase();
      return { ok: true, message: `Urdu: ${EN_TO_UR[t] || `[${t}] — full translation needs an OpenAI key`}`, data: { translation: EN_TO_UR[t] || null } };
    } },
  { name: "get_weather", category: "utility",
    description: "Weather note — live weather needs a weather API key; demo returns a guidance message",
    schema: z.object({ city: z.string().optional() }),
    execute: async (a) => ({ ok: true, message: `Live weather needs a Weather API key, which is not connected yet — city: ${s(a.city) || "Lahore"}. I cannot check the weather in demo mode.`, data: { city: s(a.city) || "Lahore", live: false } }) },
  { name: "web_search_note", category: "utility",
    description: "Web search is not connected in demo mode",
    schema: z.object({ query: z.string() }),
    execute: async (a) => ({ ok: true, message: `Web search is not connected yet — you asked: "${s(a.query)}". Live search needs a search API key.`, data: { query: a.query, live: false } }) },
  { name: "get_business_info", category: "integrations",
    description: "Show the business profile",
    schema: z.object({}),
    execute: async () => ({ ok: true, message: `${DEMO_BUSINESS.name} — Phone: ${DEMO_BUSINESS.phone}, Email: ${DEMO_BUSINESS.ownerEmail}`, data: DEMO_BUSINESS }) },
  { name: "list_tools", category: "utility",
    description: "List all available tools",
    schema: z.object({}),
    execute: async () => ({ ok: true, message: `Here is what I can do: ${TOOLS.map((t) => t.name).join(", ")}.`, data: TOOLS.map((t) => t.name) }) },
  { name: "create_automation", category: "integrations",
    description: "Record an automation rule (trigger -> tool)",
    schema: z.object({ name: z.string(), trigger: z.string(), toolName: z.string() }),
    execute: async (a) => ({ ok: true, message: `Automation created: "${s(a.name)}" — when ${s(a.trigger)} happens, ${s(a.toolName)} will run. (Saved in demo mode)`, data: a }) },
  { name: "send_sms_note", category: "communication",
    description: "SMS is not connected in demo mode",
    schema: z.object({ to: z.string(), body: z.string() }),
    execute: async (a) => ({ ok: true, message: `Demo Mode: SMS was not sent to ${s(a.to)} — an SMS provider key is needed. Text: ${s(a.body)}`, data: { demo: true } }) },
  { name: "book_calendar_event", category: "integrations",
    description: "Calendar event note — Google Calendar OAuth needed for live sync",
    schema: z.object({ title: z.string(), date: z.string(), time: z.string().optional() }),
    execute: async (a) => ({ ok: true, message: `Calendar event noted: ${s(a.title)} — ${s(a.date)} ${s(a.time) || ""}. Live Google Calendar sync needs OAuth.`, data: { demo: true } }) },
  // --- PC Control tools (via the local PC agent; if the agent is not running, a clear "not connected" answer is returned) ---
  { name: "pc_open_app", category: "integrations",
    description: "Open an app on the user's PC via the local PC agent",
    schema: z.object({ app: z.string() }),
    execute: async (a) => { const r = await sendPcCommand({ action: "open_app", args: { app: s(a.app) } }); return { ok: r.ok, message: r.message, data: r.data }; } },
  { name: "pc_open_website", category: "integrations",
    description: "Open a website on the user's PC",
    schema: z.object({ url: z.string() }),
    execute: async (a) => { const r = await sendPcCommand({ action: "open_website", args: { url: s(a.url) } }); return { ok: r.ok, message: r.message, data: r.data }; } },
  { name: "pc_volume", category: "integrations",
    description: "Volume up/down/mute on the PC",
    schema: z.object({ direction: z.string() }),
    execute: async (a) => { const d = s(a.direction).toLowerCase(); const act = d.includes("mute") ? "mute" : d.includes("down") || d.includes("kam") ? "volume_down" : "volume_up"; const r = await sendPcCommand({ action: act }); return { ok: r.ok, message: r.message }; } },
  { name: "pc_lock_screen", category: "integrations",
    description: "Lock the PC screen",
    schema: z.object({}),
    execute: async () => { const r = await sendPcCommand({ action: "lock" }); return { ok: r.ok, message: r.message }; } },
  { name: "pc_screenshot", category: "integrations",
    description: "Take a screenshot on the PC",
    schema: z.object({}),
    execute: async () => { const r = await sendPcCommand({ action: "screenshot" }); return { ok: r.ok, message: r.message, data: r.data }; } },
  { name: "pc_system_info", category: "integrations",
    description: "System info from the PC agent",
    schema: z.object({}),
    execute: async () => { const r = await sendPcCommand({ action: "system_info" }); return { ok: r.ok, message: r.message, data: r.data }; } },
  { name: "pc_search_files", category: "integrations",
    description: "Search files on the PC (Documents/Desktop)",
    schema: z.object({ query: z.string() }),
    execute: async (a) => { const r = await sendPcCommand({ action: "search_files", args: { query: s(a.query) } }); return { ok: r.ok, message: r.message, data: r.data }; } },
  { name: "pc_command", category: "integrations",
    description: "Send a free-text PC command to the local PC agent",
    schema: z.object({ text: z.string(), confirm: z.boolean().optional() }),
    execute: async (a) => { const r = await sendPcCommand({ text: s(a.text), confirm: Boolean(a.confirm) }); return { ok: r.ok, message: r.message, data: r.data }; } },

];

export function listToolInfo() {
  return TOOLS.map((t) => ({
    name: t.name, category: t.category,
    description: t.description,
    parameters: Object.fromEntries(Object.entries(t.schema.shape).map(([k, v]) => [k, { type: "string", description: k, required: !v.isOptional() }])),
  }));
}

export async function executeTool(name: string, args: Record<string, unknown>) {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) return { ok: false, message: `Tool not found: ${name}` };
  const parsed = tool.schema.safeParse(args);
  if (!parsed.success) return { ok: false, message: `Invalid input: ${parsed.error.issues.map((i) => i.message).join(", ")}` };
  return tool.execute(parsed.data as Record<string, unknown>);
}

// Path to 150+ apps: connector definitions (mock — not live).
// Each connector needs its own API key / OAuth.
export const CONNECTORS = [
  { app: "Google Calendar", category: "productivity", status: "needs-oauth" },
  { app: "Gmail", category: "communication", status: "needs-oauth" },
  { app: "WhatsApp Business", category: "communication", status: "needs-api-key" },
  { app: "Slack", category: "communication", status: "needs-oauth" },
  { app: "Stripe", category: "payments", status: "needs-api-key" },
  { app: "HubSpot", category: "crm", status: "needs-api-key" },
  { app: "Notion", category: "productivity", status: "needs-api-key" },
  { app: "Trello", category: "productivity", status: "needs-api-key" },
  { app: "Zoom", category: "communication", status: "needs-oauth" },
  { app: "Shopify", category: "ecommerce", status: "needs-api-key" },
].map((c) => ({ ...c, live: false }));
