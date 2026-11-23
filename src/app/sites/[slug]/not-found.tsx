import Link from "next/link";
export default function SiteNotFound() {
  return (
    <main className="p-10 text-center">
      <h1 className="text-2xl font-bold">This business site was not found</h1>
      <Link href="/" className="btn-primary mt-4 inline-flex">Back to Home</Link>
    </main>
  );
}
