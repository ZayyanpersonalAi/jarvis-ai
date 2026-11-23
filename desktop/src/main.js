const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { fork } = require('child_process');

// Live Jarvis AI web app (Vercel) — desktop app isi ko load karta hai.
const APP_URL = process.env.JARVIS_URL || 'https://jarvis-ai-azure-delta.vercel.app/';

let win;
let agentProc = null;
let pcToken = '';

// PC agent ka token: userData me ek dafa banta hai, hamesha wahi rehta hai.
function loadOrCreateToken() {
  const file = path.join(app.getPath('userData'), 'jarvis-pc-token.txt');
  try { const t = fs.readFileSync(file, 'utf8').trim(); if (t) return t; } catch { /* nahi hai */ }
  const t = crypto.randomBytes(24).toString('hex');
  try { fs.writeFileSync(file, t, { mode: 0o600 }); } catch { /* ignore */ }
  return t;
}

// PC AGENT KHUD-BA-KHUD: koi command chalane ki zaroorat nahi.
// App khulte hi agent background me chal jata hai (127.0.0.1:8787).
function startPcAgent() {
  try {
    if (!pcToken) pcToken = loadOrCreateToken();
    const packagedAgent = path.join(process.resourcesPath || '', 'pc-agent', 'agent.js');
    const devAgent = path.join(__dirname, '..', 'pc-agent', 'agent.js');
    const agentPath = fs.existsSync(packagedAgent) ? packagedAgent : devAgent;
    agentProc = fork(agentPath, [], {
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', JARVIS_PC_TOKEN: pcToken, JARVIS_PC_PORT: '8787' },
      stdio: 'ignore',
    });
    agentProc.on('error', () => { /* agent na chale to bhi app chalegi */ });
  } catch { /* ignore */ }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 380, minHeight: 560,
    title: 'Jarvis AI',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });
  win.webContents.session.setPermissionRequestHandler((wc, permission, cb) => {
    const url = wc.getURL();
    cb(url.startsWith(APP_URL) && (permission === 'media' || permission === 'notifications'));
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) { shell.openExternal(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });
  // PAIRING: web app me jo Connection Key save hai, desktop app wahi utha
  // leta hai — user ko app me key dalne ki zaroorat nahi. Key na ho to
  // app apni key bana kar web app me save kar deta hai.
  win.webContents.on('did-finish-load', async () => {
    if (!win.webContents.getURL().startsWith(APP_URL)) return;
    try {
      const existing = await win.webContents.executeJavaScript(`localStorage.getItem('jarvis-pc-token')`);
      if (existing && existing !== pcToken) {
        pcToken = String(existing);
        try { fs.writeFileSync(path.join(app.getPath('userData'), 'jarvis-pc-token.txt'), pcToken, { mode: 0o600 }); } catch { /* ignore */ }
        try { agentProc?.kill(); } catch { /* ignore */ }
        startPcAgent();
      } else if (!existing && pcToken) {
        await win.webContents.executeJavaScript(
          `try{localStorage.setItem('jarvis-pc-token', ${JSON.stringify(pcToken)});localStorage.setItem('jarvis-pc-enabled','1');}catch(e){}`
        );
      }
    } catch { /* ignore */ }
  });
  win.loadURL(APP_URL).catch(() => { win.loadFile(path.join(__dirname, 'offline.html')); });
  win.webContents.on('did-fail-load', (e, code, desc, url, isMainFrame) => {
    if (isMainFrame) win.loadFile(path.join(__dirname, 'offline.html'));
  });
}
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  startPcAgent();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { try { agentProc?.kill(); } catch { /* ignore */ } });
