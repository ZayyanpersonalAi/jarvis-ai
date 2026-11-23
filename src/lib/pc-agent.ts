// Jarvis web app -> PC agent bridge (server-side only)
const PC_URL = process.env.JARVIS_PC_URL || "http://127.0.0.1:8787";
const PC_TOKEN = process.env.JARVIS_PC_TOKEN || "";

export function isPcAgentConfigured(): boolean { return Boolean(PC_TOKEN); }

export async function pcStatus(): Promise<{ connected: boolean; info?: unknown; error?: string }> {
  try {
    const res = await fetch(`${PC_URL}/status`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { connected: false, error: `PC agent did not answer (HTTP ${res.status})` };
    return { connected: true, info: await res.json() };
  } catch { return { connected: false, error: "PC Agent is not connected — run pc-agent on your PC (see pc-agent/README)." }; }
}

export async function sendPcCommand(body: { text?: string; action?: string; args?: Record<string, unknown>; confirm?: boolean }): Promise<{ ok: boolean; message: string; needsConfirmation?: boolean; blocked?: boolean; data?: unknown }> {
  if (!PC_TOKEN) return { ok: false, message: "PC Agent is not connected — first run pc-agent on your PC and set JARVIS_PC_TOKEN (see pc-agent/README). This command was not run." };
  try {
    const res = await fetch(`${PC_URL}/command`, { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(15000), body: JSON.stringify({ token: PC_TOKEN, ...body }) });
    const j = await res.json();
    return { ok: Boolean(j.ok), message: String(j.message || j.error || "Got an answer from the PC agent."), needsConfirmation: j.needsConfirmation, blocked: j.blocked, data: j.data };
  } catch { return { ok: false, message: "PC Agent is not connected — run pc-agent on your PC (see pc-agent/README)." }; }
}
