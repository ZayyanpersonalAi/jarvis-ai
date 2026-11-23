// Urdu / Roman Urdu / English command parser — voice ya text command ko tool se milata hai.
import { JARVIS_COMMANDS } from "@/constants";

export interface ParsedCommand { tool: string; args: Record<string, string>; commandId: string; confidence: "high" | "low"; }

const ROMAN_KEYWORDS: Record<string, string> = {
  "appointment book": "book_appointment", "appointment cancel": "cancel_appointment",
  "appointments dikhao": "list_appointments", "appointment dikhao": "list_appointments",
  "email bhejo": "send_email", "yaad dila": "create_reminder", "note likh": "create_note",
  "notes dikhao": "list_notes", "hisaab": "calculate", "waqt": "get_time", "tareekh": "get_date",
  "tarjuma": "translate_to_english", "mausam": "get_weather", "talaash": "web_search_note",
  "business dikhao": "get_business_info", "kya kar sakte": "list_tools", "madad": "list_tools",
};

export function parseCommand(input: string): ParsedCommand | null {
  const text = input.trim();
  const lower = text.toLowerCase();
  // 1) Urdu script — JARVIS_COMMANDS se match
  for (const cmd of JARVIS_COMMANDS) {
    const firstWord = cmd.urdu.split(" ")[0];
    if (text.includes(cmd.urdu) || text.includes(firstWord) && cmd.urdu.length > 3 && text.includes(cmd.urdu.slice(0, 6))) {
      return { tool: cmd.tool, args: { raw: text }, commandId: cmd.id, confidence: "high" };
    }
  }
  // 2) Roman Urdu / English keywords
  for (const [kw, tool] of Object.entries(ROMAN_KEYWORDS)) {
    if (lower.includes(kw)) {
      const cmd = JARVIS_COMMANDS.find((c) => c.tool === tool);
      return { tool, args: { raw: text }, commandId: cmd?.id || tool, confidence: "high" };
    }
  }
  if (lower.includes("book") && lower.includes("appointment")) return { tool: "book_appointment", args: { raw: text }, commandId: "book-appointment", confidence: "high" };
  if (lower.includes("cancel") && lower.includes("appointment")) return { tool: "cancel_appointment", args: { raw: text }, commandId: "cancel-appointment", confidence: "high" };
  if (lower.includes("appointment")) return { tool: "list_appointments", args: { raw: text }, commandId: "list-appointments", confidence: "high" };
  if (lower.includes("email")) return { tool: "send_email", args: { raw: text }, commandId: "send-email", confidence: "high" };
  if (lower.includes("remind") || lower.includes("yaad")) return { tool: "create_reminder", args: { raw: text }, commandId: "set-reminder", confidence: "high" };
  if (lower.includes("note")) return { tool: "create_note", args: { raw: text }, commandId: "add-note", confidence: "high" };
  if (lower.includes("time") || lower.includes("waqt")) return { tool: "get_time", args: { raw: text }, commandId: "time", confidence: "high" };
  if (lower.includes("date") || lower.includes("tareekh")) return { tool: "get_date", args: { raw: text }, commandId: "date", confidence: "high" };
  if (lower.includes("weather") || lower.includes("mausam")) return { tool: "get_weather", args: { raw: text }, commandId: "weather", confidence: "high" };
  if (lower.includes("calculat") || lower.includes("hisaab") || /[0-9]+\s*[+\-*/x]\s*[0-9]+/.test(lower)) return { tool: "calculate", args: { raw: text, expression: text }, commandId: "calculate", confidence: "high" };
  if (lower.includes("translate") || lower.includes("tarjuma")) return { tool: "translate_to_english", args: { raw: text, text }, commandId: "translate-ur-en", confidence: "high" };
  if (lower.includes("what can you do") || lower.includes("help") || lower.includes("madad")) return { tool: "list_tools", args: { raw: text }, commandId: "help", confidence: "high" };
  return null;
}
