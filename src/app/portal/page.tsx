import Link from "next/link";
import VoiceAssistant from "@/components/VoiceAssistant";
export default function PortalPage() {
  return (
    <div>
      <p className="eyebrow" style={{ color: "var(--text-3)" }}>Customer Portal</p>
      <h1 className="text-2xl sm:text-3xl font-bold mt-1" style={{ letterSpacing: "-0.02em" }}>Customer Portal</h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>Customers can talk to Jarvis here and book an appointment.</p>
      <div className="mt-5"><VoiceAssistant /></div>
      <div className="flex gap-3 mt-4">
        <Link href="/dashboard/appointments" className="btn-primary">Book an appointment</Link>
        <Link href="/" className="btn-secondary">Home</Link>
      </div>
    </div>
  );
}
