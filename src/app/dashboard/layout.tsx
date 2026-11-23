import Sidebar from "@/components/Sidebar";
import MiniBar from "@/components/MiniBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row" style={{ minHeight: "100vh" }}>
      <div className="md:w-60 md:flex-none md:sticky md:top-0 md:h-screen">
        <Sidebar />
      </div>
      <main className="flex-1 p-5 sm:p-7 gradient-mesh" style={{ minWidth: 0 }}>{children}</main>
      <MiniBar />
    </div>
  );
}
