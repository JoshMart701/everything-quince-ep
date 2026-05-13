import { Resend } from "resend";

export const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@everythingquince.com";
export const OWNER = process.env.OWNER_EMAIL ?? "owner@everythingquince.com";

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendQuoteNotificationToOwner(lead: {
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  eventCity?: string;
  guestCount?: number;
  budgetRange?: string;
  categories: string[];
  message?: string;
}) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: OWNER,
    subject: `New Quote Request from ${lead.name}`,
    html: `
      <h2>New Quote Request — Everything Quince EP</h2>
      <p><strong>Name:</strong> ${lead.name}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Phone:</strong> ${lead.phone ?? "Not provided"}</p>
      <p><strong>Event Date:</strong> ${lead.eventDate ?? "TBD"}</p>
      <p><strong>City:</strong> ${lead.eventCity ?? "Not specified"}</p>
      <p><strong>Guest Count:</strong> ${lead.guestCount ?? "Not specified"}</p>
      <p><strong>Budget Range:</strong> ${lead.budgetRange ?? "Not specified"}</p>
      <p><strong>Services Needed:</strong> ${lead.categories.join(", ")}</p>
      <p><strong>Message:</strong> ${lead.message ?? "None"}</p>
      <hr/>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">View in Admin Dashboard</a></p>
    `,
  });
}

export async function sendQuoteConfirmationToClient(lead: {
  name: string;
  email: string;
  categories: string[];
}) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: lead.email,
    subject: "We received your quote request! 🌹",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3D1A2E, #C4547A); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; font-size: 28px; margin: 0;">Everything Quince EP</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">El Paso's Quinceañera Planning Hub</p>
        </div>
        <div style="background: #FDF7F0; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #f3ddb9;">
          <h2 style="color: #3D1A2E;">Hola, ${lead.name}! 🌹</h2>
          <p style="color: #3D1A2E; line-height: 1.6;">
            ¡Gracias for reaching out! We've received your quote request for
            <strong>${lead.categories.join(", ")}</strong> and are matching you
            with the best vendors in El Paso.
          </p>
          <p style="color: #3D1A2E; line-height: 1.6;">
            You'll hear from matched vendors within 24–48 hours. In the meantime,
            explore our planning checklist and budget calculator on our website!
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}"
               style="background: #C4547A; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 600;">
              Visit Everything Quince EP
            </a>
          </div>
          <p style="color: #3D1A2E/60; font-size: 14px;">
            With love &amp; glitter,<br/>
            <strong>The Everything Quince EP Team</strong>
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendLeadToVendor(vendor: {
  email: string;
  businessName: string;
  leadId: string;
}, lead: {
  name: string;
  eventDate?: string;
  eventCity?: string;
  guestCount?: number;
  budgetRange?: string;
  categories: string[];
}) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: vendor.email,
    subject: `New Lead: ${lead.name} is looking for your services`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3D1A2E, #C4547A); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0;">New Lead for ${vendor.businessName}</h2>
        </div>
        <div style="background: #FDF7F0; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #f3ddb9;">
          <p>You have a new quinceañera lead!</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: 600; color: #3D1A2E;">Client:</td><td>${lead.name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #3D1A2E;">Event Date:</td><td>${lead.eventDate ?? "TBD"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #3D1A2E;">City:</td><td>${lead.eventCity ?? "El Paso"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #3D1A2E;">Guests:</td><td>${lead.guestCount ?? "Not specified"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #3D1A2E;">Budget:</td><td>${lead.budgetRange ?? "Not specified"}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #3D1A2E;">Services:</td><td>${lead.categories.join(", ")}</td></tr>
          </table>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/vendor/leads"
               style="background: #C4547A; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 600;">
              View Full Lead Details
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendVendorApprovalEmail(vendor: {
  email: string;
  businessName: string;
}) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: vendor.email,
    subject: "Your listing is approved! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3D1A2E, #C4547A); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">You're Live! 🌹</h1>
        </div>
        <div style="background: #FDF7F0; padding: 40px; border-radius: 0 0 12px 12px; border: 1px solid #f3ddb9;">
          <h2 style="color: #3D1A2E;">Congratulations, ${vendor.businessName}!</h2>
          <p style="color: #3D1A2E; line-height: 1.6;">
            Your listing on Everything Quince EP has been approved and is now live
            in our vendor directory. Families across El Paso can now discover your services!
          </p>
          <p style="color: #3D1A2E; line-height: 1.6;">
            Upgrade to <strong>Pro ($49/mo)</strong> or <strong>Premium ($149/mo)</strong>
            to unlock lead access, profile editing, reviews, and more.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard"
               style="background: #C4547A; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 600;">
              Go to Your Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendAnnouncementToVendors(
  emails: string[],
  subject: string,
  body: string
) {
  const resend = getResend();
  if (!resend) return;
  const batches = [];
  for (let i = 0; i < emails.length; i += 50) {
    batches.push(emails.slice(i, i + 50));
  }

  for (const batch of batches) {
    await Promise.all(
      batch.map((email) =>
        resend.emails.send({
          from: FROM,
          to: email,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #3D1A2E, #C4547A); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
                <h2 style="color: white; margin: 0;">Everything Quince EP</h2>
              </div>
              <div style="background: #FDF7F0; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #f3ddb9;">
                ${body}
              </div>
            </div>
          `,
        })
      )
    );
  }
}
