# جاروس اے آئی — Jarvis AI (Urdu-first)

**Jarvis AI — آپ کا اپنا اردو وائس اسسٹنٹ: بولیں، اور کام ہو جائے۔**
Your own Urdu voice assistant — speak in Urdu (or English), and it gets done.

Ye project Daulat Hussain ke "Build Your Own JARVIS AI" project par based hai, starter skeleton (user ki uploaded zip) se banaya gaya hai. **Saara code khud likha gaya hai — paid Final Source Code copy nahi kiya gaya.** GitHub repo use nahi kiya gaya; source sirf uploaded zip hai.

## کیا بنایا گیا ہے؟ / What was built

- **Home page (اردو):** hero, live voice demo, features, commands ke examples
- **Voice Assistant:** OpenAI Realtime (WebRTC) — Urdu instructions; bina key ke **Demo Mode** (Web Speech API ur-PK + `/api/chat` local replies), UI par saaf likha hota hai
- **Dashboard (sidebar):** Overview/stats, Voice, Tools, **Commands / حکم**, Appointments, Widgets, Settings (business profile, Urdu/English toggle, API keys status)
- **Commands page:** 22 Urdu voice+text commands (16 web + 6 PC) (اردو رسم الخط، رومن اردو، انگریزی) — `src/lib/command-parser.ts` inhein pehchan kar `src/ai/tools.ts` ke tools chalata hai
- **Tools (29):** appointment book/list/cancel/confirm, email (Resend), reminder, note, calculator, time/date, Urdu↔English translation, weather note, web-search note, business info, automation, SMS note, calendar note — har tool demo mode mein chalta hai
- **Auth:** Supabase login/signup; bina Supabase keys ke demo login (koi bhi email)
- **Portal + public site:** `/portal`, `/sites/[slug]`, `/widget-demo`, `/widget-test` (JSON `{ok:true}`)
- **Widget:** `/widget.js` embed script + `/api/widget` — kisi bhi site par lagayein
- **API:** `/api/realtime/session`, `/api/chat`, `/api/tools`, `/api/widget`, `/api/widget-script`, `/api/appointments`, `/api/appointments/confirm`, `/api/business`
- **Supabase schema:** `supabase/schema.sql` — businesses, appointments, conversations, messages, widgets, automations + RLS + seed

## جاروس ایک کریکٹر ہے — Character, Memory, Push-to-Talk 🎭

- **Character:** Settings → Character mein chunein — **اسسٹنٹ / مینٹور / بہترین دوست**۔ جاروس اسی lehje mein jawab dega — jaise koi apna، na ke koi machine۔
- **Memory:** Dashboard → **میموری** par dekhein ke Jarvis aap ke baare mein kya yaad rakhta hai (naam، دلچسپیاں، باتیں) — edit ya delete bhi kar sakte hain۔ Memory browser mein save hoti hai (Supabase connect ho to wahan bhi) اور جوابات mein use hoti hai (جیسے سلام mein aapka naam)۔
- **Push-to-Talk:** Voice page par mic **daba kar rakhein**، ya shortcut `` ` `` (Esc ke neeche) ya `Ctrl+Space` — chhorne par jawab milega۔ PC par global hotkey ke liye `pc-agent/hotkey.ps1` chalayein — kisi bhi app se bol sakte hain۔ Dashboard par **Mini Bar** (upar chhota floating bar) bhi rehta hai۔
- **System Core:** Dashboard par chaar circuits nazar aate hain — **میموری، سکلز، کریکٹر، سیٹنگز** — sab zinda aur clickable۔
- **Daily Picks ("آپ کی دنیا"):** Dashboard par roz 3 chhoti picks — aapki dilchaspiyon ki bunyad par۔ Demo picks hain؛ live news ke liye search API key chahiye — random news ko personalised claim nahi kiya jata۔
- **Phone Remote:** phone se Jarvis ko call karna **future step hai، abhi built nahi** — koi fake remote nahi banaya gaya۔

**PC agent ke liye:** Windows 10/11، mic aur internet chahiye۔

## PC Control — اپنا پورا PC voice سے control karein 🖥️

**Web app akela PC control nahi kar sakta** (browser security) — isliye ek chhota **local PC agent** hai: `pc-agent/`

1. Apne PC par chalayein:
```bash
cd pc-agent
node agent.js
```
2. Token copy kar ke `.env.local` mein dalein:
```bash
JARVIS_PC_URL=http://127.0.0.1:8787
JARVIS_PC_TOKEN=apna-token-yahan-dalein
```
3. Web app restart karein, phir Dashboard → **PC Control** par status Connected ✓ check karein

PC commands (Urdu + English): "کروم کھولو"، "نوٹ پیڈ کھولو"، "آواز بڑھاؤ"، "اسکرین لاک کرو"، "اسکرین شاٹ لو"، "سسٹم بتاؤ"، "فائل تلاش کرو" — mukammal list Dashboard → PC Control par hai، aur guide `pc-agent/README.md` mein hai۔

**Safety:** Delete/Format BLOCKED hain (kabhi nahi chalengi)؛ Shutdown/Restart sirf dobara confirmation ke baad؛ sirf allowlist apps khulti hain؛ agent sirf localhost par sunta hai۔

## کیا ڈیمو ہے، کیا اصلی ہے؟ / Demo vs real

| چیز | ڈیمو (بغیر keys) | اصلی (keys ke saath) |
|---|---|---|
| Voice (bolna/sunna) | Web Speech API (browser) | OpenAI Realtime — `OPENAI_API_KEY` |
| AI جواب | Local keyword replies + tools | OpenAI `gpt-4o-mini` — `OPENAI_API_KEY` |
| Login/data | In-memory demo | Supabase — `NEXT_PUBLIC_SUPABASE_URL` + keys |
| Email | Demo log (bheja nahi jata) | Resend — `RESEND_API_KEY` |
| 150+ apps | **Nahi — live connected nahi.** 29 tools + extensible registry; connectors ko alag API key/OAuth se connect karna hota hai | Har app alag se connect hogi |
| PC Control | PC agent ke baghair "connected nahi" batata hai, fake success nahi | PC agent apne PC par chalayein, phir asli control |

## Setup

1. Node.js 20+ install karein
2. Keys chahiye hon to: `cp .env.local.example .env.local` aur apni keys dalein (bina keys ke bhi demo chalega)
3. Supabase use karna ho to `supabase/schema.sql` Supabase SQL Editor mein chalayein
4. Neeche wale commands chalayein (END section dekhein)

## Folder map

```
src/app/            pages: home, (auth) login/signup, (dashboard) overview/voice/tools/commands/appointments/widgets/settings, (portal), sites/[slug], widget-demo
src/app/api/        realtime/session, chat, tools, widget, widget-script, appointments(+/confirm), business
src/ai/tools.ts     20+ tools + CONNECTORS (150+ apps ka raasta)
src/lib/            memory (demo store), command-parser (Urdu/Roman/English), supabase client/server
src/components/     VoiceAssistant, Sidebar
src/store/          voice (Zustand), business (Zustand)
src/constants/      Urdu strings, NAV_LINKS, JARVIS_COMMANDS (16 commands)
supabase/schema.sql poora database schema + RLS
```

## END — Copy-paste commands / آخر میں یہ کمانڈز چلائیں

Terminal mein project folder mein ja kar ye commands aik aik kar ke chalayein:

```bash
cd ~/workspace/jarvis-full
npm install
npm run dev
```

- `npm install` — saari dependencies install karta hai (pehli dafa lazmi)
- `npm run dev` — app chalata hai: phir browser mein kholein **http://localhost:3000**
- Band karne ke liye terminal mein `Ctrl + C` dabiayein

Production build check karne ke liye:

```bash
npm run build
npm start
```

- `npm run build` — production build banata hai (error ho to yahin nazar aayega)
- `npm start` — built app chalata hai: **http://localhost:3000**

Type check (optional):

```bash
npx tsc --noEmit
```

## Jarvis ke andar commands (مختصر)

"اپائنٹمنٹ بک کرو" • "آج کی اپائنٹمنٹس دکھاؤ" • "ای میل بھیجو" • "یاد دلا دو" • "نوٹ لکھ لو" • "حساب کرو" • "وقت کیا ہوا ہے؟" • "اردو میں ترجمہ کرو" — مکمل فہرست: Dashboard → **کمانڈز / حکم**
