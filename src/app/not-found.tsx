import Link from "next/link";
export default function NotFound() {
  return (
    <main className="p-10 text-center">
      <h1 className="text-2xl font-bold">Page not found (404)</h1>
      <p className="mt-2" style={{ color: "var(--text-3)" }}>This page does not exist.</p>
      <Link href="/" className="btn-primary mt-4 inline-flex">Back to Home</Link>
    </main>
  );
}
