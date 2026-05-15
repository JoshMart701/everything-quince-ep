import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { VENDOR_CATEGORIES } from "@/lib/constants";
import { sendVendorSubmissionConfirmation, sendNewVendorNotificationToOwner } from "@/lib/resend";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slug = slugify(body.businessName) + "-" + Math.random().toString(36).slice(2, 6);

    const { data, error } = await supabase
      .from("vendors")
      .insert({
        user_id: user.id,
        business_name: body.businessName,
        slug,
        category: body.category,
        description: body.description,
        phone: body.phone,
        email: body.email || user.email,
        website: body.website,
        city: body.city || "El Paso",
        state: body.state || "TX",
        plan: "free",
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    await Promise.all([
      sendVendorSubmissionConfirmation({ email: data.email, businessName: data.business_name }),
      sendNewVendorNotificationToOwner({ businessName: data.business_name, email: data.email, category: data.category, city: data.city }),
    ]).catch(console.error);

    return NextResponse.json({ success: true, vendor: data });
  } catch (err) {
    console.error("Vendor creation error:", err);
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const search = searchParams.get("q");
  const plan = searchParams.get("plan");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");

  const supabase = await createClient();

  let query = supabase
    .from("vendors")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .range((page - 1) * limit, page * limit - 1)
    .order("is_featured", { ascending: false })
    .order("average_rating", { ascending: false });

  if (category) {
    // Accept both slug ("venues") and label ("Venues & Halls") to handle any existing DB data
    const catDef = VENDOR_CATEGORIES.find((c) => c.slug === category);
    const catValues = catDef ? [catDef.slug, catDef.label] : [category];
    query = query.in("category", catValues);
  }
  if (city) {
    // Match primary city column OR cities_served array (vendors often serve multiple cities)
    query = query.or(`city.ilike.%${city}%,cities_served.cs.{"${city}"}`);
  }
  if (plan) query = query.eq("plan", plan);
  if (search) {
    query = query.or(
      `business_name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    vendors: data,
    total: count,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}
