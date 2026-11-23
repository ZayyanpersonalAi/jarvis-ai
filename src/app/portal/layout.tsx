export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="gradient-mesh" style={{ minHeight: "100vh", padding: 20 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>{children}</div>
    </main>
  );
}
