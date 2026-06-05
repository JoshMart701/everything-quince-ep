// ─────────────────────────────────────────────────────────────────
// STANDPOINT — Review Email Template
// File: emails/review-email.tsx
// Stack: React Email + Resend
//
// SETUP INSTRUCTIONS:
// 1. npm install resend @react-email/components
// 2. Add RESEND_API_KEY=your_key to .env.local
// 3. Copy this file to /emails/review-email.tsx
// 4. Copy the API route below to /app/api/send-review-email/route.ts
// ─────────────────────────────────────────────────────────────────

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Font,
} from "@react-email/components";
import * as React from "react";

// ── TYPES ──────────────────────────────────────────────────────────
interface CategoryScore {
  name: string;
  icon: string;
  stars: number;
  percentage: number;
  status: "strong" | "developing" | "needs_work";
  notes?: string;
}

interface ReviewEmailProps {
  employeeName: string;
  managerName: string;
  businessName: string;
  reviewMonth: string; // e.g. "May 2026"
  overallScore: number; // 0-100
  overallStatus: "strong" | "developing" | "needs_work";
  categories: CategoryScore[];
  aiSummary: string;
  dashboardUrl: string;
}

// ── HELPERS ────────────────────────────────────────────────────────
function getStatusLabel(status: ReviewEmailProps["overallStatus"]) {
  return { strong: "Strong", developing: "Developing", needs_work: "Needs Work" }[status];
}

function getStatusColors(status: ReviewEmailProps["overallStatus"]) {
  return {
    strong:      { bg: "#ecfdf3", text: "#027a48", bar: "#12b76a", border: "#a9efc5" },
    developing:  { bg: "#fffaeb", text: "#b54708", bar: "#f79009", border: "#fedf89" },
    needs_work:  { bg: "#fef3f2", text: "#b42318", bar: "#f04438", border: "#fecdca" },
  }[status];
}

function getOverallGradient(status: ReviewEmailProps["overallStatus"]) {
  return {
    strong:     "linear-gradient(135deg, #12b76a 0%, #027a48 100%)",
    developing: "linear-gradient(135deg, #f79009 0%, #b54708 100%)",
    needs_work: "linear-gradient(135deg, #f04438 0%, #b42318 100%)",
  }[status];
}

function renderStars(stars: number) {
  return [1, 2, 3, 4, 5]
    .map((s) => (s <= stars ? "★" : "☆"))
    .join("");
}

// ── EMAIL COMPONENT ────────────────────────────────────────────────
export default function ReviewEmail({
  employeeName = "Alex Johnson",
  managerName = "Jordan",
  businessName = "Ridge & Vine Restaurant",
  reviewMonth = "May 2026",
  overallScore = 82,
  overallStatus = "strong",
  categories = [
    { name: "Performance",    icon: "⚡", stars: 4, percentage: 80, status: "strong",     notes: "Consistently hits targets" },
    { name: "Attitude",       icon: "🤝", stars: 5, percentage: 100, status: "strong",    notes: "Great energy every shift" },
    { name: "Reliability",    icon: "🎯", stars: 3, percentage: 60, status: "developing", notes: "Late twice this month" },
    { name: "Growth",         icon: "📈", stars: 4, percentage: 80, status: "strong",     notes: "" },
    { name: "Communication",  icon: "💬", stars: 3, percentage: 60, status: "developing", notes: "" },
  ],
  aiSummary = "Alex, your attitude and performance are genuinely standout — you bring great energy every shift and your work quality is consistent. Focus on reliability this month: staying consistent with your schedule is the one thing that will move you from good to excellent. Keep building on your strengths and you'll be in a strong position for your next review.",
  dashboardUrl = "https://standpointapp.com/my-standing",
}: ReviewEmailProps) {
  const overallGradient = getOverallGradient(overallStatus);
  const firstName = employeeName.split(" ")[0];

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Geist"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/geist/v1/gyBhhwUxId8gMEwcGFWNOITddY.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>
        {managerName} submitted your {reviewMonth} performance review — your overall score is {String(overallScore)}%
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* ── HEADER ── */}
          <Section style={styles.header}>
            <Text style={styles.logo}>
              Stand<span style={{ color: "#4f46e5" }}>point</span>
            </Text>
            <Text style={styles.headerSub}>Performance review ready</Text>
          </Section>

          {/* ── GREETING ── */}
          <Section style={styles.section}>
            <Heading style={styles.greeting}>Hi {firstName}, 👋</Heading>
            <Text style={styles.greetingBody}>
              <strong>{managerName}</strong> at <strong>{businessName}</strong> just submitted your{" "}
              <strong>{reviewMonth}</strong> performance review. Here&apos;s a full breakdown of where you stand.
            </Text>
          </Section>

          {/* ── OVERALL SCORE HERO ── */}
          <Section style={{ ...styles.section, padding: "0 32px 24px" }}>
            <div style={{
              background: overallGradient,
              borderRadius: "14px",
              padding: "32px",
              textAlign: "center" as const,
            }}>
              <Text style={styles.overallLabel}>Overall Score</Text>
              <Text style={styles.overallScore}>{overallScore}%</Text>
              <div style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "100px",
                padding: "5px 18px",
                marginTop: "4px",
              }}>
                <Text style={styles.overallBadge}>{getStatusLabel(overallStatus)}</Text>
              </div>
            </div>
          </Section>

          <Hr style={styles.divider} />

          {/* ── CATEGORY BREAKDOWN ── */}
          <Section style={styles.section}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>

            {categories.map((cat) => {
              const colors = getStatusColors(cat.status);
              return (
                <div key={cat.name} style={styles.catRow}>
                  <Row>
                    <Column style={{ width: "52%" }}>
                      <Text style={styles.catName}>
                        {cat.icon} {cat.name}
                      </Text>
                      <Text style={styles.catStars}>{renderStars(cat.stars)}</Text>
                      {cat.notes ? (
                        <Text style={styles.catNote}>{'"'}{cat.notes}{'"'}</Text>
                      ) : null}
                    </Column>
                    <Column style={{ width: "48%", textAlign: "right" as const, verticalAlign: "top" }}>
                      <Text style={{ ...styles.catPct, color: colors.bar }}>
                        {cat.percentage}%
                      </Text>
                      <div style={{
                        display: "inline-block",
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "100px",
                        padding: "2px 10px",
                      }}>
                        <Text style={{ ...styles.catBadge, color: colors.text }}>
                          {getStatusLabel(cat.status)}
                        </Text>
                      </div>
                    </Column>
                  </Row>
                  {/* Progress bar */}
                  <div style={styles.barTrack}>
                    <div style={{
                      ...styles.barFill,
                      width: `${cat.percentage}%`,
                      background: colors.bar,
                    }} />
                  </div>
                </div>
              );
            })}
          </Section>

          <Hr style={styles.divider} />

          {/* ── AI SUMMARY ── */}
          <Section style={styles.section}>
            <Text style={styles.sectionTitle}>
              <span style={{ color: "#4f46e5" }}>●</span> AI Coach Summary
            </Text>
            <div style={styles.summaryBox}>
              <Text style={styles.summaryText}>{aiSummary}</Text>
            </div>
          </Section>

          <Hr style={styles.divider} />

          {/* ── CTA ── */}
          <Section style={{ ...styles.section, textAlign: "center" as const }}>
            <Text style={styles.ctaHeading}>See your full dashboard</Text>
            <Text style={styles.ctaBody}>
              Log in to view your complete history, track your progress over time, and see how your scores are trending.
            </Text>
            <Button style={styles.ctaButton} href={dashboardUrl}>
              View my standing →
            </Button>
            <Text style={styles.ctaTrust}>
              Takes 30 seconds · Works on your phone
            </Text>
          </Section>

          {/* ── FOOTER ── */}
          <Section style={styles.footer}>
            <Text style={styles.footerLogo}>
              Stand<span style={{ color: "#4f46e5" }}>point</span>
            </Text>
            <Text style={styles.footerText}>
              You received this because you have a Standpoint account at {businessName}.
              <br />
              This review was submitted by {managerName} on{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              .
            </Text>
            <Text style={styles.footerLink}>
              <a href={`${dashboardUrl}/unsubscribe`} style={{ color: "#98a2b3", textDecoration: "underline" }}>
                Unsubscribe from review emails
              </a>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ── STYLES ─────────────────────────────────────────────────────────
const styles = {
  body: {
    backgroundColor: "#f8f9fb",
    fontFamily: "'Geist', Helvetica, Arial, sans-serif",
    margin: "0",
    padding: "40px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e4e7ec",
    maxWidth: "580px",
    margin: "0 auto",
    overflow: "hidden" as const,
    boxShadow: "0 4px 24px rgba(16,24,40,0.08)",
  },
  header: {
    background: "linear-gradient(160deg, #fafbff 0%, #eef2ff 100%)",
    borderBottom: "1px solid #e4e7ec",
    padding: "28px 32px 20px",
    textAlign: "center" as const,
  },
  logo: {
    fontFamily: "Georgia, serif",
    fontSize: "26px",
    fontWeight: "700",
    color: "#101828",
    margin: "0 0 4px",
    lineHeight: "1",
  },
  headerSub: {
    fontSize: "12px",
    color: "#98a2b3",
    margin: "0",
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  },
  section: {
    padding: "28px 32px",
  },
  greeting: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#101828",
    margin: "0 0 12px",
    fontFamily: "Georgia, serif",
    letterSpacing: "-0.3px",
  },
  greetingBody: {
    fontSize: "15px",
    color: "#344054",
    lineHeight: "1.7",
    margin: "0",
  },
  overallLabel: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.75)",
    margin: "0 0 6px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  },
  overallScore: {
    fontFamily: "Georgia, serif",
    fontSize: "56px",
    fontWeight: "700",
    color: "white",
    margin: "0",
    lineHeight: "1",
    letterSpacing: "-2px",
  },
  overallBadge: {
    fontSize: "13px",
    fontWeight: "600",
    color: "white",
    margin: "0",
  },
  divider: {
    borderColor: "#e4e7ec",
    borderTopWidth: "1px",
    margin: "0 32px",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#98a2b3",
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    margin: "0 0 16px",
  },
  catRow: {
    marginBottom: "18px",
    paddingBottom: "18px",
    borderBottom: "1px solid #f2f4f7",
  },
  catName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#344054",
    margin: "0 0 3px",
  },
  catStars: {
    fontSize: "15px",
    color: "#f79009",
    margin: "0 0 3px",
    letterSpacing: "2px",
  },
  catNote: {
    fontSize: "12px",
    color: "#98a2b3",
    fontStyle: "italic" as const,
    margin: "0",
  },
  catPct: {
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 4px",
    fontFamily: "monospace",
  },
  catBadge: {
    fontSize: "10px",
    fontWeight: "600",
    margin: "0",
    letterSpacing: "0.3px",
  },
  barTrack: {
    height: "5px",
    backgroundColor: "#e4e7ec",
    borderRadius: "3px",
    overflow: "hidden" as const,
    marginTop: "10px",
  },
  barFill: {
    height: "5px",
    borderRadius: "3px",
  },
  summaryBox: {
    backgroundColor: "#f8f9fb",
    border: "1px solid #e4e7ec",
    borderLeft: "4px solid #4f46e5",
    borderRadius: "8px",
    padding: "18px 20px",
  },
  summaryText: {
    fontSize: "14px",
    color: "#344054",
    lineHeight: "1.75",
    margin: "0",
  },
  ctaHeading: {
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#101828",
    margin: "0 0 10px",
    letterSpacing: "-0.3px",
  },
  ctaBody: {
    fontSize: "14px",
    color: "#667085",
    lineHeight: "1.65",
    margin: "0 0 24px",
    maxWidth: "380px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  ctaButton: {
    backgroundColor: "#4f46e5",
    borderRadius: "8px",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    padding: "13px 32px",
    textDecoration: "none",
    display: "inline-block",
    boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
  },
  ctaTrust: {
    fontSize: "12px",
    color: "#98a2b3",
    margin: "14px 0 0",
  },
  footer: {
    backgroundColor: "#f8f9fb",
    borderTop: "1px solid #e4e7ec",
    padding: "24px 32px",
    textAlign: "center" as const,
  },
  footerLogo: {
    fontFamily: "Georgia, serif",
    fontSize: "16px",
    color: "#101828",
    margin: "0 0 10px",
  },
  footerText: {
    fontSize: "12px",
    color: "#98a2b3",
    lineHeight: "1.6",
    margin: "0 0 8px",
  },
  footerLink: {
    fontSize: "12px",
    margin: "0",
  },
};
