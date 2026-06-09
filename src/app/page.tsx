import Link from "next/link";
import { Moon } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1E1B4B] flex flex-col items-center justify-center px-4 text-center">
      <Moon className="w-16 h-16 text-[#6B4FA0] mb-6" />
      <h1 className="font-heading text-5xl font-bold text-white mb-4">Amen Goodnight</h1>
      <p className="text-white/70 text-xl max-w-lg mb-10">Faith-filled, personalized bedtime stories — delivered every night for your children.</p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/signup" className="btn-primary text-lg px-8 py-3">Start Free Trial</Link>
        <Link href="/login" className="border border-white/30 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition text-lg">Sign In</Link>
      </div>
    </main>
  );
}
