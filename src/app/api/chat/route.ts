import { NextResponse } from "next/server";
import OpenAI from "openai";
import { chatSchema } from "@/validations";
import { parseCommand } from "@/lib/command-parser";
import { parsePcCommand } from "@/lib/pc-commands";
import { executeTool as executePcTool } from "@/ai/tools";
import { executeTool, listToolInfo } from "@/ai/tools";
import { JARVIS_SYSTEM_PROMPT_URDU, JARVIS_SYSTEM_PROMPT_EN } from "@/constants";
import { getCharacter } from "@/lib/character";

// Language detection for replies: Urdu script or common Roman Urdu words
// -> reply in Urdu; otherwise reply in English. The UI is English, but
// VOICE understands Urdu — replies follow the language the user spoke.
const URDU_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ROMAN_URDU_WORDS = /\b(karo|kar|kya|hai|hain|mujhe|mera|meri|batao|dikhao|bhejo|yaad|waqt|aaj|kal|kahan|kaise|kaisa|karo|bata|tum|aap|apna|apni|mera|yeh|wo|kuch|aur|nahi|theek|acha|bhai|jan|mein|main|hoon|hun|karo|kya|hai)\b/i;

function detectLanguage(message: string): "ur" | "en" {
  return URDU_SCRIPT.test(message) || ROMAN_URDU_WORDS.test(message) ? "ur" : "en";
}

// Demo replies — smart local answers without an OpenAI key (Urdu + Roman Urdu + English)
function demoReply(message: string, language: "ur" | "en"): { reply: string; toolUsed?: string } {
  const lower = message.toLowerCase();
  if (lower.includes("salam") || lower.includes("assalam") || lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("aoa")) {
    const name = (globalThis as unknown as { __jarvisName?: string }).__jarvisName;
    return { reply: language === "ur" ? `وعلیکم السلام${name ? ` ${name}` : ""}! میں جاروس ہوں — آپ کی کیا مدد کر سکتا ہوں؟ اپائنٹمنٹ بک کرنی ہے، ای میل بھیجنی ہے، یا حساب کرنا ہے؟` : "Hello! I am Jarvis — your AI assistant. Ask me to book an appointment, send an email, calculate, or set a reminder." };
  }
  if (lower.includes("tum kaun") || lower.includes("who are you") || lower.includes("tum kon")) {
    return { reply: language === "ur"
      ? "میں جاروس ہوں — آپ کا AI اسسٹنٹ۔ میں اپائنٹمنٹس بک کر سکتا ہوں، ای میل بھیج سکتا ہوں، نوٹس اور یاد دہانیاں بنا سکتا ہوں، اور حساب کر سکتا ہوں۔"
      : "I am Jarvis — your AI assistant. I can book appointments, send emails, take notes and set reminders." };
  }
  if (lower.includes("shukriya") || lower.includes("thank")) return { reply: language === "ur" ? "خوش آمدید! اور کوئی کام ہو تو بتائیں۔" : "You are welcome! Let me know if you need anything else." };
  return { reply: language === "ur"
    ? `میں نے آپ کی بات سمجھ لی: "${message}"۔ ڈیمو موڈ میں میں صرف کمانڈز پر ٹول چلا سکتا ہوں — جیسے "اپائنٹمنٹ بک کرو"، "ای میل بھیجو"، "یاد دلا دو"، "حساب کرو"۔ مکمل AI جواب کے لیے OPENAI_API_KEY چاہیے۔ تمام کمانڈز /dashboard/commands پر دیکھیں۔`
    : `I understood: "${message}". In demo mode I can run commands like "book an appointment" or "calculate 1500 + 2500" — full AI answers need an OpenAI API key. See all commands at /dashboard/commands.` };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request body", detail: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }
    const { message, characterId, businessSlug, language: reqLang } = parsed.data;
    const character = getCharacter(characterId || "jarvis-ur");
    const language = reqLang || detectLanguage(message);
    const systemPrompt = language === "ur" ? JARVIS_SYSTEM_PROMPT_URDU : JARVIS_SYSTEM_PROMPT_EN;
    const businessId = businessSlug || "demo-business";

    // 0) PC command check (local PC agent)
    const pc = parsePcCommand(message);
    if (pc.matched) {
      const pcRes = await executePcTool("pc_command", { text: message });
      return NextResponse.json({ ok: true, reply: pcRes.message, toolUsed: "pc_command", demo: false });
    }

    // 1) Parse local command (appointments / email / note / reminder / calculate / translate / time / date)
    const cmd = parseCommand(message, businessId, language);
    if (cmd) {
      const result = await executeTool(cmd.tool, cmd.args);
      return NextResponse.json({ ok: true, reply: result.message, toolUsed: cmd.tool, demo: false });
    }

    // 2) Real AI reply — Gemini (FREE key, OpenAI-compatible endpoint) preferred,
    //    otherwise OpenAI when its key exists
    const geminiKey = process.env.GEMINI_API_KEY;
    const aiKey = geminiKey || process.env.OPENAI_API_KEY;
    if (aiKey) {
      const openai = geminiKey
        ? new OpenAI({ apiKey: geminiKey, baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" })
        : new OpenAI({ apiKey: aiKey });
      // Gemini's OpenAI-compatible endpoint rejects function parameters that
      // carry extra fields (listToolInfo puts `required` inside each property),
      // so strip each property down to type + description for Gemini.
      const cleanParams = (params: Record<string, unknown>) =>
        Object.fromEntries(
          Object.entries(params).map(([k, v]) => {
            const p = v as { type?: string; description?: string };
            return [k, { type: p.type || "string", description: p.description || k }];
          })
        );
      const tools = listToolInfo().map((t) => ({ type: "function" as const, function: { name: t.name, description: t.description, parameters: { type: "object", properties: geminiKey ? cleanParams(t.parameters as Record<string, unknown>) : t.parameters, required: [] } } }));
      const model = geminiKey ? (process.env.GEMINI_MODEL || "gemini-2.5-flash") : "gpt-4o-mini";
      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: message },
      ];
      let completion;
      try {
        completion = await openai.chat.completions.create({ model, messages, tools, tool_choice: "auto", max_tokens: 500 });
      } catch (err) {
        // If the Gemini call with tools fails, retry once without tools so a
        // plain question still gets a real AI reply instead of an error.
        if (!geminiKey) throw err;
        completion = await openai.chat.completions.create({ model, messages, max_tokens: 500 });
      }
      const choice = completion.choices[0];
      const call = choice?.message?.tool_calls?.[0];
      if (call && call.type === "function") {
        const args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
        const result = await executeTool(call.function.name, args);
        return NextResponse.json({ ok: true, reply: result.message, toolUsed: call.function.name, demo: false });
      }
      return NextResponse.json({ ok: true, reply: choice?.message?.content || "Sorry, I did not get a reply.", demo: false });
    }

    // 3) Demo mode — smart local answer (no key configured)
    const demo = demoReply(message, language);
    return NextResponse.json({ ok: true, reply: demo.reply, toolUsed: demo.toolUsed, demo: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong in chat", detail: String(e) }, { status: 500 });
  }
}
