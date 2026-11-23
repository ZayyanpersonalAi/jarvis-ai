"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useBusinessStore } from "@/store/business";
import { useVoiceStore } from "@/store/voice";
import { useMemoryStore } from "@/store/memory";

interface Ctx { userEmail: string | null; demo: boolean; }
const BusinessContext = createContext<Ctx>({ userEmail: null, demo: true });
export const useBusiness = () => useContext(BusinessContext);

export default function BusinessProvider({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [demo, setDemo] = useState(true);
  const setAppointments = useBusinessStore((s) => s.setAppointments);
  const setLanguage = useVoiceStore((s) => s.setLanguage);
  const loadMemory = useMemoryStore((s) => s.load);

  useEffect(() => {
    loadMemory();
    try { const lang = localStorage.getItem("jarvis-lang"); if ((lang === "ur" || lang === "en") && lang !== useVoiceStore.getState().language) setLanguage(lang); } catch { /* ignore */ }
    if (typeof window !== "undefined" && localStorage.getItem("jarvis-demo-user")) setUserEmail(localStorage.getItem("jarvis-demo-user"));
    if (isSupabaseConfigured()) {
      setDemo(false);
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    }
    fetch("/api/appointments").then((r) => r.json()).then((j) => { if (j?.data) setAppointments(j.data); }).catch(() => undefined);
  }, [setAppointments, setLanguage, loadMemory]);

  return <BusinessContext.Provider value={{ userEmail, demo }}>{children}</BusinessContext.Provider>;
}
