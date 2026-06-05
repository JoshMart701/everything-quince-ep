"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── scene metadata ─────────────────────────────────────────── */
type Role = "manager" | "employee";
interface SceneMeta {
  label: string;
  role: Role;
  caption: string;
  url: string;
  duration: number;
}

const SCENES: SceneMeta[] = [
  {
    label: "Sign Up — 30 seconds",
    role: "manager",
    caption: "A business owner signs up in 30 seconds. Pick a role, enter a name and email — no credit card, no sales call.",
    url: "standpointapp.com/signup",
    duration: 5500,
  },
  {
    label: "Manager Dashboard",
    role: "manager",
    caption: "The manager dashboard shows every employee at a glance — overall score, last review, and one-click review buttons.",
    url: "standpointapp.com/dashboard",
    duration: 5000,
  },
  {
    label: "Submit a Review",
    role: "manager",
    caption: "Rate across 5 categories with stars. Takes under 3 minutes. Each rating auto-calculates a percentage and status.",
    url: "standpointapp.com/review/jorge-ramirez",
    duration: 6500,
  },
  {
    label: "AI Generates Summary",
    role: "manager",
    caption: "Hit submit and AI instantly writes a personalized coaching summary. The manager reviews it and sends — no writing required.",
    url: "standpointapp.com/review/submit",
    duration: 7000,
  },
  {
    label: "Employee Gets Notified",
    role: "employee",
    caption: "The employee gets a notification the moment the review is ready. Tap, log in, see scores — no waiting.",
    url: "standpointapp.com/login",
    duration: 5000,
  },
  {
    label: "Employee Dashboard",
    role: "employee",
    caption: "Jorge sees his overall standing, every category score, and his AI coaching summary. Clear. Honest.",
    url: "standpointapp.com/my-standing",
    duration: 5500,
  },
  {
    label: "Progress Over Time",
    role: "employee",
    caption: "Employees see every past review in one place — scores, trends, and whether they're improving.",
    url: "standpointapp.com/my-standing/history",
    duration: 5500,
  },
  {
    label: "Manager Team View",
    role: "manager",
    caption: "Managers see the whole team's performance at once — who's thriving, who needs attention, who's overdue.",
    url: "standpointapp.com/team",
    duration: 5000,
  },
];

/* ─── shared atoms ───────────────────────────────────────────── */
type BadgeVariant = "indigo" | "green" | "yellow" | "red" | "gray";

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: color, color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.35, fontWeight: 600, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function Badge({ text, variant }: { text: string; variant: BadgeVariant }) {
  const map: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
    indigo: { bg: "#eef2ff", color: "#4f46e5", border: "rgba(79,70,229,0.2)" },
    green:  { bg: "#ecfdf3", color: "#027a48", border: "transparent" },
    yellow: { bg: "#fffaeb", color: "#b54708", border: "transparent" },
    red:    { bg: "#fef3f2", color: "#b42318", border: "transparent" },
    gray:   { bg: "#f2f4f7", color: "#667085", border: "transparent" },
  };
  const s = map[variant];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center",
        borderRadius: 100, padding: "3px 10px",
        fontSize: 11, fontWeight: 600,
        background: s.bg, color: s.color,
        border: `1px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

/* ─── module-level static data (avoids closure deps) ─────────── */
const DASH_EMPLOYEES = [
  { init: "JR", name: "Jorge Ramirez",  role: "Kitchen Lead",    score: "76%", color: "#4f46e5", status: "Strong",     variant: "green"  as BadgeVariant, days: "12 days ago" },
  { init: "SL", name: "Sofia Lopez",    role: "Front of House",  score: "88%", color: "#7c3aed", status: "Strong",     variant: "green"  as BadgeVariant, days: "5 days ago"  },
  { init: "DM", name: "Diego Martinez", role: "Dishwasher",      score: "52%", color: "#f79009", status: "Developing", variant: "yellow" as BadgeVariant, days: "3 weeks ago" },
  { init: "AR", name: "Ana Reyes",      role: "Server",          score: "91%", color: "#12b76a", status: "Strong",     variant: "green"  as BadgeVariant, days: "2 days ago"  },
];

const REVIEW_CATS = [
  { icon: "⚡", name: "Performance",   stars: 4, pct: 80,  color: "#12b76a", status: "Strong",     variant: "green"  as BadgeVariant },
  { icon: "🤝", name: "Attitude",      stars: 5, pct: 100, color: "#12b76a", status: "Strong",     variant: "green"  as BadgeVariant },
  { icon: "🎯", name: "Reliability",   stars: 3, pct: 60,  color: "#f79009", status: "Developing", variant: "yellow" as BadgeVariant },
  { icon: "📈", name: "Growth",        stars: 4, pct: 80,  color: "#12b76a", status: "Strong",     variant: "green"  as BadgeVariant },
  { icon: "💬", name: "Communication", stars: 3, pct: 60,  color: "#f79009", status: "Developing", variant: "yellow" as BadgeVariant },
];

const AI_TEXT =
  "Jorge, your attitude is a genuine strength — the team notices. Your performance is solid. Focus on reliability this month: two late arrivals is holding back an otherwise excellent record. Stay consistent through June and you'll be in a strong position for that raise conversation.";

const SCORE_SUMMARY = [
  { name: "⚡ Performance",    pct: "80%",  color: "#12b76a" },
  { name: "🤝 Attitude",       pct: "100%", color: "#12b76a" },
  { name: "🎯 Reliability",    pct: "60%",  color: "#f79009" },
  { name: "📈 Growth",         pct: "80%",  color: "#12b76a" },
  { name: "💬 Communication",  pct: "60%",  color: "#f79009" },
];

const HIST_SCORES = [58, 63, 68, 72, 76];
const HIST_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May"];
const HIST_ROWS = [
  { date: "May 27, 2026", score: "76%", variant: "green"  as BadgeVariant, status: "Strong"     },
  { date: "Apr 15, 2026", score: "72%", variant: "green"  as BadgeVariant, status: "Strong"     },
  { date: "Mar 2, 2026",  score: "68%", variant: "green"  as BadgeVariant, status: "Strong"     },
  { date: "Feb 10, 2026", score: "63%", variant: "yellow" as BadgeVariant, status: "Developing" },
  { date: "Jan 8, 2026",  score: "58%", variant: "yellow" as BadgeVariant, status: "Developing" },
];

const TEAM_ROWS = [
  { init: "AR", name: "Ana Reyes",      role: "Server",          score: 91, color: "#12b76a", trend: "+3%", trendPos: true },
  { init: "SL", name: "Sofia Lopez",    role: "Front of House",  score: 88, color: "#7c3aed", trend: "+5%", trendPos: true },
  { init: "JR", name: "Jorge Ramirez",  role: "Kitchen Lead",    score: 76, color: "#4f46e5", trend: "+4%", trendPos: true },
  { init: "DM", name: "Diego Martinez", role: "Dishwasher",      score: 52, color: "#f79009", trend: "-2%", trendPos: false },
];

/* ─── scene 0: signup ────────────────────────────────────────── */
function Scene0Signup() {
  const [biz, setBiz]       = useState("");
  const [email, setEmail]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [btnOn, setBtnOn]   = useState(false);
  const [focus, setFocus]   = useState<"biz" | "email" | null>(null);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[]   = [];
    const ivs: ReturnType<typeof setInterval>[] = [];

    const BIZ   = "Maria's Cantina";
    const EMAIL = "maria@mariacantina.com";

    const t1 = setTimeout(() => {
      setFocus("biz");
      let i = 0;
      const iv1 = setInterval(() => {
        setBiz(BIZ.slice(0, ++i));
        if (i >= BIZ.length) {
          clearInterval(iv1);
          setFocus(null);
          const t2 = setTimeout(() => {
            setFocus("email");
            let j = 0;
            const iv2 = setInterval(() => {
              setEmail(EMAIL.slice(0, ++j));
              if (j >= EMAIL.length) {
                clearInterval(iv2);
                setFocus(null);
                setShowPass(true);
                const t3 = setTimeout(() => setBtnOn(true), 400);
                ts.push(t3);
              }
            }, 55);
            ivs.push(iv2);
          }, 300);
          ts.push(t2);
        }
      }, 75);
      ivs.push(iv1);
    }, 700);
    ts.push(t1);

    return () => { ts.forEach(clearTimeout); ivs.forEach(clearInterval); };
  }, []);

  const field = (focused: boolean): React.CSSProperties => ({
    border: `1px solid ${focused ? "#4f46e5" : "#e4e7ec"}`,
    borderRadius: 8, padding: "10px 14px", fontSize: 13,
    background: "white", marginBottom: 10, color: "#101828",
    boxShadow: focused ? "0 0 0 3px #eef2ff" : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    minHeight: 40, display: "flex", alignItems: "center",
  });

  return (
    <div style={{ padding: "32px 40px", background: "#f8f9fb" }}>
      <div style={{ maxWidth: 300, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: "#101828", marginBottom: 3 }}>
            Stand<span style={{ color: "#4f46e5" }}>point</span>
          </div>
          <div style={{ fontSize: 12, color: "#98a2b3" }}>Know where every employee stands.</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 500, color: "#344054", marginBottom: 8 }}>I am a...</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div style={{ border: "2px solid #4f46e5", borderRadius: 10, padding: "13px 8px", textAlign: "center", background: "#eef2ff" }}>
            <div style={{ fontSize: 20, marginBottom: 5 }}>👔</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#4f46e5" }}>Manager / Owner</div>
          </div>
          <div style={{ border: "2px solid #e4e7ec", borderRadius: 10, padding: "13px 8px", textAlign: "center", background: "white" }}>
            <div style={{ fontSize: 20, marginBottom: 5 }}>👤</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#667085" }}>Employee</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 500, color: "#344054", marginBottom: 5 }}>Business name</div>
        <div style={field(focus === "biz")}>
          {biz || <span style={{ color: "#d0d5dd" }}>Your business name</span>}
        </div>

        <div style={{ fontSize: 11, fontWeight: 500, color: "#344054", marginBottom: 5 }}>Work email</div>
        <div style={field(focus === "email")}>
          {email || <span style={{ color: "#d0d5dd" }}>you@yourbusiness.com</span>}
        </div>

        <div style={{ fontSize: 11, fontWeight: 500, color: "#344054", marginBottom: 5, opacity: showPass ? 1 : 0, transition: "opacity 0.3s" }}>
          Password
        </div>
        <div style={{ ...field(false), opacity: showPass ? 1 : 0, transition: "all 0.3s", letterSpacing: 3, color: "#667085" }}>
          ••••••••
        </div>

        <button
          style={{
            background: btnOn ? "#4f46e5" : "#c7d2fe",
            color: "white", border: "none", borderRadius: 8,
            fontSize: 13, fontWeight: 500, padding: "11px 20px",
            width: "100%", transition: "background 0.4s", fontFamily: "inherit", marginTop: 4,
          }}
        >
          Create free account →
        </button>
        <div style={{ textAlign: "center", fontSize: 11, color: "#98a2b3", marginTop: 10 }}>
          No credit card · 14-day free trial
        </div>
      </div>
    </div>
  );
}

/* ─── scene 1: manager dashboard ─────────────────────────────── */
function Scene1Dashboard() {
  const [vis, setVis] = useState([false, false, false, false]);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    DASH_EMPLOYEES.forEach((_, i) => {
      const t = setTimeout(
        () => setVis(p => { const n = [...p]; n[i] = true; return n; }),
        300 + i * 110,
      );
      ts.push(t);
    });
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ padding: "22px 26px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: "#98a2b3", marginBottom: 2 }}>Good morning</div>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, letterSpacing: "-0.4px", color: "#101828" }}>
            Hey, <em style={{ color: "#4f46e5" }}>Maria</em> 👋
          </div>
        </div>
        <button style={{ background: "#4f46e5", color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, padding: "9px 16px", fontFamily: "inherit" }}>
          + New Review
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "#f8f9fb", border: "1px solid #e4e7ec", borderRadius: 10, padding: 14 }}>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: "#101828", letterSpacing: "-1px" }}>4</div>
          <div style={{ fontSize: 11, color: "#98a2b3" }}>Employees</div>
        </div>
        <div style={{ background: "#f8f9fb", border: "1px solid #e4e7ec", borderRadius: 10, padding: 14 }}>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: "#12b76a", letterSpacing: "-1px" }}>77%</div>
          <div style={{ fontSize: 11, color: "#98a2b3" }}>Avg score</div>
        </div>
        <div style={{ background: "#fff8f0", border: "1px solid rgba(247,144,9,0.2)", borderRadius: 10, padding: 14 }}>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: "#f79009", letterSpacing: "-1px" }}>1</div>
          <div style={{ fontSize: 11, color: "#98a2b3" }}>Due for review</div>
        </div>
      </div>

      <div style={{ border: "1px solid #e4e7ec", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "9px 16px", background: "#f8f9fb", borderBottom: "1px solid #e4e7ec" }}>
          {["Employee","Score","Status","Action"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.5px", color: "#98a2b3" }}>{h}</span>
          ))}
        </div>
        {DASH_EMPLOYEES.map((e, i) => (
          <div
            key={e.name}
            style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
              padding: "12px 16px",
              borderBottom: i < DASH_EMPLOYEES.length - 1 ? "1px solid #f2f4f7" : "none",
              alignItems: "center",
              opacity: vis[i] ? 1 : 0,
              transform: vis[i] ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.35s, transform 0.35s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={e.init} color={e.color} size={30} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>{e.name}</div>
                <div style={{ fontSize: 11, color: "#98a2b3" }}>{e.role} · {e.days}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#101828", fontFamily: "monospace" }}>{e.score}</div>
            <div><Badge text={e.status} variant={e.variant} /></div>
            <div>
              <button style={{ fontSize: 11, fontWeight: 600, color: "#4f46e5", background: "#eef2ff", border: "1px solid rgba(79,70,229,0.2)", borderRadius: 6, padding: "4px 10px", fontFamily: "inherit" }}>
                Review →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── scene 2: submit review ─────────────────────────────────── */
function Scene2Review() {
  const [anim, setAnim] = useState([false, false, false, false, false]);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    REVIEW_CATS.forEach((_, i) => {
      const t = setTimeout(
        () => setAnim(p => { const n = [...p]; n[i] = true; return n; }),
        400 + i * 600,
      );
      ts.push(t);
    });
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ padding: "22px 30px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: "1px solid #e4e7ec" }}>
        <Avatar initials="JR" color="#4f46e5" size={40} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>Jorge Ramirez</div>
          <div style={{ fontSize: 12, color: "#98a2b3" }}>Kitchen Lead · Review #3 · May 2026</div>
        </div>
        <div style={{ marginLeft: "auto" }}><Badge text="In progress" variant="indigo" /></div>
      </div>

      {REVIEW_CATS.map((c, i) => (
        <div key={c.name} style={{ marginBottom: 15 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#344054" }}>{c.icon} {c.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ fontSize: 16, color: s <= c.stars ? "#f79009" : "#e4e7ec" }}>★</span>
                ))}
              </div>
              <div style={{ opacity: anim[i] ? 1 : 0, transition: "opacity 0.3s 0.3s" }}>
                <Badge text={c.status} variant={c.variant} />
              </div>
            </div>
          </div>
          <div style={{ height: 5, background: "#e4e7ec", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: c.color, borderRadius: 3,
              width: anim[i] ? `${c.pct}%` : "0%",
              transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
            }} />
          </div>
        </div>
      ))}

      <button style={{ background: "#4f46e5", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, padding: "11px 20px", width: "100%", marginTop: 6, fontFamily: "inherit" }}>
        Generate AI Summary & Submit →
      </button>
    </div>
  );
}

/* ─── scene 3: ai summary ────────────────────────────────────── */
function Scene3AI() {
  const [typed, setTyped]           = useState("");
  const [spinning, setSpinning]     = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[]   = [];
    const ivs: ReturnType<typeof setInterval>[] = [];

    const t1 = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        setTyped(AI_TEXT.slice(0, ++i));
        if (i >= AI_TEXT.length) {
          clearInterval(iv);
          setSpinning(false);
          const t2 = setTimeout(() => setShowConfirm(true), 600);
          ts.push(t2);
        }
      }, 8);
      ivs.push(iv);
    }, 800);
    ts.push(t1);

    return () => { ts.forEach(clearTimeout); ivs.forEach(clearInterval); };
  }, []);

  return (
    <div style={{ padding: "24px 30px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Avatar initials="JR" color="#4f46e5" size={38} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>Jorge Ramirez</div>
          <div style={{ fontSize: 12, color: "#98a2b3" }}>Review submitted · Generating summary...</div>
        </div>
      </div>

      <div style={{ border: "1px solid #e4e7ec", borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          {spinning && (
            <div
              className="animate-spin"
              style={{ width: 18, height: 18, border: "2px solid #eef2ff", borderTopColor: "#4f46e5", borderRadius: "50%", flexShrink: 0 }}
            />
          )}
          <div style={{ fontSize: 11, fontWeight: 600, color: "#4f46e5", letterSpacing: "0.5px", textTransform: "uppercase" as const }}>
            AI Coach — Writing summary
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#344054", lineHeight: 1.75, minHeight: 56 }}>
          {typed}
          {typed.length < AI_TEXT.length && (
            <span style={{ display: "inline-block", width: 2, height: 14, background: "#4f46e5", borderRadius: 1, marginLeft: 2, verticalAlign: "middle" }} />
          )}
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "#ecfdf3", border: "1px solid rgba(18,183,106,0.25)",
        borderRadius: 10, padding: 14, marginBottom: 14,
        opacity: showConfirm ? 1 : 0,
        transform: showConfirm ? "translateY(0)" : "translateY(8px)",
        transition: "all 0.5s",
      }}>
        <div style={{ fontSize: 20 }}>✅</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#027a48" }}>Review sent to Jorge</div>
          <div style={{ fontSize: 12, color: "#6ce9a6" }}>He&apos;ll see it the moment he logs in</div>
        </div>
      </div>

      <div style={{ border: "1px solid #e4e7ec", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "9px 16px", background: "#f8f9fb", borderBottom: "1px solid #e4e7ec", fontSize: 10, fontWeight: 600, color: "#98a2b3", textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>
          Score summary
        </div>
        {SCORE_SUMMARY.map(s => (
          <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 16px", borderBottom: "1px solid #f2f4f7" }}>
            <span style={{ fontSize: 13, color: "#344054" }}>{s.name}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: s.color, fontFamily: "monospace" }}>{s.pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── scene 4: employee notified ─────────────────────────────── */
function Scene4Notify() {
  const [showNotif, setShowNotif] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    ts.push(setTimeout(() => setShowNotif(true), 400));
    ts.push(setTimeout(() => setShowLogin(true), 1200));
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ padding: "32px 40px", textAlign: "center", background: "#f8f9fb" }}>
      <div style={{ fontSize: 11, color: "#98a2b3", marginBottom: 18, fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase" as const }}>
        Jorge&apos;s Phone — 9:42 PM
      </div>

      <div
        style={{
          background: "#1c1c1e", borderRadius: 14, padding: "14px 18px",
          display: "flex", alignItems: "flex-start", gap: 12,
          textAlign: "left", maxWidth: 300, margin: "0 auto 20px",
          opacity: showNotif ? 1 : 0,
          transform: showNotif ? "translateY(0)" : "translateY(-10px)",
          transition: "all 0.5s",
        }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #4f46e5, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
          S
        </div>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>STANDPOINT</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>Your review is ready 📋</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2, lineHeight: 1.4 }}>
            Maria submitted your May performance review. Tap to see your scores.
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>now</div>
        </div>
      </div>

      <div
        style={{
          background: "white", border: "1px solid #e4e7ec", borderRadius: 14,
          padding: 24, maxWidth: 300, margin: "0 auto",
          boxShadow: "0 4px 24px rgba(16,24,40,0.08)",
          textAlign: "left",
          opacity: showLogin ? 1 : 0,
          transform: showLogin ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s",
        }}
      >
        <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 19, color: "#101828", marginBottom: 3, letterSpacing: "-0.3px" }}>
          Welcome back, Jorge
        </div>
        <div style={{ fontSize: 13, color: "#98a2b3", marginBottom: 18 }}>Sign in to see your standing</div>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#344054", marginBottom: 5 }}>Email</div>
        <div style={{ border: "1px solid #e4e7ec", borderRadius: 8, padding: "9px 13px", fontSize: 13, color: "#667085", marginBottom: 10 }}>
          jorge@email.com
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#344054", marginBottom: 5 }}>Password</div>
        <div style={{ border: "1px solid #e4e7ec", borderRadius: 8, padding: "9px 13px", fontSize: 13, color: "#101828", marginBottom: 14, letterSpacing: 3 }}>
          ••••••••
        </div>
        <button style={{ background: "#4f46e5", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, padding: "11px 20px", width: "100%", fontFamily: "inherit" }}>
          View my standing →
        </button>
      </div>
    </div>
  );
}

/* ─── scene 5: employee dashboard ────────────────────────────── */
const EMP_CATS = [
  { icon: "⚡", name: "Performance",   pct: 80,  color: "#12b76a" },
  { icon: "🤝", name: "Attitude",      pct: 100, color: "#12b76a" },
  { icon: "🎯", name: "Reliability",   pct: 60,  color: "#f79009" },
  { icon: "💬", name: "Communication", pct: 60,  color: "#f79009" },
];

function Scene5EmpDash() {
  const [showScore, setShowScore] = useState(false);
  const [barWidths, setBarWidths] = useState([0, 0, 0, 0]);
  const [showAI, setShowAI]       = useState(false);

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    ts.push(setTimeout(() => {
      setShowScore(true);
      setBarWidths(EMP_CATS.map(c => c.pct));
    }, 400));
    ts.push(setTimeout(() => setShowAI(true), 700));
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ padding: "22px 26px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, letterSpacing: "-0.3px", color: "#101828" }}>Your Standing</div>
          <div style={{ fontSize: 11, color: "#98a2b3", marginTop: 2 }}>Reviewed May 27, 2026 · Maria&apos;s Cantina</div>
        </div>
        <Badge text="↑ Improving" variant="green" />
      </div>

      {/* Overall hero */}
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)", borderRadius: 12, padding: 20, color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>Overall score</div>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 50, letterSpacing: "-2px", lineHeight: 1, opacity: showScore ? 1 : 0, transition: "opacity 0.5s" }}>
            76%
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: "rgba(255,255,255,0.2)", color: "white", borderRadius: 100, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>Strong</span>
            <span style={{ fontSize: 12, opacity: 0.75 }}>↑ +4% from last review</span>
          </div>
        </div>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⭐</div>
      </div>

      {/* Category grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {EMP_CATS.map((c, i) => (
          <div key={c.name} style={{ background: "#f8f9fb", border: "1px solid #e4e7ec", borderRadius: 10, padding: 13 }}>
            <div style={{ fontSize: 11, color: "#98a2b3", fontWeight: 500, marginBottom: 5 }}>{c.icon} {c.name}</div>
            <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: "#101828", marginBottom: 6, letterSpacing: "-0.5px" }}>{c.pct}%</div>
            <div style={{ height: 4, background: "#e4e7ec", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: c.color, borderRadius: 2, width: `${barWidths[i]}%`, transition: `width 0.8s cubic-bezier(.4,0,.2,1) ${i * 0.08}s` }} />
            </div>
          </div>
        ))}
      </div>

      {/* AI coach */}
      <div style={{ background: "white", border: "1px solid #e4e7ec", borderRadius: 12, padding: 18, boxShadow: "0 1px 4px rgba(16,24,40,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f46e5", animation: "heroPulse 2s infinite" }} />
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const, color: "#98a2b3" }}>AI Coach Summary</div>
        </div>
        <div style={{ fontSize: 13, color: "#344054", lineHeight: 1.75, opacity: showAI ? 1 : 0, transition: "opacity 0.6s" }}>
          Jorge, your attitude is a genuine strength. Your performance is solid. Focus on reliability this month — consistency is the last step to being your best.
        </div>
      </div>
    </div>
  );
}

/* ─── scene 6: history ───────────────────────────────────────── */
function Scene6History() {
  const MAX_H = 96;
  const [barHeights, setBarHeights] = useState(HIST_SCORES.map(() => 0));
  const [rowVis, setRowVis]         = useState(HIST_ROWS.map(() => false));

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    const t1 = setTimeout(() => {
      setBarHeights(HIST_SCORES.map(s => (s / 100) * MAX_H));
      HIST_ROWS.forEach((_, i) => {
        const t = setTimeout(
          () => setRowVis(p => { const n = [...p]; n[i] = true; return n; }),
          i * 80,
        );
        ts.push(t);
      });
    }, 300);
    ts.push(t1);
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ padding: "22px 26px" }}>
      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: "#101828", marginBottom: 18, letterSpacing: "-0.3px" }}>Your Progress</div>

      {/* Chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: MAX_H + 24, marginBottom: 6, padding: "0 4px" }}>
        {HIST_SCORES.map((score, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#344054" }}>{score}%</div>
            <div style={{
              width: "100%", borderRadius: "4px 4px 0 0",
              background: "linear-gradient(180deg, #818cf8, #4f46e5)",
              height: barHeights[i],
              minHeight: 4,
              transition: `height 0.7s cubic-bezier(.4,0,.2,1) ${i * 0.1}s`,
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, padding: "0 4px", marginBottom: 18 }}>
        {HIST_MONTHS.map(m => (
          <div key={m} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#c8cdd6", fontFamily: "monospace" }}>{m}</div>
        ))}
      </div>

      {/* History list */}
      <div style={{ fontSize: 12, fontWeight: 600, color: "#344054", marginBottom: 8 }}>All Reviews</div>
      <div style={{ border: "1px solid #e4e7ec", borderRadius: 10, overflow: "hidden" }}>
        {HIST_ROWS.map((r, i) => (
          <div
            key={r.date}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px",
              borderBottom: i < HIST_ROWS.length - 1 ? "1px solid #f2f4f7" : "none",
              opacity: rowVis[i] ? 1 : 0,
              transform: rowVis[i] ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.35s, transform 0.35s",
            }}
          >
            <div style={{ fontSize: 13, color: "#344054", fontWeight: 500 }}>{r.date}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#101828", fontFamily: "monospace" }}>{r.score}</div>
              <Badge text={r.status} variant={r.variant} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── scene 7: team overview ─────────────────────────────────── */
function Scene7Team() {
  const [rowVis, setRowVis]   = useState(TEAM_ROWS.map(() => false));
  const [barWidths, setBarWidths] = useState(TEAM_ROWS.map(() => 0));

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    const t1 = setTimeout(() => {
      setBarWidths(TEAM_ROWS.map(r => r.score));
      TEAM_ROWS.forEach((_, i) => {
        const t = setTimeout(
          () => setRowVis(p => { const n = [...p]; n[i] = true; return n; }),
          i * 110,
        );
        ts.push(t);
      });
    }, 300);
    ts.push(t1);
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ padding: "22px 26px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: "#101828", letterSpacing: "-0.3px" }}>Team Performance</div>
        <Badge text="May 2026" variant="indigo" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "#f8f9fb", border: "1px solid #e4e7ec", borderRadius: 10, padding: 14 }}>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: "#12b76a", letterSpacing: "-1px" }}>77%</div>
          <div style={{ fontSize: 11, color: "#98a2b3" }}>Team avg</div>
        </div>
        <div style={{ background: "#f8f9fb", border: "1px solid #e4e7ec", borderRadius: 10, padding: 14 }}>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: "#101828", letterSpacing: "-1px" }}>4</div>
          <div style={{ fontSize: 11, color: "#98a2b3" }}>Active</div>
        </div>
        <div style={{ background: "#fff8f0", border: "1px solid rgba(247,144,9,0.2)", borderRadius: 10, padding: 14 }}>
          <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: "#f79009", letterSpacing: "-1px" }}>1</div>
          <div style={{ fontSize: 11, color: "#98a2b3" }}>Needs attention</div>
        </div>
      </div>

      <div style={{ border: "1px solid #e4e7ec", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 80px", padding: "9px 16px", background: "#f8f9fb", borderBottom: "1px solid #e4e7ec" }}>
          {["Employee","Score","Trend","Action"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.5px", color: "#98a2b3" }}>{h}</span>
          ))}
        </div>
        {TEAM_ROWS.map((e, i) => (
          <div
            key={e.name}
            style={{
              display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 80px",
              padding: "12px 16px",
              borderBottom: i < TEAM_ROWS.length - 1 ? "1px solid #f2f4f7" : "none",
              alignItems: "center",
              opacity: rowVis[i] ? 1 : 0,
              transform: rowVis[i] ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.35s, transform 0.35s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={e.init} color={e.color} size={28} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>{e.name}</div>
                <div style={{ fontSize: 11, color: "#98a2b3" }}>{e.role}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#101828", fontFamily: "monospace", marginBottom: 4 }}>{e.score}%</div>
              <div style={{ height: 4, background: "#e4e7ec", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", background: e.color, borderRadius: 2, width: `${barWidths[i]}%`, transition: `width 0.8s cubic-bezier(.4,0,.2,1) ${0.4 + i * 0.1}s` }} />
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: e.trendPos ? "#027a48" : "#b42318" }}>{e.trend}</div>
            <div>
              <button style={{ fontSize: 11, fontWeight: 600, color: "#4f46e5", background: "#eef2ff", border: "1px solid rgba(79,70,229,0.2)", borderRadius: 6, padding: "4px 10px", fontFamily: "inherit" }}>
                Review
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fef3f2", border: "1px solid rgba(240,68,56,0.2)", borderRadius: 10, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 18 }}>⚠️</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#b42318" }}>Diego Martinez needs attention</div>
          <div style={{ fontSize: 12, color: "#f97066", marginTop: 1 }}>Score dropped 2% — last reviewed 3 weeks ago</div>
        </div>
        <button style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "#4f46e5", background: "#eef2ff", border: "1px solid rgba(79,70,229,0.2)", borderRadius: 6, padding: "4px 10px", whiteSpace: "nowrap", fontFamily: "inherit" }}>
          Review now
        </button>
      </div>
    </div>
  );
}

/* ─── scene component map ────────────────────────────────────── */
const SCENE_COMPONENTS = [
  Scene0Signup,
  Scene1Dashboard,
  Scene2Review,
  Scene3AI,
  Scene4Notify,
  Scene5EmpDash,
  Scene6History,
  Scene7Team,
] as const;

/* ─── main component ─────────────────────────────────────────── */
export function HeroDemo() {
  const [idx, setIdx] = useState(0);

  // Auto-advance
  useEffect(() => {
    const t = setTimeout(
      () => setIdx(i => (i + 1) % SCENES.length),
      SCENES[idx].duration,
    );
    return () => clearTimeout(t);
  }, [idx]);

  const scene = SCENES[idx];
  const SceneComp = SCENE_COMPONENTS[idx];

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{ height: 580, background: "#060608", fontFamily: "var(--font-geist, system-ui, sans-serif)" }}
    >
      {/* keyframes injected once */}
      <style>{`
        @keyframes heroPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.5}}
      `}</style>

      {/* ambient gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 50%,rgba(79,70,229,.12) 0%,transparent 60%)," +
            "radial-gradient(ellipse 60% 60% at 80% 50%,rgba(18,183,106,.07) 0%,transparent 60%)",
        }}
      />

      {/* ── topbar ── */}
      <div
        className="relative z-10 flex-shrink-0 flex items-center justify-between px-7"
        style={{ height: 48, borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(6,6,8,.85)", backdropFilter: "blur(12px)" }}
      >
        <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 17, color: "#fff" }}>
          Stand<span style={{ color: "#818cf8" }}>point</span>
        </div>
        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,.35)", fontFamily: "monospace" }}>
          {idx + 1} of {SCENES.length} — {scene.label}
        </div>
      </div>

      {/* ── progress rail ── */}
      <div className="relative flex-shrink-0" style={{ height: 3, background: "rgba(255,255,255,.06)" }}>
        <motion.div
          key={idx}
          className="absolute top-0 left-0 h-full"
          style={{ background: "linear-gradient(90deg,#4f46e5,#818cf8)", boxShadow: "0 0 8px rgba(129,140,248,.6)" }}
          initial={{ width: `${(idx / SCENES.length) * 100}%` }}
          animate={{ width: `${((idx + 1) / SCENES.length) * 100}%` }}
          transition={{ duration: scene.duration / 1000, ease: "linear" }}
        />
      </div>

      {/* ── stage ── */}
      <div className="flex-1 flex items-center justify-center relative px-8 pt-4 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            style={{
              width: "100%", maxWidth: 640,
              borderRadius: 14, overflow: "hidden",
              background: "white",
              boxShadow: "0 24px 80px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.06)",
            }}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {/* browser chrome */}
            <div
              className="sticky top-0 z-10 flex items-center gap-2 px-4"
              style={{ height: 40, background: "#f8f9fb", borderBottom: "1px solid #e4e7ec" }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
              <div
                className="flex-1 mx-3 overflow-hidden whitespace-nowrap text-ellipsis"
                style={{ background: "white", border: "1px solid #e4e7ec", borderRadius: 6, padding: "3px 10px", fontSize: 10, color: "#98a2b3", fontFamily: "monospace" }}
              >
                {scene.url}
              </div>
            </div>

            {/* scene content — scrollable */}
            <div style={{ maxHeight: 360, overflowY: "auto", scrollbarWidth: "none" }}>
              <SceneComp />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── caption ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none px-4" style={{ minWidth: 300, maxWidth: 500 }}>
        <div
          className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
          style={{ fontFamily: "monospace", color: scene.role === "manager" ? "#818cf8" : "#34d399" }}
        >
          {scene.role === "manager" ? "👔 Manager View" : "👤 Employee View"}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            className="text-[13px] leading-relaxed"
            style={{ color: "rgba(255,255,255,.72)" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
          >
            {scene.caption}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── scene dots ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SCENES.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === idx ? 24 : 6,
              background:
                i === idx ? "#818cf8"
                : i < idx  ? "rgba(129,140,248,.5)"
                :            "rgba(255,255,255,.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
