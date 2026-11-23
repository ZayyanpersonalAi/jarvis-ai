# Jarvis AI — Desktop App (Windows)

Ye Electron desktop app hai jo live Jarvis AI web app
(https://jarvis-ai-azure-delta.vercel.app/) ko apni window me chalata hai.
Mic permission sirf Jarvis ki apni site ko milti hai. Internet lazmi hai.

## User ke liye (install)
1. `Jarvis AI Setup 1.0.0.exe` download karein
2. Double-click → Next → Install (folder bhi choose kar sakte hain)
3. Desktop / Start Menu se "Jarvis AI" kholein — bas chal gaya.
Portable version (`Jarvis AI 1.0.0.exe`) bina install ke bhi chalti hai.

## .exe banane ka tareeqa (FREE — GitHub Actions)
Is project ko GitHub repo me `desktop/` folder ke tor par rakhein
(workflow `.github/workflows/build-windows.yml` repo root par ho).
Actions tab → "Build Windows Installer" → Run workflow.
Kuch minutes me Artifacts me `Jarvis-AI-Windows-Installer` (.exe) mil jayega.
Ya apne Windows PC par: `npm install` phir `npm run build:win`.
