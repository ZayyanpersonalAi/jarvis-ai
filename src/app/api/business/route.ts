import { NextResponse } from "next/server";
import { DEMO_BUSINESS } from "@/constants";

export async function GET() {
  return NextResponse.json({ ok: true, demo: true, data: DEMO_BUSINESS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ ok: true, demo: true, data: { ...DEMO_BUSINESS, ...body } });
  } catch { return NextResponse.json({ ok: false, error: "Could not save" }, { status: 400 }); }
}
