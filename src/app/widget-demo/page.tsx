import VoiceAssistant from "@/components/VoiceAssistant";
export default function WidgetDemoPage() {
  return (
    <main className="gradient-mesh p-6" style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <p className="eyebrow" style={{ color: "var(--text-3)" }}>Widget Demo</p>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Widget Demo</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>This is the same chat the /widget.js embed shows on any website.</p>
        <div className="mt-5"><VoiceAssistant /></div>
      </div>
    </main>
  );
}
