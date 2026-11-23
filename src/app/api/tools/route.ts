import { NextResponse } from "next/server";
import { executeTool, listToolInfo } from "@/ai/tools";
import { toolExecuteSchema } from "@/validations";

export async function GET() {
  return NextResponse.json({ ok: true, demo: true, data: listToolInfo() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = toolExecuteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request — name and args are required" }, { status: 400 });
    const result = await executeTool(parsed.data.name, parsed.data.args as Record<string, unknown>);
    return NextResponse.json({ ok: result.ok, message: result.message, data: result.data, demo: true });
  } catch { return NextResponse.json({ ok: false, error: "Tool could not run" }, { status: 500 }); }
}
