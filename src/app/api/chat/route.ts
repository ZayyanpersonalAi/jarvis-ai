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
const ROMAN_URDU_WORDS = /\b(karo|kar|kya|hai|hain|mujhe|mera|meri|batao|dikhao|bhejo|yaad|waqt|aaj|kal|tareekh|mausam|hisaab|tarjuma|kholo|band|awaz|shukriya|salam|madad|chahiye|kaise|kaisa|kahan|kab|kyun|nahi|acha|theek|tum|kon|kaun)\b/i;

function detectLanguage(message: string): "ur" | "en" {
  return URDU_SCRIPT.test(message) || ROMAN_URDU_WORDS.test(message) ? "ur" : "en";
}

// Demo replies — smart local answers without an OpenAI key (Urdu + Roman Urdu + English)
function demoReply(message: string, language: "ur" | "en"): { reply: string; toolUsed?: string } {
  const lower = message.toLowerCase();
  if (lower.includes("salam") || lower.includes("assalam") || lower.includes("hello") || lower.includes("hi")) {
    const name = (globalThis as unknown as { __jarvisName?: string }).__jarvisName;
    return { reply: language === "ur" ? `وعلیکم السلام${name ? ` ${name}` : ""}! میں جاروس ہوں — آپ کی کیا مدد کر سکتا ہوں؟ اپائنٹمنٹ بک کرنی ہے، ای میل بھیجنی ہے، یا حساب کرنا ہے؟` : `Hello${name ? ` ${name}` : ""}! I am Jarvis — how can I help you today? Book an appointment, send an email, or calculate something?` };
  }
  if (lower.includes("tum kaun") || lower.includes("who are you") || lower.includes("tum kon")) {
    return { reply: language === "ur"
      ? "میں جاروس ہوں — آپ کا AI اسسٹنٹ۔ میں اپائنٹمنٹس بک کر سکتا ہوں، ای میل بھیج سکتا ہوں، نوٹس اور یاد دہانیاں بنا سکتا ہوں، اور حساب کر سکتا ہوں۔"
      : "I am Jarvis — your AI assistant. I can book appointments, send emails, take notes and set reminders, and calculate." };
  }
  if (lower.includes("shukriya") || lower.includes("thank")) return { reply: language === "ur" ? "خوش آمدید! اور کوئی کام ہو تو بتائیں۔" : "You're welcome! Let me know if you need anything else." };
  return { reply: language === "ur"
    ? `میں نے آپ کی بات سمجھ لی: "${message}"۔ ڈیمو موڈ میں میں صرف کمانڈز پر ٹول چلا سکتا ہوں — جیسے "اپائنٹمنٹ بک کرو"، "ای میل بھیجو"، "یاد دلا دو"، "حساب کرو"۔ مکمل AI جواب کے لیے OPENAI_API_KEY چاہیے۔ تمام کمانڈز /dashboard/commands پر دیکھیں۔`
    : `I understood: "${message}". In demo mode I can run commands like "book an appointment" or "calculate". For full AI replies, add OPENAI_API_KEY. See all commands at /dashboard/commands.` };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Message cannot be empty" }, { status: 400 });
    const { message } = parsed.data;
    // Reply language follows what the user actually said, not the UI language.
    const language = detectLanguage(message);
    const mem = (body as { memory?: { userName?: string; interests?: string[]; facts?: { text: string }[]; chatSummary?: string; character?: string } }).memory || {};
    const character = getCharacter(mem.character || "assistant");
    const memoryText = [
      mem.userName ? `User's name: ${mem.userName}` : "",
      mem.interests?.length ? `Interests: ${mem.interests.join(", ")}` : "",
      mem.facts?.length ? `Remembered notes: ${mem.facts.map((f) => f.text).join(" | ")}` : "",
      mem.chatSummary ? `Summary: ${mem.chatSummary}` : "",
    ].filter(Boolean).join("\n");
    const systemPrompt = (language === "ur" ? JARVIS_SYSTEM_PROMPT_URDU : JARVIS_SYSTEM_PROMPT_EN) + "\n" + character.promptSuffixUrdu + (memoryText ? "\n" + memoryText : "");

    // 0) PC command check — first see if this is a PC control command
    const pcCmd = parsePcCommand(message);
    if (pcCmd && pcCmd.action !== "text") {
      const r = await executePcTool("pc_command", { text: message });
      return NextResponse.json({ ok: r.ok, reply: r.message, toolUsed: "pc_command", commandId: pcCmd.id, demo: !process.env.JARVIS_PC_TOKEN });
    }
    if (pcCmd && pcCmd.action === "text") {
      const r = await executePcTool("pc_command", { text: message });
      if (r.ok || String(r.message).includes("not connected")) {
        return NextResponse.json({ ok: r.ok, reply: r.message, toolUsed: "pc_command", commandId: "pc-generic", demo: !process.env.JARVIS_PC_TOKEN });
      }
    }

    // 1) Command check first — Urdu/Roman/English command runs its tool
    const cmd = parseCommand(message);
    if (cmd) {
      const result = await executeTool(cmd.tool, cmd.args);
      // book_appointment needs structured args — if the name cannot be pulled
      // from raw text, the demo message comes back instead
      return NextResponse.json({ ok: result.ok, reply: result.message, toolUsed: cmd.tool, commandId: cmd.commandId, demo: !(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY) });
    }

    // 2) Real AI reply — Gemini (FREE key, OpenAI-compatible endpoint) preferred,
    //    otherwise OpenAI when its key exists
    const geminiKey = process.env.GEMINI_API_KEY;
    const aiKey = geminiKey || process.env.OPENAI_API_KEY;
    if (aiKey) {
      const openai = geminiKey
        ? new OpenAI({ apiKey: geminiKey, baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" })
        : new OpenAI({ apiKey: aiKey });
      const tools = listToolInfo().map((t) => ({ type: "function" as const, function: { name: t.name, description: t.description, parameters: { type: "object", properties: t.parameters, required: [] } } }));
      const completion = await openai.chat.completions.create({
        model: geminiKey ? (process.env.GEMINI_MODEL || "gemini-2.5-flash") : "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        tools, tool_choice: "auto", max_tokens: 500,
      });
      const choice = completion.choices[0];
      const call = choice?.message?.tool_calls?.[0];
      if (call && call.type === "function") {
        const args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
        const result = await executeTool(call.function.name, args);
        return NextResponse.json({ ok: true, reply: result.message, toolUsed: call.function.name, demo: false });
      }
      return NextResponse.json({ ok: true, reply: choice?.message?.content || "Sorry, I did not get a reply.", demo: false });
    }

    // 3) Demo mode
    (globalThis as unknown as { __jarvisName?: string }).__jarvisName = mem.userName || undefined;
    const d = demoReply(message, language);
    return NextResponse.json({ ok: true, reply: d.reply, toolUsed: d.toolUsed, demo: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Something went wrong in chat", detail: String(e) }, { status: 500 });
  }
}
