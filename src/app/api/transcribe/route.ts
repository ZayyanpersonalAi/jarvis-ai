import { NextResponse } from "next/server";

// LIVE voice transcription by Gemini (FREE key) — mic recording (WebM/MP4)
// Gemini ko bheja jata hai, wo asal transcript deta hai. Ye Chrome me bhi
// chalta hai aur Electron desktop app me bhi (jahan Web Speech API nahi hoti).
export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: "No GEMINI_API_KEY on server" }, { status: 503 });
  try {
    const body = await req.json();
    const audio = String(body?.audio || "");
    const mimeType = String(body?.mimeType || "audio/webm").split(";")[0];
    if (!audio) return NextResponse.json({ ok: false, error: "No audio received" }, { status: 400 });
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Transcribe this audio exactly as spoken. If Urdu is spoken, write Urdu script. If Roman Urdu or English is spoken, write it as spoken. Return ONLY the transcript text, nothing else." },
            { inline_data: { mime_type: mimeType, data: audio } },
          ],
        }],
      }),
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: `Gemini error ${res.status}` }, { status: 502 });
    const j = await res.json();
    const text = (j?.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || "").join(" ").trim();
    if (!text) return NextResponse.json({ ok: false, error: "Could not understand the audio" }, { status: 422 });
    return NextResponse.json({ ok: true, text });
  } catch {
    return NextResponse.json({ ok: false, error: "Transcription failed" }, { status: 500 });
  }
}
