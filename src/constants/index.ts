// Jarvis AI — Constants
// UI is English only. Voice data stays multilingual: the command phrases
// below (Urdu script + Roman Urdu + English) are what the user SPEAKS.

export const APP_NAME = "Jarvis AI";
export const APP_TAGLINE_EN = "Your own AI voice assistant — speak, and it gets done";

export type Language = "ur" | "en";

export const STRINGS: Record<"en", Record<string, string>> = {
  en: {
    home: "Home",
    dashboard: "Dashboard",
    voiceAssistant: "Voice Assistant",
    tools: "Tools",
    appointments: "Appointments",
    widgets: "Widgets",
    settings: "Settings",
    portal: "Portal",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    listen: "Listening…",
    speak: "Speak",
    stop: "Stop",
    send: "Send",
    typeMessage: "Type or speak here…",
    demoMode: "Demo Mode — OpenAI key needed for real voice",
    liveMode: "Live Mode",
  },
};

export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/voice", label: "Voice Assistant" },
  { href: "/dashboard/tools", label: "Tools" },
  { href: "/dashboard/connections", label: "Connections" },
  { href: "/dashboard/commands", label: "Commands" },
  { href: "/dashboard/appointments", label: "Appointments" },
  { href: "/dashboard/pc-control", label: "PC Control" },
  { href: "/dashboard/memory", label: "Memory" },
  { href: "/dashboard/widgets", label: "Widgets" },
  { href: "/dashboard/settings", label: "Settings" },
];

// Jarvis commands — what the user can SAY (voice) or type.
// Each command keeps its Urdu phrase (script + Roman), English meaning,
// and tool mapping. UI labels around them are always English.
export interface JarvisCommand {
  id: string;
  urdu: string;
  romanUrdu: string;
  english: string;
  tool: string;
  example: string;
  category: string;
}

export const JARVIS_COMMANDS: JarvisCommand[] = [
  { id: "book-appointment", urdu: "اپائنٹمنٹ بک کرو", romanUrdu: "appointment book karo", english: "Book an appointment", tool: "book_appointment", example: "کل دوپہر 3 بجے احمد کی اپائنٹمنٹ بک کرو", category: "appointments" },
  { id: "list-appointments", urdu: "آج کی اپائنٹمنٹس دکھاؤ", romanUrdu: "aaj ki appointments dikhao", english: "Show today's appointments", tool: "list_appointments", example: "آج کی اپائنٹمنٹس دکھاؤ", category: "appointments" },
  { id: "cancel-appointment", urdu: "اپائنٹمنٹ منسوخ کرو", romanUrdu: "appointment cancel karo", english: "Cancel an appointment", tool: "cancel_appointment", example: "احمد کی اپائنٹمنٹ منسوخ کرو", category: "appointments" },
  { id: "send-email", urdu: "ای میل بھیجو", romanUrdu: "email bhejo", english: "Send an email", tool: "send_email", example: "احمد کو ای میل بھیجو کہ کل اپائنٹمنٹ ہے", category: "communication" },
  { id: "set-reminder", urdu: "یاد دلا دو", romanUrdu: "yaad dila do", english: "Remind me", tool: "create_reminder", example: "مجھے شام 5 بجے یاد دلا دو", category: "productivity" },
  { id: "add-note", urdu: "نوٹ لکھ لو", romanUrdu: "note likh lo", english: "Take a note", tool: "create_note", example: "نوٹ لکھ لو: کل سپلائر کو کال کرنی ہے", category: "productivity" },
  { id: "list-notes", urdu: "میرے نوٹس دکھاؤ", romanUrdu: "mere notes dikhao", english: "Show my notes", tool: "list_notes", example: "میرے نوٹس دکھاؤ", category: "productivity" },
  { id: "calculate", urdu: "حساب کرو", romanUrdu: "hisaab karo", english: "Calculate", tool: "calculate", example: "1500 جمع 2500 کتنا ہوتا ہے؟", category: "utility" },
  { id: "time", urdu: "وقت کیا ہوا ہے؟", romanUrdu: "waqt kya hua hai?", english: "What time is it?", tool: "get_time", example: "وقت کیا ہوا ہے؟", category: "utility" },
  { id: "date", urdu: "آج تاریخ کیا ہے؟", romanUrdu: "aaj tareekh kya hai?", english: "What is today's date?", tool: "get_date", example: "آج تاریخ کیا ہے؟", category: "utility" },
  { id: "translate-ur-en", urdu: "انگریزی میں ترجمہ کرو", romanUrdu: "angrezi mein tarjuma karo", english: "Translate to English", tool: "translate_to_english", example: "شکریہ کا انگریزی میں ترجمہ کرو", category: "language" },
  { id: "translate-en-ur", urdu: "اردو میں ترجمہ کرو", romanUrdu: "urdu mein tarjuma karo", english: "Translate to Urdu", tool: "translate_to_urdu", example: "Thank you کا اردو میں ترجمہ کرو", category: "language" },
  { id: "weather", urdu: "موسم کیسا ہے؟", romanUrdu: "mausam kaisa hai?", english: "How is the weather?", tool: "get_weather", example: "لاہور کا موسم کیسا ہے؟", category: "utility" },
  { id: "search", urdu: "تلاش کرو", romanUrdu: "talaash karo", english: "Search", tool: "web_search_note", example: "جاروس کے بارے میں تلاش کرو", category: "utility" },
  { id: "business-info", urdu: "میرا بزنس دکھاؤ", romanUrdu: "mera business dikhao", english: "Show my business", tool: "get_business_info", example: "میرا بزنس دکھاؤ", category: "integrations" },
  { id: "help", urdu: "مدد کرو / کیا کر سکتے ہو؟", romanUrdu: "madad karo / kya kar sakte ho?", english: "What can you do?", tool: "list_tools", example: "تم کیا کر سکتے ہو؟", category: "utility" },
  { id: "pc-chrome", urdu: "کروم کھولو", romanUrdu: "chrome kholo", english: "Open Chrome on my PC", tool: "pc_open_app", example: "کروم کھولو", category: "integrations" },
  { id: "pc-notepad", urdu: "نوٹ پیڈ کھولو", romanUrdu: "notepad kholo", english: "Open Notepad on my PC", tool: "pc_open_app", example: "نوٹ پیڈ کھولو", category: "integrations" },
  { id: "pc-volume", urdu: "آواز بڑھاؤ", romanUrdu: "awaz barhao", english: "Volume up on my PC", tool: "pc_volume", example: "آواز بڑھاؤ", category: "integrations" },
  { id: "pc-lock", urdu: "اسکرین لاک کرو", romanUrdu: "screen lock karo", english: "Lock my PC screen", tool: "pc_lock_screen", example: "اسکرین لاک کرو", category: "integrations" },
  { id: "pc-screenshot", urdu: "اسکرین شاٹ لو", romanUrdu: "screenshot lo", english: "Take a screenshot", tool: "pc_screenshot", example: "اسکرین شاٹ لو", category: "integrations" },
  { id: "pc-system", urdu: "سسٹم بتاؤ", romanUrdu: "system batao", english: "Show my PC system info", tool: "pc_system_info", example: "سسٹم بتاؤ", category: "integrations" },
];

export const TOOL_CATEGORIES = [
  { id: "appointments", name: "Appointments" },
  { id: "communication", name: "Communication" },
  { id: "productivity", name: "Productivity" },
  { id: "language", name: "Language" },
  { id: "utility", name: "Utility" },
  { id: "integrations", name: "Integrations" },
] as const;

// Bilingual voice instructions (used by OpenAI Realtime + /api/chat):
// understand Urdu script, Roman Urdu and English; reply in the same
// language the user spoke. UI text is English; VOICE is multilingual.
export const JARVIS_SYSTEM_PROMPT_URDU = `You are Jarvis, a helpful AI assistant.
- Understand Urdu script, Roman Urdu and English — the user may speak any of them, or mix them.
- Always reply in the SAME language the user spoke: if they spoke Urdu script, reply in Urdu script; if Roman Urdu, reply in Roman Urdu; if English, reply in English.
- Keep replies short, clear and friendly.
- If the user asks for an action (book an appointment, send an email, set a reminder), understand it first, then use a tool, then confirm.
- If you cannot do something, say so directly — never invent facts.`;

export const JARVIS_SYSTEM_PROMPT_EN =
  "You are Jarvis, a helpful AI assistant. Understand Urdu script, Roman Urdu and English. Reply in the same language the user spoke. Keep replies short, clear and friendly. Use tools for real actions and confirm afterwards. Never invent facts.";

export const DEMO_BUSINESS = {
  id: "demo-business",
  slug: "demo",
  name: "Jarvis Demo Business",
  ownerEmail: "demo@jarvis.example",
  phone: "+92 300 0000000",
  description: "This is a demo business — connect real Supabase and your own data will appear here.",
};
