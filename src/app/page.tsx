import Link from "next/link";
import { BarChart3, Star, Users, Sparkles, ClipboardList, ChevronRight } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "5-Category Reviews",
    desc: "Rate communication, productivity, teamwork, leadership, and technical skills — each with notes.",
  },
  {
    icon: Users,
    title: "Two-Role Access",
    desc: "Managers submit and own reviews. Employees get a private, read-only view of their scores.",
  },
  {
    icon: Sparkles,
    title: "AI Coaching (Pro)",
    desc: "Claude generates personalized strengths, growth areas, and a 90-day action plan per review.",
  },
  {
    icon: Star,
    title: "Trend Visibility",
    desc: "See how performance evolves over time with per-category breakdowns and average ratings.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span className="text-indigo-600">Standpoint</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-6">
          <Sparkles className="w-3 h-3" />
          Powered by Claude AI
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-5">
          Performance reviews that
          <br />
          <span className="text-indigo-600">actually help people grow</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Managers submit structured reviews across 5 categories. Employees get a clear dashboard
          with their scores and AI-generated coaching summaries.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Start for free <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-gray-600 font-medium text-sm hover:text-gray-900"
          >
            Already have an account? Sign in
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Free plan available · No credit card required
        </p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Everything you need for meaningful performance reviews
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="p-2 bg-indigo-50 rounded-lg w-fit mb-4">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { step: "1", title: "Manager signs up", desc: "Create your organization and invite your team with a shareable link." },
            { step: "2", title: "Submit a review", desc: "Rate each employee across 5 categories, add notes, and click submit." },
            { step: "3", title: "Employees see results", desc: "Employees get a private dashboard with scores and an AI coaching summary." },
          ].map((s) => (
            <div key={s.step}>
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                {s.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to give your team a clearer standpoint?
          </h2>
          <p className="text-indigo-200 mb-8">
            Start free. Upgrade to Pro for AI-powered coaching summaries.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
          >
            Create your free account <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Standpoint · Built with Next.js, Supabase, Stripe & Claude
      </footer>
    </div>
  );
}
