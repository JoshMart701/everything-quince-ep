import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const VENDORS = [
  {
    business_name: "El Paso Grand Events Hall",
    slug: "el-paso-grand-events-hall",
    category: "venues",
    logo_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
    description:
      "El Paso's premier quinceañera venue featuring three elegant ballrooms accommodating 50–500 guests. Our stunning décor packages, full-service catering partnerships, and dedicated event coordinators ensure your daughter's night is unforgettable. We offer complimentary venue tours every Saturday.",
    short_bio: "Three elegant ballrooms with full event coordination services.",
    phone: "(915) 555-0142",
    email: "events@elpasograndhall.com",
    website: "https://www.elpasograndhall.com",
    address: "4801 Montana Ave",
    city: "El Paso",
    state: "TX",
    zip: "79903",
    plan: "premium",
    status: "approved",
    is_featured: true,
    average_rating: 4.9,
    review_count: 47,
    cities_served: ["El Paso", "Horizon City", "Socorro", "Las Cruces"],
    starting_price: 2500,
    tags: ["ballroom", "full-service", "catering", "large-capacity"],
  },
  {
    business_name: "Captured Moments Photography",
    slug: "captured-moments-photography",
    category: "photography",
    logo_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80",
    description:
      "Award-winning quinceañera photography and cinematic videography serving El Paso since 2015. We specialize in capturing the emotion and elegance of your quinceañera with a blend of classic portraiture and documentary storytelling. Our packages include drone footage, same-day edits, and stunning online galleries.",
    short_bio: "Cinematic photo & video packages with drone footage included.",
    phone: "(915) 555-0287",
    email: "hello@capturedmoments915.com",
    website: "https://www.capturedmoments915.com",
    address: "1275 Lee Trevino Dr, Suite 200",
    city: "El Paso",
    state: "TX",
    zip: "79936",
    plan: "pro",
    status: "approved",
    is_featured: false,
    average_rating: 4.8,
    review_count: 62,
    cities_served: ["El Paso", "Horizon City", "Socorro", "Las Cruces"],
    starting_price: 1200,
    tags: ["photography", "video", "drone", "cinematic"],
  },
  {
    business_name: "Bella Quinceañera Boutique",
    slug: "bella-quinceanera-boutique",
    category: "dresses",
    logo_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
    description:
      "The largest quinceañera dress boutique in El Paso with over 500 gowns in store. From classic ball gowns to modern mermaid silhouettes, our expert stylists help you find the perfect dress. We offer in-house alterations, rush services, and exclusive designer lines. Court dresses and chambelán suits also available.",
    short_bio: "500+ gowns in stock, in-house alterations, court & chambelán attire.",
    phone: "(915) 555-0364",
    email: "appointments@bellaquince.com",
    website: "https://www.bellaquince.com",
    address: "8911 Gateway Blvd W",
    city: "El Paso",
    state: "TX",
    zip: "79925",
    plan: "premium",
    status: "approved",
    is_featured: true,
    average_rating: 4.7,
    review_count: 89,
    cities_served: ["El Paso", "Horizon City", "Socorro"],
    starting_price: 350,
    tags: ["gowns", "alterations", "court-dresses", "accessories"],
  },
  {
    business_name: "Sabor del Pueblo Catering",
    slug: "sabor-del-pueblo-catering",
    category: "catering",
    logo_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
    description:
      "Family-owned catering company bringing authentic Mexican and Tex-Mex flavors to your quinceañera since 1998. Our buffet and plated options serve 50–800 guests with chef-crafted menus including birria, mole enchiladas, and carving stations. We also create stunning custom quinceañera cakes and dessert tables.",
    short_bio: "Authentic Tex-Mex catering + custom cakes for 50–800 guests.",
    phone: "(915) 555-0419",
    email: "bookings@sabordelpueblo.com",
    website: "https://www.sabordelpueblo.com",
    address: "3220 Dyer St",
    city: "El Paso",
    state: "TX",
    zip: "79930",
    plan: "pro",
    status: "approved",
    is_featured: false,
    average_rating: 4.9,
    review_count: 134,
    cities_served: ["El Paso", "Horizon City", "Socorro", "Las Cruces"],
    starting_price: 22,
    tags: ["catering", "cakes", "tex-mex", "buffet", "plated"],
  },
  {
    business_name: "DJ Phantom Entertainment",
    slug: "dj-phantom-entertainment",
    category: "djs",
    logo_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",
    description:
      "El Paso's #1 rated quinceañera DJ with over 400 events performed. DJ Phantom specializes in creating the perfect atmosphere — from the emotional waltz to the high-energy party. Services include professional sound & lighting, fog machine, LED dance floor, custom remixes, and bilingual MC hosting in English and Spanish.",
    short_bio: "400+ quinceañeras, bilingual MC, LED dance floor & custom lighting.",
    phone: "(915) 555-0531",
    email: "book@djphantomep.com",
    website: "https://www.djphantomep.com",
    address: "El Paso",
    city: "El Paso",
    state: "TX",
    zip: "79901",
    plan: "premium",
    status: "approved",
    is_featured: false,
    average_rating: 5.0,
    review_count: 78,
    cities_served: ["El Paso", "Horizon City", "Socorro", "Las Cruces"],
    starting_price: 800,
    tags: ["dj", "mc", "lighting", "led-floor", "bilingual"],
  },
  {
    business_name: "Desert Rose Florals & Decor",
    slug: "desert-rose-florals-decor",
    category: "florals",
    logo_url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
    description:
      "Creating breathtaking floral installations and event décor for quinceañeras across the Borderland. Desert Rose specializes in lush floral arches, cascading centerpieces, balloon walls, and full venue transformations. We work with any theme and handle complete setup and teardown.",
    short_bio: "Full venue transformations: florals, arches, centerpieces & balloon walls.",
    phone: "(915) 555-0672",
    email: "info@desertrosefloral.com",
    website: "https://www.desertrosefloral.com",
    address: "5534 Alameda Ave",
    city: "El Paso",
    state: "TX",
    zip: "79905",
    plan: "pro",
    status: "approved",
    is_featured: false,
    average_rating: 4.8,
    review_count: 55,
    cities_served: ["El Paso", "Horizon City", "Socorro"],
    starting_price: 750,
    tags: ["florals", "decor", "arches", "centerpieces", "balloon-walls"],
  },
  {
    business_name: "Glamour Studio by Rosa",
    slug: "glamour-studio-by-rosa",
    category: "hair-makeup",
    logo_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
    description:
      "Award-winning beauty studio specializing in quinceañera hair and makeup for the birthday girl and her full court. Rosa and her team of 6 licensed stylists are available for both studio appointments and on-location services. We offer trials, airbrush makeup, updos, braids, and coordinated looks for the entire court.",
    short_bio: "Full court styling — airbrush makeup, updos & on-location services.",
    phone: "(915) 555-0748",
    email: "bookings@glamourbyrosa.com",
    website: "https://www.glamourbyrosa.com",
    address: "7750 N Mesa St, Suite 105",
    city: "El Paso",
    state: "TX",
    zip: "79912",
    plan: "pro",
    status: "approved",
    is_featured: false,
    average_rating: 4.9,
    review_count: 103,
    cities_served: ["El Paso", "Horizon City"],
    starting_price: 175,
    tags: ["makeup", "hair", "airbrush", "court-styling", "on-location"],
  },
  {
    business_name: "Designs by Lupita",
    slug: "designs-by-lupita",
    category: "invitations",
    logo_url: "https://images.unsplash.com/photo-1471479917193-f00955256257?w=600&q=80",
    description:
      "Custom quinceañera invitations, programs, and printed keepsakes designed with your exact vision. Lupita has been crafting unique quinceañera stationery since 2010. Every invitation suite includes custom design, envelope addressing, and rush printing options. We also create matching programs, table cards, and photo booth props.",
    short_bio: "Custom invitations, programs & keepsakes — rush printing available.",
    phone: "(915) 555-0815",
    email: "orders@designsbylupita.com",
    website: "https://www.designsbylupita.com",
    address: "2341 N Zaragoza Rd",
    city: "El Paso",
    state: "TX",
    zip: "79938",
    plan: "free",
    status: "approved",
    is_featured: false,
    average_rating: 4.7,
    review_count: 41,
    cities_served: ["El Paso", "Horizon City", "Socorro", "Las Cruces"],
    starting_price: 120,
    tags: ["invitations", "printing", "programs", "keepsakes", "custom"],
  },
  {
    business_name: "Sun City Limo & Party Bus",
    slug: "sun-city-limo-party-bus",
    category: "transportation",
    logo_url: "https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?w=600&q=80",
    description:
      "Arrive in style with El Paso's premier quinceañera transportation company. Our fleet includes classic stretch limos, modern SUV limos, and 20–40 passenger party buses equipped with LED lighting, premium sound systems, and complimentary champagne for the birthday girl. Professional chauffeurs in formal attire.",
    short_bio: "Stretch limos & party buses with LED lighting and premium sound.",
    phone: "(915) 555-0923",
    email: "reservations@suncitylimo.com",
    website: "https://www.suncitylimo.com",
    address: "1100 Airway Blvd",
    city: "El Paso",
    state: "TX",
    zip: "79925",
    plan: "pro",
    status: "approved",
    is_featured: false,
    average_rating: 4.6,
    review_count: 38,
    cities_served: ["El Paso", "Horizon City", "Socorro", "Las Cruces"],
    starting_price: 450,
    tags: ["limo", "party-bus", "transportation", "chauffeur"],
  },
  {
    business_name: "Danza Sol Choreography Studio",
    slug: "danza-sol-choreography-studio",
    category: "choreography",
    logo_url: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600&q=80",
    description:
      "Professional quinceañera choreography for waltz, surprise dance, and full court routines. Danza Sol's team of 4 certified instructors creates custom choreography that matches your music selection and theme. We offer flexible scheduling, group and private sessions, and can teach courts of 4–20 couples. Performance-ready in 8–12 sessions.",
    short_bio: "Waltz, surprise dance & court choreography — performance-ready in 8 sessions.",
    phone: "(915) 555-1047",
    email: "studio@danzasol.com",
    website: "https://www.danzasol.com",
    address: "6200 Trowbridge Dr, Suite B",
    city: "El Paso",
    state: "TX",
    zip: "79925",
    plan: "free",
    status: "approved",
    is_featured: false,
    average_rating: 4.8,
    review_count: 29,
    cities_served: ["El Paso", "Horizon City"],
    starting_price: 250,
    tags: ["choreography", "waltz", "surprise-dance", "court", "dance"],
  },
];

// POST /api/admin/seed-vendors — admin-only, idempotent vendor seed
export async function POST(req: NextRequest) {
  // Require a secret token to prevent public triggering
  const token = req.headers.get("x-seed-token");
  if (!process.env.SEED_SECRET || token !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = await createServiceClient();

  // Create or find seed user
  const SEED_EMAIL = "seed-vendors@everythingquince.internal";
  const { data: { users } } = await supabase.auth.admin.listUsers();
  let seedUserId = users.find((u) => u.email === SEED_EMAIL)?.id;

  if (!seedUserId) {
    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email: SEED_EMAIL,
      password: crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { role: "seed" },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    seedUserId = user!.id;
  }

  const records = VENDORS.map((v) => ({ ...v, user_id: seedUserId }));
  const { data, error } = await supabase
    .from("vendors")
    .upsert(records, { onConflict: "slug" })
    .select("id, business_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    count: data?.length ?? 0,
    vendors: data?.map((v) => v.business_name),
  });
}
