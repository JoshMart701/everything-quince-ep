import { Instrument_Serif } from "next/font/google";
import Link from "next/link";
import { BarChart3, Sparkles, ClipboardList, TrendingUp, Shield, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { HeroDemo } from "@/components/standpoint/HeroDemo";
import { ScrollDemo } from "@/components/standpoint/ScrollDemo";
import { PricingToggle } from "@/components/standpoint/PricingToggle";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400" });

const PAIN_POINTS = [
  {
    icon: "📋",
    title: "Reviews buried in spreadsheets",
    body: "Performance feedback lives in Google Docs nobody re-reads. Next quarter rolls around and nothing has changed.",
  },
  {
    icon: "🎯",
    title: "Vague feedback, no direction",
    body: '"Keep up the good work" is not coaching. Employees leave meetings with no idea what to actually do differently.',
  },
  {
    icon: "🕐",
    title: "Reviews take forever to write",
    body: "Managers spend hours writing the same boilerplate for every direct report, so reviews get skipped or rushed.",
  },
  {
    icon: "👻",
    title: "Employees in the dark",
    body: "No visibility into their own scores. Employees find out how they really rank at performance improvement plans or resignations.",
  },
];

const VALUES = [
  {
    icon: ClipboardList,
    color: "bg-[#4f46e5]/10 text-[#4f46e5]",
    title: "Structured by design",
    body: "Five consistent categories — Communication, Productivity, Teamwork, Leadership, Technical Skills — applied uniformly across every employee, every time.",
  },
  {
    icon: Sparkles,
    color: "bg-amber-50 text-amber-600",
    title: "AI writes the coaching",
    body: "Submit ratings and Claude instantly generates a personalized summary: key strengths, growth areas, and a 90-day action plan tailored to each employee.",
  },
  {
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-600",
    title: "Progress is visible",
    body: "Both managers and employees see how scores trend across quarters — celebrating growth and identifying where coaching investment pays off.",
  },
  {
    icon: Shield,
    color: "bg-sky-50 text-sky-600",
    title: "Private and secure",
    body: "Employees only see their own reviews. Managers see only their team. Row-level security enforced at the database layer — not just the UI.",
  },
];

const FAQ = [
  {
    q: "How long does a performance review take?",
    a: "About 5 minutes. Rate each of 5 categories, add notes where helpful, and click submit. The AI coaching summary generates automatically on Pro.",
  },
  {
    q: "How do employees join?",
    a: "You get a 6-character join code when you create your account. Share it with your team via Slack, email, or any channel. They sign up and are instantly linked to your business.",
  },
  {
    q: "Is the AI summary automatic?",
    a: "Yes. On the Pro plan, Claude generates a personalized coaching summary every time you submit a review — no extra steps required. On Free, you can upgrade individual reviews.",
  },
  {
    q: "Can I export reviews as PDF?",
    a: "PDF export is on our roadmap for Month 1 (see below). We build the features our users actually need — tell us what matters most.",
  },
  {
    q: "Is my team's data secure?",
    a: "All data is stored in Supabase with row-level security. Employees can only see their own reviews. We never use your data to train AI models.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Yes. Plans are billed monthly (or annually). Cancel before your next billing date and you won't be charged. No questions asked.",
  },
];

const ROADMAP = [
  {
    month: "Month 1",
    date: "June 2026",
    color: "border-[#4f46e5] bg-[#4f46e5]",
    items: ["Slack notifications", "Review templates", "PDF export", "Mobile-optimized UI"],
  },
  {
    month: "Month 2",
    date: "July 2026",
    color: "border-amber-500 bg-amber-500",
    items: ["360° peer reviews", "Goals & OKR tracking", "Automated review reminders", "Calendar sync"],
  },
  {
    month: "Month 3",
    date: "August 2026",
    color: "border-emerald-500 bg-emerald-500",
    items: ["Analytics dashboard", "Multi-manager support", "Zapier + API access", "SSO / SAML"],
  },
];


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#4f46e5] rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Standpoint</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#roadmap" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Roadmap</a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold bg-[#4f46e5] text-white px-4 py-2 rounded-lg hover:bg-[#4338ca] transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-6 md:pt-28 md:pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#4f46e5] bg-[#4f46e5]/8 border border-[#4f46e5]/20 rounded-full px-3 py-1 mb-6">
            <Sparkles className="w-3 h-3" />
            Powered by Claude AI
          </div>
          <h1 className={`${serif.className} text-5xl md:text-6xl text-gray-900 leading-[1.1] mb-5`}>
            Performance reviews that{" "}
            <span className="text-[#4f46e5]">actually help people grow.</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto">
            Managers submit structured reviews in 5 minutes. Employees get a clear dashboard and an AI-generated coaching plan — personalized by Claude.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-[#4f46e5] text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-[#4338ca] transition-colors text-sm"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 text-gray-600 bg-gray-50 border border-gray-200 font-medium px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-colors text-sm"
            >
              Sign in to your account
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Free plan available · No credit card required · Setup in 5 minutes
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-indigo-100 max-w-4xl mx-auto mt-14">
          <HeroDemo />
        </div>
      </section>

      {/* ── Social proof strip ────────────────────────────────── */}
      <div className="border-y border-gray-100 bg-gray-50 py-5">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {["Next.js 14", "Supabase", "Stripe", "Claude AI", "TypeScript"].map((t) => (
            <span key={t} className="text-sm text-gray-400 font-medium">{t}</span>
          ))}
        </div>
      </div>

      {/* ── Pain ──────────────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className={`${serif.className} text-4xl md:text-5xl text-gray-900 mb-4`}>
            Performance reviews are broken.
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Most teams know it. Here&apos;s what keeps happening anyway.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PAIN_POINTS.map((p) => (
            <div key={p.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scroll demo ───────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-[#4f46e5] bg-[#4f46e5]/8 px-3 py-1 rounded-full mb-4">
              Product walkthrough
            </span>
            <h2 className={`${serif.className} text-4xl md:text-5xl text-gray-900 mb-4`}>
              Everything your team needs.
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              From first signup to AI-powered coaching — see every piece of the workflow.
            </p>
          </div>
          <ScrollDemo />
        </div>
      </section>

      {/* ── Value stack ───────────────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className={`${serif.className} text-4xl md:text-5xl text-gray-900 mb-4`}>
            Why Standpoint works.
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Four principles baked into every feature.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${v.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className={`${serif.className} text-4xl md:text-5xl text-gray-900 mb-4`}>
              Simple, honest pricing.
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              Start free. Upgrade when you&apos;re ready for AI coaching.
            </p>
                <PricingToggle />
          </div>
        </div>
      </section>

      {/* ── Roadmap ───────────────────────────────────────────── */}
      <section id="roadmap" className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold text-[#4f46e5] bg-[#4f46e5]/8 px-3 py-1 rounded-full mb-4">
            90-day roadmap
          </span>
          <h2 className={`${serif.className} text-4xl md:text-5xl text-gray-900 mb-4`}>
            What&apos;s coming next.
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            We ship fast. Here&apos;s what&apos;s on the board for the next three months.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {ROADMAP.map((phase) => (
            <div key={phase.month} className={`bg-white rounded-2xl border-2 ${phase.color.split(" ")[0]} p-6 shadow-sm`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-3 h-3 rounded-full ${phase.color.split(" ")[1]}`} />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{phase.month}</p>
                  <p className="text-xs text-gray-400">{phase.date}</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-8">
          Have a feature you need?{" "}
          <a href="mailto:hi@standpoint.co" className="text-[#4f46e5] hover:underline">
            Tell us.
          </a>
        </p>
      </section>

      {/* ── Objections / FAQ ──────────────────────────────────── */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className={`${serif.className} text-4xl md:text-5xl text-gray-900 mb-4`}>
              Questions we get a lot.
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details key={item.q} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none font-semibold text-gray-900 text-sm hover:bg-gray-50 transition-colors">
                  {item.q}
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="py-28 bg-[#4f46e5]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className={`${serif.className} text-4xl md:text-5xl text-white mb-5 leading-[1.15]`}>
            Give your team a clearer standpoint.
          </h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-lg mx-auto">
            Structured reviews. AI coaching. Employee transparency. Free to start in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#4f46e5] font-semibold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-colors text-sm"
            >
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 border border-indigo-400 text-indigo-100 font-medium px-8 py-4 rounded-xl hover:bg-indigo-500 transition-colors text-sm"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-5 text-indigo-300 text-xs">No credit card required · Cancel any time</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#4f46e5] rounded-md flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Standpoint</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-gray-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-600 transition-colors">Pricing</a>
            <a href="#roadmap" className="hover:text-gray-600 transition-colors">Roadmap</a>
            <a href="#faq" className="hover:text-gray-600 transition-colors">FAQ</a>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Standpoint
          </p>
        </div>
      </footer>
    </div>
  );
}

