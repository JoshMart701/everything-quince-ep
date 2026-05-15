import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const QUERIES: Record<string, string> = {
  all: "quinceañera celebration beautiful elegant",
  venues: "elegant ballroom reception hall wedding venue",
  photography: "quinceañera portrait photography beautiful girl",
  dresses: "quinceañera ball gown dress princess pink",
  catering: "quinceañera celebration cake dessert elegant",
  djs: "quinceañera party dance celebration DJ lights",
  florals: "quinceañera flowers floral bouquet roses pink",
  "hair-makeup": "quinceañera hair makeup beauty girl elegant",
  invitations: "elegant invitation card stationery gold luxury",
};

interface UnsplashPhoto {
  id: string;
  urls: { regular: string; small: string };
  alt_description: string | null;
  description: string | null;
  user: { name: string; links: { html: string } };
  width: number;
  height: number;
  color: string;
}

// Curated fallback photos for each category — used when UNSPLASH_ACCESS_KEY is not set.
// All images are from Unsplash CDN and are freely available.
const FALLBACKS: Record<string, Array<{ id: string; src: string; alt: string }>> = {
  all: [
    { id: "f-a1", src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80", alt: "Elegant ballroom reception" },
    { id: "f-a2", src: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80", alt: "Pink floral arrangements" },
    { id: "f-a3", src: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", alt: "Quinceañera celebration cake" },
    { id: "f-a4", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", alt: "Elegant quinceañera portrait" },
    { id: "f-a5", src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80", alt: "Tiered celebration cake" },
    { id: "f-a6", src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80", alt: "Quinceañera hair and makeup" },
    { id: "f-a7", src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80", alt: "Celebration dance party" },
    { id: "f-a8", src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80", alt: "Elegant quinceañera styling" },
    { id: "f-a9", src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80", alt: "Beautiful event venue" },
    { id: "f-a10", src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80", alt: "Quinceañera photography moment" },
    { id: "f-a11", src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80", alt: "Quinceañera tiara crown jewelry" },
    { id: "f-a12", src: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80", alt: "Elegant invitation stationery" },
  ],
  venues: [
    { id: "f-v1", src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80", alt: "Grand ballroom reception" },
    { id: "f-v2", src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80", alt: "Elegant event venue" },
    { id: "f-v3", src: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80", alt: "Celebration dinner setting" },
    { id: "f-v4", src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", alt: "Outdoor venue garden" },
  ],
  photography: [
    { id: "f-p1", src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80", alt: "Quinceañera photography moment" },
    { id: "f-p2", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", alt: "Elegant portrait photography" },
    { id: "f-p3", src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80", alt: "Quinceañera cinematic portrait" },
  ],
  dresses: [
    { id: "f-d1", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", alt: "Quinceañera gown portrait" },
    { id: "f-d2", src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80", alt: "Elegant quinceañera ball gown" },
  ],
  catering: [
    { id: "f-c1", src: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", alt: "Quinceañera celebration cake" },
    { id: "f-c2", src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80", alt: "Elegant tiered cake" },
    { id: "f-c3", src: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80", alt: "Celebration dinner spread" },
  ],
  djs: [
    { id: "f-j1", src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80", alt: "Quinceañera dance party DJ" },
    { id: "f-j2", src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80", alt: "Celebration event atmosphere" },
  ],
  florals: [
    { id: "f-f1", src: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80", alt: "Pink roses quinceañera" },
    { id: "f-f2", src: "https://images.unsplash.com/photo-1487530811015-780d15dce33a?w=800&q=80", alt: "Floral arrangements" },
    { id: "f-f3", src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", alt: "White floral decorations" },
  ],
  "hair-makeup": [
    { id: "f-h1", src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80", alt: "Quinceañera hair and makeup" },
    { id: "f-h2", src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80", alt: "Elegant beauty styling" },
    { id: "f-h3", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", alt: "Quinceañera portrait beauty" },
  ],
  invitations: [
    { id: "f-i1", src: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80", alt: "Elegant invitation stationery" },
    { id: "f-i2", src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80", alt: "Gold quinceañera accessories" },
  ],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "all";
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "24"), 30);

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    const photos = FALLBACKS[category] ?? FALLBACKS.all;
    return NextResponse.json({ photos, total: photos.length, source: "fallback" });
  }

  const query = QUERIES[category] ?? QUERIES.all;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=portrait`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      const fallback = FALLBACKS[category] ?? FALLBACKS.all;
      return NextResponse.json({ photos: fallback, total: fallback.length, source: "fallback" });
    }

    const data = await res.json();

    const photos = (data.results as UnsplashPhoto[]).map((photo) => ({
      id: photo.id,
      src: photo.urls.regular,
      thumb: photo.urls.small,
      alt: photo.alt_description ?? photo.description ?? "Quinceañera inspiration",
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html + "?utm_source=everything_quince_ep&utm_medium=referral",
      width: photo.width,
      height: photo.height,
    }));

    return NextResponse.json({ photos, total: data.total, source: "unsplash" });
  } catch {
    const fallback = FALLBACKS[category] ?? FALLBACKS.all;
    return NextResponse.json({ photos: fallback, total: fallback.length, source: "fallback" });
  }
}
