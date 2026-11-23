// PC Control commands — Urdu / Roman Urdu / English
export interface PcCommandDef { id: string; urdu: string; romanUrdu: string; english: string; action: string; args?: Record<string, string>; }

export const PC_COMMANDS: PcCommandDef[] = [
  { id: "pc-chrome", urdu: "کروم کھولو", romanUrdu: "chrome kholo", english: "Open Chrome", action: "open_app", args: { app: "chrome" } },
  { id: "pc-vscode", urdu: "وی ایس کوڈ کھولو", romanUrdu: "vs code kholo", english: "Open VS Code", action: "open_app", args: { app: "vscode" } },
  { id: "pc-notepad", urdu: "نوٹ پیڈ کھولو", romanUrdu: "notepad kholo", english: "Open Notepad", action: "open_app", args: { app: "notepad" } },
  { id: "pc-calculator", urdu: "کیلکولیٹر کھولو", romanUrdu: "calculator kholo", english: "Open Calculator", action: "open_app", args: { app: "calculator" } },
  { id: "pc-word", urdu: "ورڈ کھولو", romanUrdu: "word kholo", english: "Open Word", action: "open_app", args: { app: "word" } },
  { id: "pc-excel", urdu: "ایکسل کھولو", romanUrdu: "excel kholo", english: "Open Excel", action: "open_app", args: { app: "excel" } },
  { id: "pc-explorer", urdu: "فائل ایکسپلورر کھولو", romanUrdu: "file explorer kholo", english: "Open File Explorer", action: "open_app", args: { app: "explorer" } },
  { id: "pc-website", urdu: "ویب سائٹ کھولو", romanUrdu: "website kholo", english: "Open a website", action: "open_website" },
  { id: "pc-volume-up", urdu: "آواز بڑھاؤ", romanUrdu: "awaz barhao", english: "Volume up", action: "volume_up" },
  { id: "pc-volume-down", urdu: "آواز کم کرو", romanUrdu: "awaz kam karo", english: "Volume down", action: "volume_down" },
  { id: "pc-mute", urdu: "خاموش کرو", romanUrdu: "khamosh karo", english: "Mute", action: "mute" },
  { id: "pc-lock", urdu: "اسکرین لاک کرو", romanUrdu: "screen lock karo", english: "Lock screen", action: "lock" },
  { id: "pc-screenshot", urdu: "اسکرین شاٹ لو", romanUrdu: "screenshot lo", english: "Take a screenshot", action: "screenshot" },
  { id: "pc-system", urdu: "سسٹم بتاؤ", romanUrdu: "system batao", english: "System info", action: "system_info" },
  { id: "pc-search", urdu: "فائل تلاش کرو", romanUrdu: "file talaash karo", english: "Search files", action: "search_files" },
  { id: "pc-clipboard", urdu: "کلپ بورڈ دکھاؤ", romanUrdu: "clipboard dikhao", english: "Show clipboard", action: "clipboard" },
  { id: "pc-shutdown", urdu: "کمپیوٹر بند کر دو", romanUrdu: "computer band kar do", english: "Shutdown PC (needs confirmation)", action: "shutdown" },
  { id: "pc-restart", urdu: "ری سٹارٹ کرو", romanUrdu: "restart karo", english: "Restart PC (needs confirmation)", action: "restart" },
];

export function parsePcCommand(input: string): PcCommandDef | null {
  const lower = input.toLowerCase();
  for (const c of PC_COMMANDS) {
    if (input.includes(c.urdu) || lower.includes(c.romanUrdu) || lower.includes(c.english.toLowerCase())) return c;
  }
  if (lower.includes("kholo") || lower.includes("open") || lower.includes("lock") || lower.includes("screenshot") || lower.includes("volume") || lower.includes("awaz") || lower.includes("mute") || lower.includes("shutdown") || lower.includes("restart") || lower.includes("band kar")) {
    // Generic PC intent — agent khud parse karega
    return { id: "pc-generic", urdu: input, romanUrdu: input, english: input, action: "text" };
  }
  return null;
}
