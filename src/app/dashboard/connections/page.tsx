"use client";
import { useEffect, useState } from "react";

// Connections — har app/service ko connect karne ka option yahin hai.
// "Connect" provider ke OFFICIAL page par le jata hai (account/key wahan
// banta hai). Jo keys server par lag jati hain, un ki asal status /api/status
// se LIVE ati hai — jhoot status nahi dikhaya jata.
interface Conn { name: string; what: string; url: string; statusKey?: string; note: string }
const CONNECTIONS: Conn[] = [
  { name: "Google Gemini (AI)", what: "AI jawab + voice transcription — FREE", url: "https://aistudio.google.com/apikey", statusKey: "gemini", note: "Free key — AI Studio se banti hai" },
  { name: "Supabase (Login + Database)", what: "Asal login, users aur data", url: "https://supabase.com/dashboard", statusKey: "supabase", note: "Free plan" },
  { name: "Resend (Email)", what: "Asal email bhejna", url: "https://resend.com/api-keys", statusKey: "resend", note: "Free plan — domain verify par har email par jata hai" },
  { name: "OpenAI (Realtime Voice)", what: "Insan jaisi fori awaaz wali guftagu", url: "https://platform.openai.com/api-keys", statusKey: "openai", note: "Paid — key par paisay lagte hain" },
  { name: "Stripe (Payments)", what: "Card payments lena", url: "https://dashboard.stripe.com/apikeys", statusKey: "stripe", note: "Test keys free, live ke liye account verify" },
  { name: "Google Calendar", what: "Calendar par appointments", url: "https://console.cloud.google.com/apis/credentials", note: "Google Cloud OAuth chahiye" },
  { name: "Gmail", what: "Gmail se email parhna/bhejna", url: "https://console.cloud.google.com/apis/credentials", note: "Google Cloud OAuth chahiye" },
  { name: "WhatsApp Business", what: "WhatsApp messages", url: "https://business.facebook.com/", note: "Meta Business account chahiye" },
  { name: "Slack", what: "Slack messages", url: "https://api.slack.com/apps", note: "Slack app banana hoga" },
  { name: "HubSpot (CRM)", what: "CRM contacts/deals", url: "https://app.hubspot.com/private-apps/", note: "Private app token" },
  { name: "Notion", what: "Notes/pages", url: "https://www.notion.so/my-integrations", note: "Integration token — free" },
  { name: "Trello", what: "Boards/cards", url: "https://trello.com/power-ups/admin", note: "API key — free" },
  { name: "Zoom", what: "Meetings banana", url: "https://marketplace.zoom.us/develop/create", note: "Zoom app OAuth" },
  { name: "Shopify", what: "Store/orders", url: "https://admin.shopify.com/", note: "Store ka access token" },
  { name: "Twilio (SMS)", what: "SMS bhejna", url: "https://console.twilio.com/", note: "Paid — SMS free nahi hota" },
  { name: "OpenWeather (Mausam)", what: "Live weather", url: "https://home.openweathermap.org/api_keys", note: "Free key" },
  { name: "Tavily (Web Search)", what: "Live web search jawab", url: "https://app.tavily.com/home", note: "Free key (limited)" },
];

export default function ConnectionsPage() {
  const [status, setStatus] = useState<Record<string, boolean>>({});
  useEffect(() => { fetch("/api/status").then((r) => r.json()).then((j) => setStatus(j || {})).catch(() => undefined); }, []);
  return (
    <div>
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>Connections</p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Connect Apps & Services</h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>Har card par <b>Connect</b> dabayein — provider ka official page khulega, wahan account/key banayein. Key mil jaye to mujhe (Muse ko) keh dein, main server par laga dunga — ya Vercel → jarvis-ai → Settings → Environment Variables me khud bhi laga sakte hain. Connected wali status asal server se ati hai.</p>
      <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {CONNECTIONS.map((c) => {
          const connected = c.statusKey ? Boolean(status[c.statusKey]) : false;
          return (
            <div key={c.name} className="card-surface p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold">{c.name}</h3>
                {c.statusKey && <span className="badge" style={{ borderColor: "var(--border)", color: connected ? "#2dd4bf" : "#f87171" }}>{connected ? "Connected ✓" : "Not connected"}</span>}
              </div>
              <p className="text-sm mt-2" style={{ color: "var(--text-2)" }}>{c.what}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{c.note}</p>
              <a className={connected ? "btn-secondary mt-3" : "btn-primary mt-3"} style={{ display: "inline-block" }} href={c.url} target="_blank" rel="noreferrer">{connected ? "Manage" : "Connect"}</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
