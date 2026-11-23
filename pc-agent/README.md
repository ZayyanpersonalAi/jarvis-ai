# جاروس پی سی ایجنٹ — Jarvis PC Agent

**Ye agent aapke PC ko voice se control karta hai.** Web app (browser) security ki wajah se PC ko direct control nahi kar sakta — isliye ye chhota local agent aapke **apne PC par** chalta hai, aur Jarvis web app is se baat karta hai.

## Install / Run — Windows (pehle)

```bash
cd pc-agent
node agent.js
```

- Node.js 20+ chahiye (https://nodejs.org)
- Agent chalega: `http://127.0.0.1:8787`
- Band karne ke liye `Ctrl + C`

Pehli dafa chalne par ek **token** banta hai aur `.jarvis-pc-token` file mein save hota hai. Token terminal par bhi nazar aata hai.

## Pairing — Jarvis web app se jodna

1. PC agent chalayein (`node agent.js`) — token note karein
2. Jarvis web app ki `.env.local` mein ye do lines dalein:

```bash
JARVIS_PC_URL=http://127.0.0.1:8787
JARVIS_PC_TOKEN=apna-token-yahan-dalein
```

3. Web app restart karein (`npm run dev` dobara chalayein)
4. Dashboard → **PC Control** par status "Connected ✓" nazar aayega

**Token kabhi kisi se share mat karein aur GitHub par mat dalein.** Agent sirf `127.0.0.1` (apna PC) se requests leta hai — internet se koi connect nahi kar sakta.

## Push-to-Talk — kisi bhi app se bolna 🎙️

Global hotkey: **`Ctrl+Space` ya `` ` ``** (Esc ke neeche wali key) dabayein — kisi bhi app se — Jarvis voice page khul jayega.

```powershell
# Pehle agent chalayein (aik terminal mein):
node agent.js
# Phir hotkey script chalayein (doosri PowerShell mein):
powershell -ExecutionPolicy Bypass -File hotkey.ps1
```

Web app mein bhi wahi shortcut hai: Voice page par `` ` `` ya `Ctrl+Space` dabayein, ya mic button **daba kar rakhein** (push-to-talk) — chhorne par jawab milega۔ Dashboard par upar aik chhota **Mini Bar** bhi rehta hai (hamesha nazar aata hai، collapse ho jata hai)۔

**Zaroorat:** Windows 10/11، mic، internet (OpenAI voice ke liye)۔

## Phone Remote — future step (abhi nahi bana)

Phone se Jarvis ko call karna (jab PC on ho) **future step hai، abhi built nahi** — is README ya app mein iska koi fake button nahi hai۔ Jab banega to PC agent ko phone se secure connect karne ka tareeqa isi README mein likha jayega۔

## Commands (Urdu + English)

| Urdu | English | Kaam |
|---|---|---|
| کروم کھولو | open Chrome | Chrome kholta hai |
| وی ایس کوڈ کھولو | open VS Code | VS Code kholta hai |
| نوٹ پیڈ کھولو | open Notepad | Notepad kholta hai |
| کیلکولیٹر کھولو | open Calculator | Calculator kholta hai |
| ورڈ / ایکسل کھولو | open Word / Excel | Word/Excel kholta hai |
| فائل ایکسپلورر کھولو | open File Explorer | Explorer kholta hai |
| ویب سائٹ کھولو | open website google.com | Website kholta hai |
| آواز بڑھاؤ / کم کرو | volume up / down | Volume |
| خاموش کرو | mute | Mute |
| اسکرین لاک کرو | lock screen | Screen lock |
| اسکرین شاٹ لو | take screenshot | Screenshot Pictures folder mein save |
| سسٹم بتاؤ | system info | PC ki maloomat |
| تلاش کرو | search files | Documents/Desktop mein file dhoondta hai |
| کلپ بورڈ دکھاؤ | clipboard | Clipboard text |
| ٹائپ کرو | type text | Active window mein text type karta hai |

## Safety / حفاظت — zaroor parhein ⚠️

- **Delete aur Format BLOCKED hain** — ye commands kabhi nahi chalengi, chahe aap kahein bhi.
- **Shutdown / Restart** sirf dobara confirmation ke baad chalte hain (confirm:true)۔
- Sirf allowlist wali apps khulti hain (Chrome, VS Code, Notepad, Calculator, Word, Excel, Explorer, Terminal, Settings) — koi bhi random program nahi chalta۔
- File kholna sirf apne home folder / drive ki paths tak mehdood hai۔
- Agent sirf localhost par sunta hai — bahar se koi access nahi۔

## API (developers ke liye)

```bash
curl http://127.0.0.1:8787/status
curl -X POST http://127.0.0.1:8787/command -H "Content-Type: application/json" -d '{"token":"TOKEN","text":"chrome kholo"}'
```
