export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="gradient-mesh flex items-center justify-center" style={{ minHeight: "100vh", padding: 20 }}>
      <div className="card-surface p-6 w-full" style={{ maxWidth: 440 }}>
        <div className="flex justify-center">
          <span className="flex items-center justify-center font-bold" style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #2dd4bf, #22d3ee)", color: "#052e2b", fontSize: 24 }}>J</span>
        </div>
        <h1 className="text-xl font-bold text-center mt-3">Jarvis AI</h1>
        <p className="text-center text-sm mb-5" style={{ color: "var(--text-3)" }}>Your AI voice assistant — speaks Urdu &amp; English</p>
        {children}
      </div>
    </main>
  );
}
