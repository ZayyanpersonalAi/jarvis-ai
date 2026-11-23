const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

// Live Jarvis AI web app (Vercel) — desktop app isi ko load karta hai,
// is liye web par jo update hoga wo desktop app me khud aa jayega.
const APP_URL = process.env.JARVIS_URL || 'https://jarvis-ai-azure-delta.vercel.app/';

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 380, minHeight: 560,
    title: 'Jarvis AI',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Voice assistant ko mic chahiye — sirf apni site ke liye allow
      permissions: ['media']
    }
  });
  // Mic permission sirf Jarvis ki apni origin ko
  win.webContents.session.setPermissionRequestHandler((wc, permission, cb) => {
    const url = wc.getURL();
    cb(url.startsWith(APP_URL) && (permission === 'media' || permission === 'notifications'));
  });
  // Bahir ke links default browser me khulein
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) { shell.openExternal(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });
  win.loadURL(APP_URL).catch(() => {
    win.loadFile(path.join(__dirname, 'offline.html'));
  });
  win.webContents.on('did-fail-load', (e, code, desc, url, isMainFrame) => {
    if (isMainFrame) win.loadFile(path.join(__dirname, 'offline.html'));
  });
}
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
