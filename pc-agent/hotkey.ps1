# Jarvis PC Agent — Global Push-to-Talk hotkey (Windows 10/11)
# Ctrl+Space ya ` (Backquote) dabayein — kisi bhi app se — to Jarvis voice page khulta hai.
# Chalane ke liye: pehle `node agent.js` chalayein, phir alag PowerShell mein:
#   powershell -ExecutionPolicy Bypass -File hotkey.ps1
# Band karne ke liye PowerShell window band kar dein (Ctrl+C).
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;
public class HotkeyForm : Form {
  [DllImport("user32.dll")] public static extern bool RegisterHotKey(IntPtr hWnd, int id, int fsModifiers, int vk);
  [DllImport("user32.dll")] public static extern bool UnregisterHotKey(IntPtr hWnd, int id);
  public HotkeyForm() {
    this.ShowInTaskbar = false; this.WindowState = FormWindowState.Minimized; this.Visible = false;
    // Ctrl+Space (id 1), Backquote ` (id 2, VK_OEM_3 = 0xC0)
    RegisterHotKey(this.Handle, 1, 2, (int)Keys.Space);
    RegisterHotKey(this.Handle, 2, 0, 0xC0);
  }
  protected override void WndProc(ref Message m) {
    if (m.Msg == 0x0312) {
      try {
        $client = New-Object System.Net.WebClient
        $client.Headers.Add("Content-Type", "application/json")
        $client.UploadString("http://127.0.0.1:8787/hotkey", "POST", "{}") | Out-Null
      } catch { }
      Start-Process "http://localhost:3000/dashboard/voice"
    }
    base.WndProc(ref m);
  }
}
"@
Write-Host "Jarvis hotkey chal raha hai: Ctrl+Space ya ` dabayein (kisi bhi app se). Band karne ke liye Ctrl+C."
[System.Windows.Forms.Application]::Run((New-Object HotkeyForm))
