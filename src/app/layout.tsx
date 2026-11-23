import type { Metadata } from "next";
import { Inter, Noto_Nastaliq_Urdu, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import BusinessProvider from "@/providers/BusinessProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ["arabic"], variable: "--font-nastaliq", weight: ["400", "700"] });
const arabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic" });

export const metadata: Metadata = {
  title: "Jarvis AI — Your AI Voice Assistant",
  description: "Your own AI voice assistant — speak in Urdu, Roman Urdu or English, and it gets done. Voice control, appointments, email, reminders and automation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // English UI (LTR). Arabic fonts stay loaded only so Urdu voice-command
  // examples (what the user speaks) render correctly.
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${nastaliq.variable} ${arabic.variable}`}>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <BusinessProvider>{children}</BusinessProvider>
      </body>
    </html>
  );
}
