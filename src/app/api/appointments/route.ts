import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { demoAppointments } from "@/lib/memory";
import { appointmentSchema } from "@/validations";

// LIVE: Supabase configured ho to appointments asal database me save/load
// hote hain (seed 'demo' business ke under). Warna purana in-memory demo.
function liveClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return null;
  return createClient(url, service, { auth: { persistSession: false } });
}

async function demoBusinessId(sb: NonNullable<ReturnType<typeof liveClient>>{
  const { data } = await sb.from("businesses").select("id").eq("slug", "demo").single();
  return (data as { id?: string } | null)?.id || null;
}

function toApi(r: Record<string, unknown>) {
  return {
    id: r.id, businessId: r.business_id,
    customerName: r.customer_name, customerPhone: r.customer_phone || undefined,
    customerEmail: r.customer_email || undefined, service: r.service,
    date: r.date, time: r.time, notes: r.notes || undefined,
    status: r.status, createdAt: r.created_at,
  };
}

export async function GET() {
  const sb = liveClient();
  if (!sb) return NextResponse.json({ ok: true, demo: true, data: demoAppointments });
  try {
    const bid = await demoBusinessId(sb);
    if (!bid) return NextResponse.json({ ok: true, demo: false, data: [] });
    const { data, error } = await sb.from("appointments").select("*").eq("business_id", bid).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ ok: true, demo: false, data: (data || []).map((r) => toApi(r as Record<string, unknown>)) });
  } catch {
    return NextResponse.json({ ok: true, demo: true, data: demoAppointments });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    const sb = liveClient();
    if (sb) {
      const bid = await demoBusinessId(sb);
      if (bid) {
        const { data, error } = await sb.from("appointments").insert({
          business_id: bid,
          customer_name: parsed.data.customerName,
          customer_phone: parsed.data.customerPhone || null,
          customer_email: parsed.data.customerEmail || null,
          service: parsed.data.service, date: parsed.data.date, time: parsed.data.time,
          notes: parsed.data.notes || null, status: "pending",
        }).select("*").single();
        if (!error && data) return NextResponse.json({ ok: true, demo: false, data: toApi(data as Record<string, unknown>) });
      }
    }
    const apt = { id: `apt-${Date.now()}`, businessId: "demo-business", ...parsed.data, customerPhone: parsed.data.customerPhone || undefined, customerEmail: parsed.data.customerEmail || undefined, status: "pending" as const, createdAt: new Date().toISOString() };
    demoAppointments.unshift(apt);
    return NextResponse.json({ ok: true, data: apt, demo: true });
  } catch { return NextResponse.json({ ok: false, error: "Appointment could not be booked" }, { status: 500 }); }
}
