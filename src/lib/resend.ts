import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@amengoodnight.com";
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendWelcomeEmail(user: { email: string; fullName: string }) {
  const resend = getResend(); if (!resend) return;
  await resend.emails.send({
    from: FROM, to: user.email, subject: "Welcome to Amen Goodnight 🌙",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1E1B4B;padding:40px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0">Amen Goodnight</h1></div><div style="background:#FDF7F0;padding:40px;border-radius:0 0 12px 12px;border:1px solid #E5E0F0"><h2 style="color:#1E1B4B">Welcome, ${user.fullName}!</h2><p style="color:#1E1B4B;line-height:1.6">Your 7-day free trial has started. Set up your children's profiles and we'll deliver a personalized, faith-filled bedtime story every night.</p><div style="text-align:center;margin:32px 0"><a href="${process.env.NEXT_PUBLIC_BASE_URL}/onboarding" style="background:#6B4FA0;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600">Set Up Your Family</a></div></div></div>`,
  });
}

export async function sendStoryDeliveryEmail(p: { to: string; childName: string; storyTitle: string; storyContent: string; scriptureReference: string | null }) {
  const resend = getResend(); if (!resend) return;
  await resend.emails.send({
    from: FROM, to: p.to, subject: `Tonight's story for ${p.childName}: "${p.storyTitle}" 🌙`,
    html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto"><div style="background:#1E1B4B;padding:32px;text-align:center;border-radius:12px 12px 0 0"><p style="color:rgba(255,255,255,0.6);margin:0;font-size:14px">A bedtime story for</p><h1 style="color:white;font-size:26px;margin:8px 0 0">${p.childName}</h1></div><div style="background:#FDF7F0;padding:40px;border-radius:0 0 12px 12px;border:1px solid #E5E0F0"><h2 style="color:#1E1B4B;text-align:center;margin-bottom:24px">${p.storyTitle}</h2><div style="color:#1E1B4B;line-height:1.8;white-space:pre-wrap">${p.storyContent}</div>${p.scriptureReference ? `<div style="margin-top:32px;padding:16px;background:#F3F0FA;border-radius:8px;border-left:4px solid #6B4FA0"><p style="color:#6B4FA0;font-style:italic;margin:0">${p.scriptureReference}</p></div>` : ""}<p style="color:#1E1B4B;font-size:14px;text-align:center;margin-top:32px">Goodnight, and God bless 🌙<br/><strong>Amen Goodnight</strong></p></div></div>`,
  });
}
