"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_LINKS } from "@/constants";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = () => {
    try { localStorage.removeItem("jarvis-demo-user"); } catch { /* ignore */ }
    router.push("/login");
  };
  return (
    <aside className="gradient-sidebar p-4 flex md:flex-col flex-row md:gap-1 gap-2 overflow-x-auto md:overflow-visible items-center md:items-stretch md:min-h-screen">
      <Link href="/" className="flex items-center gap-2 mb-0 md:mb-4 flex-none">
        <span className="flex items-center justify-center font-bold text-white" style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.18)", fontSize: 16 }}>J</span>
        <span className="text-white font-bold text-lg">Jarvis AI</span>
      </Link>
      {NAV_LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link key={l.href} href={l.href} className={active ? "sidebar-link-active" : "sidebar-link"} style={{ whiteSpace: "nowrap" }}>
            {l.label}
          </Link>
        );
      })}
      <Link href="/portal" className="sidebar-link" style={{ whiteSpace: "nowrap" }}>Portal</Link>
      <Link href="/" className="sidebar-link" style={{ whiteSpace: "nowrap" }}>Home</Link>
      <button className="sidebar-link" style={{ textAlign: "left", whiteSpace: "nowrap" }} onClick={logout}>Log out</button>
    </aside>
  );
}
