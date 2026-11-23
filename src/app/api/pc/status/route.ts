import { NextResponse } from "next/server";
import { pcStatus, isPcAgentConfigured } from "@/lib/pc-agent";

export async function GET() {
  const s = await pcStatus();
  return NextResponse.json({ ok: s.connected, connected: s.connected, configured: isPcAgentConfigured(), info: s.info, error: s.error, demo: !s.connected });
}
