// Jarvis PC Agent — LOCAL agent, sirf apne PC par chalaye.
// Web app (browser) security ki wajah se PC ko direct control nahi kar sakta,
// isliye ye chhota Node server localhost:8787 par chalta hai aur Jarvis web app
// is se baat karta hai. Sirf localhost se requests accept karta hai + token check.
// Koi key hardcode nahi — token env JARVIS_PC_TOKEN se, warna pehli dafa generate
// hota hai aur .jarvis-pc-token file mein save hota hai (ye file kabhi share mat karein).
"use strict";
const http = require("http");
const os = require("os");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFile, spawn } = require("child_process");

const PORT = Number(process.env.JARVIS_PC_PORT || 8787);
const TOKEN_FILE = path.join(__dirname, ".jarvis-pc-token");
let TOKEN = process.env.JARVIS_PC_TOKEN || "";
if (!TOKEN) {
  try { TOKEN = fs.readFileSync(TOKEN_FILE, "utf8").trim(); } catch { /* nahi hai */ }
  if (!TOKEN) {
    TOKEN = crypto.randomBytes(24).toString("hex");
    try { fs.writeFileSync(TOKEN_FILE, TOKEN, { mode: 0o600 }); } catch { /* ignore */ }
  }
}
const IS_WIN = process.platform === "win32";
const IS_MAC = process.platform === "darwin";

// --- Safety: BLOCKED commands (by default, kabhi nahi chalte) ---
const BLOCKED = ["delete", "format", "rm ", "del ", "erase", "format c:", "shutdown /f"];
// Dangerous: sirf dobara confirmation (confirm:true) ke baad
const NEEDS_CONFIRM = ["shutdown", "restart", "reboot", "logoff", "sign out"];

// Allowlist apps (Windows-first)
const APPS = {
  chrome: IS_WIN ? ["cmd", ["/c", "start", "", "chrome"]] : IS_MAC ? ["open", ["-a", "Google Chrome"]] : ["google-chrome", []],
  vscode: IS_WIN ? ["cmd", ["/c", "start", "", "code"]] : IS_MAC ? ["open", ["-a", "Visual Studio Code"]] : ["code", []],
  code: IS_WIN ? ["cmd", ["/c", "start", "", "code"]] : ["code", []],
  notepad: IS_WIN ? ["notepad", []] : ["open", ["-a", "TextEdit"]],
  explorer: IS_WIN ? ["explorer", []] : IS_MAC ? ["open", ["."]] : ["xdg-open", ["."]],
  calculator: IS_WIN ? ["calc", []] : IS_MAC ? ["open", ["-a", "Calculator"]] : ["gnome-calculator", []],
  word: IS_WIN ? ["cmd", ["/c", "start", "", "winword"]] : ["open", ["-a", "Microsoft Word"]],
  excel: IS_WIN ? ["cmd", ["/c", "start", "", "excel"]] : ["open", ["-a", "Microsoft Excel"]],
  terminal: IS_WIN ? ["cmd", []] : IS_MAC ? ["open", ["-a", "Terminal"]] : ["gnome-terminal", []],
  settings: IS_WIN ? ["cmd", ["/c", "start", "ms-settings:"]] : ["open", ["-a", "System Preferences"]],
};

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { detached: true, stdio: "ignore", windowsHide: true });
    child.on("error", (e) => resolve({ ok: false, message: "App nahi khul saki: " + e.message }));
    child.unref();
    resolve({ ok: true, message: "OK — " + cmd + " khol diya gaya." });
  });
}
function ps(script) {
  return new Promise((resolve) => {
    execFile("powershell", ["-NoProfile", "-Command", script], { windowsHide: true }, (err, stdout) => {
      if (err) return resolve({ ok: false, message: "PowerShell error: " + err.message });
      resolve({ ok: true, message: String(stdout || "OK").trim() || "OK" });
    });
  });
}

function parsePcText(text) {
  const t = String(text || "").trim();
  const lower = t.toLowerCase();
  const has = (...ws) => ws.some((w) => lower.includes(w) || t.includes(w));
  if (has("format", "فارمیٹ")) return { action: "blocked", reason: "Format command BLOCKED hai — ye kabhi nahi chalegi." };
  if (has("delete", "ڈیلیٹ", "حذف")) return { action: "blocked", reason: "Delete command BLOCKED hai — file delete nahi ki jati." };
  if (has("shutdown", "بند کر دو", "کمپیوٹر بند", "band kar", "computer band")) return { action: "shutdown", needsConfirm: true };
  if (has("restart", "ری سٹارٹ", "re-start")) return { action: "restart", needsConfirm: true };
  if (has("lock", "لاک")) return { action: "lock" };
  if (has("screenshot", "اسکرین شاٹ")) return { action: "screenshot" };
  if (has("volume up", "آواز بڑھاؤ", "awaz barhao", "volume barhao")) return { action: "volume_up" };
  if (has("volume down", "آواز کم", "awaz kam")) return { action: "volume_down" };
  if (has("mute", "خاموش")) return { action: "mute" };
  if (has("chrome", "کروم")) return { action: "open_app", app: "chrome" };
  if (has("vs code", "vscode", "وی ایس کوڈ")) return { action: "open_app", app: "vscode" };
  if (has("notepad", "نوٹ پیڈ")) return { action: "open_app", app: "notepad" };
  if (has("calculator", "کیلکولیٹر")) return { action: "open_app", app: "calculator" };
  if (has("word", "ورڈ")) return { action: "open_app", app: "word" };
  if (has("excel", "ایکسل")) return { action: "open_app", app: "excel" };
  if (has("explorer", "فائل ایکسپلورر", "file explorer")) return { action: "open_app", app: "explorer" };
  if (has("terminal", "کمانڈ", "cmd")) return { action: "open_app", app: "terminal" };
  if (has("settings", "سیٹنگز")) return { action: "open_app", app: "settings" };
  const urlMatch = lower.match(/https?:\/\/[^\s]+/) || lower.match(/(?:open|kholo)\s+([a-z0-9-]+\.(?:com|pk|org|net|io)[^\s]*)/);
  if (has("website", "ویب سائٹ") || urlMatch) {
    const url = urlMatch ? (urlMatch[0].startsWith("http") ? urlMatch[0] : "https://" + urlMatch[1]) : "https://www.google.com";
    return { action: "open_website", url };
  }
  if (has("system info", "سسٹم", "system")) return { action: "system_info" };
  if (has("clipboard", "کلپ بورڈ")) return { action: "clipboard" };
  if (has("time", "وقت")) return { action: "time" };
  if (has("search", "تلاش", "talaash")) return { action: "search_files", query: t.replace(/.*(?:search|تلاش|talaash)\s*/i, "").trim() || "" };
  return null;
}

async function doAction(parsed, body) {
  const action = body.action || parsed?.action;
  const args = body.args || {};
  switch (action) {
    case "blocked": return { ok: false, blocked: true, message: parsed?.reason || "Ye command BLOCKED hai." };
    case "shutdown":
    case "restart": {
      if (!body.confirm) return { ok: false, needsConfirmation: true, message: `⚠️ ${action === "shutdown" ? "PC band" : "PC restart"} karne se pehle dobara confirm karein — confirm:true ke saath dobara bhejein.` };
      if (!IS_WIN) return { ok: false, message: "Shutdown/restart sirf Windows agent par supported hai." };
      return ps(action === "shutdown" ? "Stop-Computer -Force" : "Restart-Computer -Force").then((r) => ({ ...r, message: r.ok ? (action === "shutdown" ? "PC band ho raha hai…" : "PC restart ho raha hai…") : r.message }));
    }
    case "lock": {
      if (IS_WIN) return ps("rundll32.exe user32.dll,LockWorkStation").then(() => ({ ok: true, message: "Screen lock kar di gayi 🔒" }));
      return { ok: false, message: "Lock sirf Windows par supported hai." };
    }
    case "screenshot": {
      if (!IS_WIN) return { ok: false, message: "Screenshot sirf Windows agent par supported hai." };
      const file = path.join(os.homedir(), "Pictures", `jarvis-screenshot-${Date.now()}.png`);
      const script = `Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $b=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds; $bmp=New-Object System.Drawing.Bitmap($b.Width,$b.Height); $g=[System.Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($b.Location,[System.Drawing.Point]::Empty,$b.Size); $bmp.Save('${file.replace(/'/g, "''")}'); 'saved:' + '${file}'`;
      const r = await ps(script);
      return { ok: r.ok, message: r.ok ? `Screenshot save ho gaya: ${file}` : r.message, data: { file } };
    }
    case "volume_up": return IS_WIN ? ps("(New-Object -ComObject WScript.Shell).SendKeys([char]175)").then(() => ({ ok: true, message: "Volume barha diya 🔊" })) : { ok: false, message: "Volume sirf Windows par supported hai." };
    case "volume_down": return IS_WIN ? ps("(New-Object -ComObject WScript.Shell).SendKeys([char]174)").then(() => ({ ok: true, message: "Volume kam kar diya 🔉" })) : { ok: false, message: "Volume sirf Windows par supported hai." };
    case "mute": return IS_WIN ? ps("(New-Object -ComObject WScript.Shell).SendKeys([char]173)").then(() => ({ ok: true, message: "Mute kar diya 🔇" })) : { ok: false, message: "Mute sirf Windows par supported hai." };
    case "open_app": {
      const app = (args.app || parsed?.app || "").toLowerCase();
      const entry = APPS[app];
      if (!entry) return { ok: false, message: `App nahi mili: ${app}. Allowed apps: ${Object.keys(APPS).join(", ")}` };
      return run(entry[0], entry[1]);
    }
    case "open_website": {
      const url = args.url || parsed?.url || "https://www.google.com";
      if (!/^https?:\/\//.test(url)) return { ok: false, message: "Ghalat URL." };
      if (IS_WIN) return run("cmd", ["/c", "start", "", url]);
      return run(IS_MAC ? "open" : "xdg-open", [url]);
    }
    case "open_path": {
      const p = String(args.path || "");
      const home = os.homedir();
      const resolved = path.resolve(p);
      if (!resolved.startsWith(home) && !/^[A-Za-z]:\\/.test(resolved)) return { ok: false, message: "Sirf apne home folder / drive ki paths kholi ja sakti hain." };
      if (IS_WIN) return run("explorer", [resolved]);
      return run(IS_MAC ? "open" : "xdg-open", [resolved]);
    }
    case "type_text": {
      const text = String(args.text || "");
      if (!text || text.length > 500) return { ok: false, message: "Type karne ke liye 1-500 characters ka text chahiye." };
      if (!IS_WIN) return { ok: false, message: "Type sirf Windows par supported hai." };
      const safe = text.replace(/"/g, '""');
      return ps(`Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("${safe}")`).then(() => ({ ok: true, message: "Text type kar diya." }));
    }
    case "clipboard": return IS_WIN ? ps("Get-Clipboard -Raw") : { ok: false, message: "Clipboard sirf Windows par supported hai." };
    case "system_info": return { ok: true, message: `PC: ${os.type()} ${os.release()} (${os.arch()}), CPU: ${os.cpus()[0]?.model || "?"}, RAM: ${(os.totalmem() / 1e9).toFixed(1)} GB, Free: ${(os.freemem() / 1e9).toFixed(1)} GB, User: ${os.userInfo().username}`, data: { platform: os.platform(), release: os.release(), arch: os.arch(), totalMemGB: +(os.totalmem() / 1e9).toFixed(1) } };
    case "time": return { ok: true, message: "PC par waqt: " + new Date().toLocaleString("ur-PK", { timeZone: "Asia/Karachi" }) };
    case "search_files": {
      const query = String(args.query || parsed?.query || "").toLowerCase();
      if (!query) return { ok: false, message: "Search ke liye naam likhein — jaise 'search report'." };
      const roots = [path.join(os.homedir(), "Documents"), path.join(os.homedir(), "Desktop")];
      const found = [];
      const walk = (dir, depth) => {
        if (depth > 2 || found.length >= 10) return;
        let entries = [];
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
        for (const e of entries) {
          if (e.name.toLowerCase().includes(query)) found.push(path.join(dir, e.name));
          if (e.isDirectory() && !e.name.startsWith(".")) walk(path.join(dir, e.name), depth + 1);
          if (found.length >= 10) return;
        }
      };
      roots.forEach((r) => walk(r, 0));
      return { ok: true, message: found.length ? `Mil gaya:\n${found.join("\n")}` : `"${query}" nahi mila (Documents/Desktop mein dhoonda).`, data: { files: found } };
    }
    default: return { ok: false, message: "Ye PC command samajh nahi aayi. Commands list PC Control page par dekhein." };
  }
}

const server = http.createServer(async (req, res) => {
  const ALLOWED_ORIGINS = ["http://localhost:3000", "https://jarvis-ai-azure-delta.vercel.app"];
  const reqOrigin = req.headers.origin || "";
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : "https://jarvis-ai-azure-delta.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const send = (code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };
  if (req.method === "GET" && url.pathname === "/status") {
    return send(200, { ok: true, agent: "jarvis-pc-agent", version: "1.0.0", platform: process.platform, hostname: os.hostname(), time: new Date().toISOString() });
  }
  if (req.method === "POST" && url.pathname === "/hotkey") {
    // Global push-to-talk: hotkey.ps1 se aata hai. Agent sirf log karta hai aur
    // web voice page kholne ka signal deta hai (browser khud khulta hai hotkey.ps1 se).
    console.log("🎙️ Hotkey dabaya gaya — push-to-talk (voice page khul raha hai)");
    return send(200, { ok: true, listening: true, message: "Push-to-talk — Jarvis voice page khul raha hai." });
  }
  if (req.method === "POST" && url.pathname === "/command") {
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 100000) req.destroy(); });
    req.on("end", async () => {
      let body = {};
      try { body = JSON.parse(raw || "{}"); } catch { return send(400, { ok: false, error: "Ghalat JSON" }); }
      const token = body.token || (req.headers.authorization || "").replace("Bearer ", "");
      if (token !== TOKEN) return send(401, { ok: false, error: "Ghalat token — pc-agent/README mein pairing dekhein." });
      const text = String(body.text || body.command || "");
      const parsed = text ? parsePcText(text) : null;
      if (parsed?.action === "blocked") return send(403, { ok: false, blocked: true, message: parsed.reason });
      if (parsed?.needsConfirm && !body.confirm) return send(200, { ok: false, needsConfirmation: true, message: "⚠️ Ye dangerous command hai — dobara confirm karein (confirm:true bhej kar)." });
      const result = await doAction(parsed, body);
      return send(result.ok ? 200 : 400, result);
    });
    return;
  }
  return send(404, { ok: false, error: "Not found — /status ya /command use karein." });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Jarvis PC Agent chal raha hai: http://127.0.0.1:${PORT}`);
  console.log(`Platform: ${process.platform} | Token file: .jarvis-pc-token (ye token Jarvis web app ki .env.local mein JARVIS_PC_TOKEN ke tor par dalein)`);
  console.log("Band karne ke liye Ctrl+C dabiayein.");
});
