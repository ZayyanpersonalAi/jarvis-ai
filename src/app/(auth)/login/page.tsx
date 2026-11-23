"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        // Demo mode: any email/password logs in as a demo user
        localStorage.setItem("jarvis-demo-user", email);
        router.push(search.get("next") || "/dashboard");
        return;
      }
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else router.push(search.get("next") || "/dashboard");
    } catch { setError("Could not log in — please try again."); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <h2 className="font-bold text-lg">Log in</h2>
      {!isSupabaseConfigured() && <p className="text-xs p-3 rounded-xl" style={{ background: "var(--bg-subtle)" }}>Demo Mode: no Supabase keys — log in with any email.</p>}
      <input className="input-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="input-field" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      {error && <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>}
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Please wait…" : "Log in"}</button>
      <p className="text-sm text-center">No account yet? <Link href="/signup" style={{ color: "var(--teal-400)", fontWeight: 600 }}>Sign up</Link></p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
