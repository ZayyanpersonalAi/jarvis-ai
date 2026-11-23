import { NextResponse } from "next/server";

// Daily Picks — "Your World": once a day, 3 short picks.
// Demo mode: demo picks based on interests (never claimed to be personalised
// live news). With a live search key, plug real search in here.
export async function GET(req: Request) {
  const interests = new URL(req.url).searchParams.get("interests") || "";
  const list = interests.split(",").map((s) => s.trim()).filter(Boolean);
  const topic = list[0] || "AI";
  const today = new Date().toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", weekday: "long", day: "numeric", month: "long" });
  return NextResponse.json({
    ok: true,
    demo: true,
    date: today,
    picks: [
      { title: `${topic} — today's highlight`, summary: `A short look at your interest (${topic}) for today. Live news needs a search API key — this is a demo pick.`, tag: topic },
      { title: "Boost your productivity", summary: "Pick one task today, finish it in 25 minutes, then rest for 5 — small steps, big difference.", tag: "Productivity" },
      { title: "Learn something new", summary: "Ask Jarvis: 'Tell me something new about AI' — make learning one new thing a daily habit.", tag: "Learning" },
    ],
  });
}
