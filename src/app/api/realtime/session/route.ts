import { NextResponse } from "next/server";
import { JARVIS_SYSTEM_PROMPT_URDU } from "@/constants";

// OpenAI Realtime ephemeral session — browser WebRTC se connect hota hai.
// Bina key ke: 503 + demo:true, client Web Speech API fallback par chala jata hai.
export async function POST() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, demo: true, error: "No OPENAI_API_KEY — Demo Mode uses the Web Speech API. For real voice, add OPENAI_API_KEY to .env.local." }, { status: 503 });
  }
  try {
    const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        instructions: JARVIS_SYSTEM_PROMPT_URDU,
        input_audio_transcription: { model: "whisper-1" },
      }),
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: `OpenAI error ${res.status}` }, { status: 502 });
    const j = await res.json();
    return NextResponse.json({ ok: true, client_secret: j.client_secret?.value, session_id: j.id, demo: false });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach OpenAI" }, { status: 502 });
  }
}
