import { NextResponse } from "next/server";
import { sendPcCommand } from "@/lib/pc-agent";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await sendPcCommand({
      text: typeof body?.text === "string" ? body.text : undefined,
      action: typeof body?.action === "string" ? body.action : undefined,
      args: (body?.args as Record<string, unknown>) || {},
      confirm: Boolean(body?.confirm),
    });
    return NextResponse.json({ ok: result.ok, message: result.message, needsConfirmation: result.needsConfirmation, blocked: result.blocked, data: result.data, demo: !process.env.JARVIS_PC_TOKEN });
  } catch { return NextResponse.json({ ok: false, error: "PC command could not be sent" }, { status: 500 }); }
}
