"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        localStorage.setItem("jarvis-demo-user", email);
        localStorage.setItem("jarvis-business-name", businessName || name);
        router.push("/dashboard");
        return;
      }
      const supabase = createClient();
      const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { name, business_name: businessName } } });
      if (err) setError(err.message);
      else router.push("/dashboard");
    } catch { setError("Could not sign up — please try again."); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <h2 className="font-bold text-lg">Sign up</h2>
      <input className="input-field" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      <input className="input-field" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business name" />
      <input className="input-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="input-field" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (at least 6 characters)" />
      {error && <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>}
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Please wait…" : "Create account"}</button>
      <p className="text-sm text-center">Already have an account? <Link href="/login" style={{ color: "var(--teal-400)", fontWeight: 600 }}>Log in</Link></p>
    </form>
  );
}
