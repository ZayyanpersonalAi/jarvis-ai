"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// "Save login" OFF tha to: naya browser session khulte hi logout.
// (sessionStorage har browser session me khali hota hai, localStorage rehta hai.)
export default function SessionGuard() {
  const router = useRouter();
  useEffect(() => {
    try {
      if (localStorage.getItem("jarvis-nosave") === "1" && !sessionStorage.getItem("jarvis-alive")) {
        sessionStorage.setItem("jarvis-alive", "1");
        if (isSupabaseConfigured()) { void createClient().auth.signOut().then(() => router.push("/login")); }
        else { localStorage.removeItem("jarvis-demo-user"); router.push("/login"); }
      }
    } catch { /* ignore */ }
  }, [router]);
  return null;
}
