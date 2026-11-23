import { NextResponse } from "next/server";
import { getWidgetConfig } from "@/services/widgets";
import { demoMessages } from "@/lib/memory";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") || "demo";
  return NextResponse.json({ ok: true, data: getWidgetConfig(slug) });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const msg = { id: `wm-${Date.now()}`, role: "visitor", text: String(body?.message || ""), createdAt: new Date().toISOString() };
    demoMessages.push(msg);
    return NextResponse.json({ ok: true, reply: "Hi! I'm Jarvis — how can I help you today?", data: msg });
  } catch { return NextResponse.json({ ok: false, error: "Message could not be sent" }, { status: 400 }); }
}
