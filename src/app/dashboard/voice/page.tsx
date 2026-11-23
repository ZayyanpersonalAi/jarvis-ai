import VoiceAssistant from "@/components/VoiceAssistant";
export default function VoicePage() {
  return (
    <div>
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>Voice</p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1 mb-5" style={{ letterSpacing: "-0.02em" }}>Voice Assistant</h1>
      <VoiceAssistant />
      <p className="text-sm mt-4" style={{ color: "var(--text-3)" }}>
        See the full command list on the <a href="/dashboard/commands" style={{ color: "var(--teal-400)", fontWeight: 600 }}>Commands page</a>.
      </p>
    </div>
  );
}
