"use client";
// Jarvis voice hook — OpenAI Realtime (WebRTC) + Demo fallback (Web Speech API).
// Voice understands Urdu script, Roman Urdu and English:
// speech recognition always uses ur-PK (it handles Urdu + mixed English),
// and replies are spoken in the same language the user spoke.
// Without OPENAI_API_KEY: demo mode — browser speech recognition + /api/chat,
// answers spoken via Web Speech Synthesis. The UI shows "Demo Mode" clearly.
import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceStore } from "@/store/voice";
import type { Language, VoiceStatus } from "@/types";

interface SpeechRecognitionLike { lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: { results: { transcript: string }[][] }) => void) | null; onend: (() => void) | null; onerror: ((e: unknown) => void) | null; start: () => void; stop: () => void; }

const URDU_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ROMAN_URDU_WORDS = /\b(karo|kar|kya|hai|hain|mujhe|mera|meri|batao|dikhao|bhejo|yaad|waqt|aaj|kal|tareekh|mausam|hisaab|tarjuma|kholo|band|awaz|shukriya|salam|madad|chahiye|kaise|kaisa|kahan|kab|kyun|nahi|acha|theek)\b/i;

/** Detect the language the user spoke: Urdu script or Roman Urdu -> "ur", else "en". */
export function detectSpokenLanguage(text: string): Language {
  if (URDU_SCRIPT.test(text) || ROMAN_URDU_WORDS.test(text)) return "ur";
  return "en";
}

export function useRealtimeVoice() {
  // Separate selectors — taking the whole store re-runs this hook on every
  // small change and swaps the callbacks, which re-runs VoiceAssistant's
  // useEffect again and again (infinite loop).
  const status = useVoiceStore((s) => s.status);
  const isDemo = useVoiceStore((s) => s.isDemo);
  const setStatus = useVoiceStore((s) => s.setStatus);
  const setDemo = useVoiceStore((s) => s.setDemo);
  const addMessage = useVoiceStore((s) => s.addMessage);
  const setTranscript = useVoiceStore((s) => s.setTranscript);
  const [error, setError] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakReply = useCallback((text: string) => {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      // Speak in the reply's language: Urdu voice for Urdu, English voice for English.
      const lang: Language = detectSpokenLanguage(text);
      u.lang = lang === "ur" ? "ur-PK" : "en-US";
      try { const c = JSON.parse(localStorage.getItem("jarvis-memory-v1") || "{}") as { character?: string }; u.rate = c.character === "friend" ? 1.05 : c.character === "mentor" ? 0.95 : 1.0; } catch { u.rate = 0.95; }
      synth.speak(u);
    } catch { /* no speech synthesis */ }
  }, []);

  const sendText = useCallback(async (text: string) => {
    const lang = detectSpokenLanguage(text);
    setStatus("thinking");
    addMessage({ id: `u-${Date.now()}`, role: "user", text, language: lang, createdAt: new Date().toISOString() });
    try {
      const mem = JSON.parse(localStorage.getItem("jarvis-memory-v1") || "{}") as { userName?: string; interests?: string[]; facts?: { text: string }[]; chatSummary?: string; character?: string };
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, language: lang, memory: mem }) });
      const j = await res.json();
      const reply: string = j?.reply || j?.data?.reply || "Sorry, I did not get a reply.";
      addMessage({ id: `a-${Date.now()}`, role: "assistant", text: reply, language: lang, createdAt: new Date().toISOString(), toolUsed: j?.toolUsed || j?.data?.toolUsed });
      setStatus("speaking");
      speakReply(reply);
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("No reply — could not reach /api/chat.");
    }
  }, [addMessage, setStatus, speakReply]);

  const startDemoListening = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) { setError("Your browser does not support voice recognition — try typing instead."); setStatus("error"); return; }
    const rec = new Ctor();
    // Always ur-PK: it understands Urdu, Roman Urdu and mixed English.
    rec.lang = "ur-PK";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0]?.transcript || "").join(" ");
      setTranscript(transcript);
      if ((e.results[e.results.length - 1] as unknown as { isFinal?: boolean })?.isFinal) { rec.stop(); void sendText(transcript); }
    };
    rec.onend = () => { if (useVoiceStore.getState().status === "listening") setStatus("idle"); };
    rec.onerror = (e) => {
      // Mic blocked / no-speech / not-allowed — clear English message, status back to idle
      // so "Error" does not get stuck. The usual cause is browser mic permission.
      const kind = (e as { error?: string })?.error || "";
      setError(kind === "not-allowed" || kind === "service-not-allowed"
        ? "Microphone permission was not given — allow the mic in your browser, then try again."
        : "No voice came through the mic — press the mic again, or type below instead.");
      setStatus("idle");
    };
    recRef.current = rec;
    setStatus("listening");
    rec.start();
  }, [sendText, setStatus, setTranscript]);

  const startLive = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/realtime/session", { method: "POST" });
      const j = await res.json();
      if (!res.ok || !j?.client_secret) {
        // Demo fallback
        setDemo(true);
        startDemoListening();
        return;
      }
      setDemo(false);
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioRef.current = audioEl;
      pc.ontrack = (e) => { audioEl.srcObject = e.streams[0]; };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      const dc = pc.createDataChannel("oai-events");
      dc.onmessage = (e) => {
        try {
          const evt = JSON.parse(e.data as string) as { type?: string; transcript?: string; delta?: string };
          if (evt.type === "response.audio_transcript.done" && evt.transcript) {
            addMessage({ id: `a-${Date.now()}`, role: "assistant", text: evt.transcript, language: detectSpokenLanguage(evt.transcript), createdAt: new Date().toISOString() });
          }
          if (evt.type === "conversation.item.input_audio_transcription.completed" && evt.transcript) setTranscript(evt.transcript);
        } catch { /* ignore */ }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpRes = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`, {
        method: "POST", headers: { Authorization: `Bearer ${j.client_secret}`, "Content-Type": "application/sdp" }, body: offer.sdp,
      });
      const answer = { type: "answer" as RTCSdpType, sdp: await sdpRes.text() };
      await pc.setRemoteDescription(answer);
      setStatus("listening");
    } catch {
      setDemo(true);
      startDemoListening();
    }
  }, [addMessage, setDemo, setStatus, setTranscript, startDemoListening]);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* ignore */ }
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    if (pcRef.current) { pcRef.current.getSenders().forEach((s) => s.track?.stop()); pcRef.current.close(); pcRef.current = null; }
    setStatus("idle");
  }, [setStatus]);

  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* ignore */ } }, []);

  return { status: status as VoiceStatus, error, isDemo, startLive, startDemoListening, stop, sendText, speakUrdu: speakReply };
}
