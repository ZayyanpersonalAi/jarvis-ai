import { NextResponse } from "next/server";

// Sirf ye batata hai ke konsi keys server par lagi hain (true/false) —
// key ki VALUE kabhi browser ko nahi bheji jati.
export async function GET() {
  return NextResponse.json({
    ok: true,
    gemini: Boolean(process.env.GEMINI_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
    supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    resend: Boolean(process.env.RESEND_API_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
  });
}
