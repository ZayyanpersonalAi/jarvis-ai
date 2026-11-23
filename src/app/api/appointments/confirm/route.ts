import { NextResponse } from "next/server";
import { demoAppointments } from "@/lib/memory";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const apt = demoAppointments.find((a) => a.id === String(id));
    if (!apt) return NextResponse.json({ ok: false, error: "Appointment not found" }, { status: 404 });
    apt.status = "confirmed";
    return NextResponse.json({ ok: true, data: apt });
  } catch { return NextResponse.json({ ok: false, error: "Could not confirm" }, { status: 400 }); }
}
