import { NextResponse } from "next/server";
import { demoAppointments } from "@/lib/memory";
import { appointmentSchema } from "@/validations";

export async function GET() {
  return NextResponse.json({ ok: true, demo: true, data: demoAppointments });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    const apt = { id: `apt-${Date.now()}`, businessId: "demo-business", ...parsed.data, customerPhone: parsed.data.customerPhone || undefined, customerEmail: parsed.data.customerEmail || undefined, status: "pending" as const, createdAt: new Date().toISOString() };
    demoAppointments.unshift(apt);
    return NextResponse.json({ ok: true, data: apt, demo: true });
  } catch { return NextResponse.json({ ok: false, error: "Appointment could not be booked" }, { status: 500 }); }
}
