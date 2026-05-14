/**
 * Create Stripe products and prices for Pro ($49/mo) and Premium ($149/mo) plans.
 * Outputs the price IDs you need to set in Vercel env vars.
 *
 * Usage:
 *   npx tsx scripts/setup-stripe.ts
 *
 * Requires STRIPE_SECRET_KEY in .env.local
 */
import Stripe from "stripe";
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
if (!SECRET_KEY || SECRET_KEY.includes("placeholder") || SECRET_KEY === "sk_test_placeholder") {
  console.error("❌  Set STRIPE_SECRET_KEY in .env.local with your real Stripe secret key");
  process.exit(1);
}

const stripe = new Stripe(SECRET_KEY);

async function getOrCreatePrice(
  productName: string,
  productDescription: string,
  amountCents: number,
  lookupKey: string
): Promise<string> {
  // Check for existing price with this lookup key
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], active: true });
  if (existing.data.length > 0) {
    console.log(`  ↩  Existing price for ${productName}: ${existing.data[0].id}`);
    return existing.data[0].id;
  }

  // Create product
  const product = await stripe.products.create({
    name: productName,
    description: productDescription,
    metadata: { platform: "everything-quince-ep" },
  });

  // Create recurring price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amountCents,
    currency: "usd",
    recurring: { interval: "month" },
    lookup_key: lookupKey,
    nickname: productName,
    metadata: { platform: "everything-quince-ep" },
  });

  return price.id;
}

async function setup() {
  console.log("💳 Setting up Stripe products and prices for Everything Quince EP...\n");

  const proId = await getOrCreatePrice(
    "Everything Quince EP — Pro",
    "Pro vendor plan: lead inbox, full profile editor, photo gallery, reviews, analytics, calendar.",
    4900,
    "everything-quince-pro-monthly"
  );
  console.log(`  ✅ Pro price ID:     ${proId}`);

  const premiumId = await getOrCreatePrice(
    "Everything Quince EP — Premium",
    "Premium vendor plan: all Pro features plus client CRM, invoice generator, priority leads, and featured badge.",
    14900,
    "everything-quince-premium-monthly"
  );
  console.log(`  ✅ Premium price ID: ${premiumId}\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Add these to your Vercel environment variables:\n");
  console.log(`  STRIPE_PRO_PRICE_ID=${proId}`);
  console.log(`  STRIPE_PREMIUM_PRICE_ID=${premiumId}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

setup().catch((err) => {
  console.error("❌ Stripe setup failed:", err.message);
  process.exit(1);
});
