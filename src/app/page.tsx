"use client";
import Link from "next/link";
import VoiceAssistant from "@/components/VoiceAssistant";
import DailyPicks from "@/components/DailyPicks";
import { JARVIS_COMMANDS } from "@/constants";
import { CHARACTERS } from "@/lib/character";
import { useMemoryStore } from "@/store/memory";
import { useEffect } from "react";

const FEATURES = [
  { icon: "M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z M5 11a7 7 0 0 0 14 0 M12 18v3", title: "Voice Control", desc: "Speak in Urdu, Roman Urdu or English — Jarvis listens and answers in the same language." },
  { icon: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", title: "Appointments", desc: "Book, view, confirm or cancel appointments — by voice or from the dashboard." },
  { icon: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M2 6l10 7 10-7", title: "Email", desc: "Send email hands-free. Real sending with a Resend key, demo mode without one." },
  { icon: "M13 2L4 14h6l-1 8 9-12h-6l1-8z", title: "Automation", desc: "Tools and triggers that turn everyday jobs into one voice command." },
  { icon: "M4 5h16 M4 12h16 M4 19h10", title: "Widget", desc: "Drop the Jarvis chat widget on any website with one embed script." },
  { icon: "M9 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M19 3h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M9 13H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z M19 13h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z", title: "150+ Apps Path", desc: "An extensible tool registry — new connectors can be added one at a time." },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function HomePage() {
  const character = useMemoryStore((s) => s.character);
  const setCharacter = useMemoryStore((s) => s.setCharacter);
  const loadMemory = useMemoryStore((s) => s.load);
  useEffect(() => { loadMemory(); }, [loadMemory]);
  const current = CHARACTERS.find((c) => c.id === character) || CHARACTERS[0];

  return (
    <main className="gradient-mesh" style={{ minHeight: "100vh" }}>
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-5 py-3" style={{ maxWidth: 1120, margin: "0 auto" }}>
        <Link href="/" className="flex items-center gap-2">
          <span className="flex items-center justify-center font-bold" style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #2dd4bf, #22d3ee)", color: "#052e2b", fontSize: 17 }}>J</span>
          <span className="font-bold text-lg" style={{ letterSpacing: "-0.02em" }}>Jarvis</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
          <Link href="/login" className="btn-primary">Log in</Link>
        </nav>
      </header>

      <div className="px-4 pb-10" style={{ maxWidth: 1120, margin: "0 auto" }}>
        {/* Character-first hero */}
        <section className="hero-dark px-5 py-10 sm:px-10 sm:py-12 text-center">
          <p className="eyebrow" style={{ color: "rgba(255,255,255,0.65)" }}>Your AI character</p>
          <div className="mt-6 flex justify-center">
            <div className="character-orb" role="img" aria-label="Jarvis character">J</div>
          </div>
          <h1 className="font-bold mt-6" style={{ fontSize: "clamp(36px, 6vw, 54px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>Jarvis</h1>
          <p className="mt-2 text-base sm:text-lg" style={{ color: "rgba(255,255,255,0.85)", maxWidth: 560, margin: "0 auto" }}>
            Your own Jarvis AI — speak, and it gets done, in Urdu, Roman Urdu or English.
          </p>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            Voice control, appointments, email, reminders and automation.
          </p>

          {/* Personality — changeable right here */}
          <div className="mt-6 flex flex-wrap justify-center gap-2" role="group" aria-label="Choose Jarvis personality">
            {CHARACTERS.map((c) => (
              <button key={c.id} onClick={() => setCharacter(c.id)} className="chip" style={character === c.id ? { background: "#fff", color: "#0f2547", borderColor: "#fff" } : { background: "rgba(255,255,255,0.10)", color: "#fff", borderColor: "rgba(255,255,255,0.25)" }}>
                {c.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{current.tagline}</p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard/voice" className="btn-primary" style={{ padding: "12px 22px", fontSize: 15 }}>Start talking</Link>
            <Link href="/signup" className="btn-secondary" style={{ padding: "12px 22px", fontSize: 15, background: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.25)", color: "#fff" }}>Create free account</Link>
          </div>
          <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>No key needed to try — demo mode works out of the box.</p>
        </section>

        {/* Voice — push-to-talk front and centre */}
        <section className="mt-6">
          <VoiceAssistant />
        </section>

        {/* System Core — 4 parts, reachable from home and dashboard */}
        <section className="mt-10">
          <p className="eyebrow" style={{ color: "var(--text-3)" }}>System Core</p>
          <h2 className="text-2xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Four parts, one Jarvis</h2>
          <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {[
              { href: "/dashboard/memory", title: "Memory", desc: "Your name, interests and things Jarvis remembers — view, change or erase anytime." },
              { href: "/dashboard/tools", title: "Skills", desc: "29 tools ready — appointments, email, PC control and more." },
              { href: "/dashboard/settings", title: "Character", desc: "Assistant, Mentor or Best Friend — pick the Jarvis that fits you." },
              { href: "/dashboard/settings", title: "Settings", desc: "Business profile and API key status, all in one place." },
            ].map((c) => (
              <Link key={c.title} href={c.href} className="card-surface card-hover p-5 block">
                <h3 className="font-bold text-base">{c.title}</h3>
                <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>{c.desc}</p>
                <span className="text-sm font-semibold mt-3 inline-block" style={{ color: "var(--teal-700)" }}>Open →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mt-10">
          <p className="eyebrow" style={{ color: "var(--text-3)" }}>What Jarvis can do</p>
          <h2 className="text-2xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Everything in one place</h2>
          <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card-surface p-5">
                <div className="icon-tile"><Icon d={f.icon} /></div>
                <h3 className="font-bold mt-3">{f.title}</h3>
                <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Try saying — Urdu phrase + English translation */}
        <section className="mt-10">
          <p className="eyebrow" style={{ color: "var(--text-3)" }}>Try saying</p>
          <h2 className="text-2xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Say it in Urdu — or English</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>Jarvis understands Urdu script, Roman Urdu and English. Tap a command to see them all — with the Urdu phrase and its English meaning.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {JARVIS_COMMANDS.slice(0, 8).map((c) => (
              <Link key={c.id} href="/dashboard/commands" className="chip" title={c.english}>
                <span>{c.romanUrdu}</span>
                <span style={{ color: "var(--text-3)" }}>· {c.english}</span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm"><Link href="/dashboard/commands" style={{ color: "var(--teal-700)", fontWeight: 600 }}>See all commands →</Link></p>
        </section>

        <DailyPicks />

        <footer className="mt-10 pt-5 text-center text-sm" style={{ color: "var(--text-3)", borderTop: "1px solid var(--border)" }}>
          Jarvis AI — demo mode needs no real keys. Real voice needs an OpenAI key.
        </footer>
      </div>
    </main>
  );
}
