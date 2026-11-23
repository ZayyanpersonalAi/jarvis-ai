import Link from "next/link";
import { getWidgetConfig } from "@/services/widgets";

export default function PublicSitePage({ params }: { params: { slug: string } }) {
  const cfg = getWidgetConfig(params.slug);
  return (
    <main className="gradient-mesh p-6" style={{ minHeight: "100vh" }}>
      <div className="card-surface p-6" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 className="text-2xl font-bold" style={{ letterSpacing: "-0.02em" }}>{cfg.title}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>{params.slug}</p>
        <p className="mt-4">{cfg.greeting}</p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link href="/portal" className="btn-primary">Talk to Jarvis</Link>
          <Link href="/widget-demo" className="btn-secondary">Widget demo</Link>
        </div>
        <p className="text-xs mt-5" style={{ color: "var(--text-3)" }}>This site runs the Jarvis widget via the /widget.js embed.</p>
      </div>
      <script src="/widget.js" data-business={params.slug} async />
    </main>
  );
}
