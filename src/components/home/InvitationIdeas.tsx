import Link from "next/link";
import Image from "next/image";

const INVITATION_STYLES = [
  {
    id: 1,
    name: "Classic Elegance",
    description: "Pearl border, script fonts, romantic rose imagery",
    colors: ["#C4547A", "#FDF7F0", "#C9A84C"],
    price: "From $1.50/each",
    img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80",
  },
  {
    id: 2,
    name: "Rustic Chic",
    description: "Kraft paper, dried floral, botanical watercolor accents",
    colors: ["#906523", "#f9edd9", "#4d1d3b"],
    price: "From $1.25/each",
    img: "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=400&q=80",
  },
  {
    id: 3,
    name: "Modern Glam",
    description: "Foil stamping, geometric patterns, bold typography",
    colors: ["#3D1A2E", "#C9A84C", "#ffffff"],
    price: "From $2.00/each",
    img: "https://images.unsplash.com/photo-1514782831304-632d84503f6f?w=400&q=80",
  },
  {
    id: 4,
    name: "Masquerade",
    description: "Dramatic masks, deep jewel tones, theatrical flair",
    colors: ["#1a0a26", "#C9A84C", "#8b0000"],
    price: "From $1.75/each",
    img: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=80",
  },
];

const WORDING_TIPS = [
  "Include both English and Spanish for bilingual guests",
  "Mention formal attire expectations clearly",
  "Add a QR code linking to your event website or RSVP form",
  "Include a church address separate from reception venue",
  "Send digital invitations 2–3 months ahead; mail physical ones 6–8 weeks before",
];

export default function InvitationIdeas() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="gold-divider mx-auto mb-4" />
          <h2 className="section-title">Invitation Ideas</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Set the tone for your quinceañera with the perfect invitation.
            Browse styles and connect with local invitation designers in El Paso.
          </p>
        </div>

        {/* Invitation styles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {INVITATION_STYLES.map((style) => (
            <div
              key={style.id}
              className="card group hover:shadow-[0_8px_32px_rgba(196,84,122,0.15)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={style.img}
                  alt={style.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute bottom-3 left-3 flex gap-1">
                  {style.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-semibold text-[#3D1A2E] text-lg mb-1">
                  {style.name}
                </h3>
                <p className="text-sm text-[#3D1A2E]/60 font-body mb-3">{style.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#C4547A] font-semibold text-sm font-body">{style.price}</span>
                  <Link
                    href="/categories/invitations"
                    className="text-xs font-body font-medium text-[#3D1A2E]/50 hover:text-[#C4547A] transition-colors"
                  >
                    Find vendors →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wording tips */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="font-heading font-bold text-2xl text-[#3D1A2E] mb-4">
              Invitation Wording Tips
            </h3>
            <p className="text-[#3D1A2E]/70 font-body mb-6">
              The invitation sets the tone for your entire celebration. Here are expert
              tips from El Paso&apos;s top invitation designers:
            </p>
            <ul className="space-y-3">
              {WORDING_TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#C4547A]/10 text-[#C4547A] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#3D1A2E]/80 font-body">{tip}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/categories/invitations" className="btn-primary">
                Find Invitation Designers
              </Link>
            </div>
          </div>

          {/* Sample wording */}
          <div className="bg-gradient-to-br from-[#3D1A2E] to-[#5c2044] rounded-3xl p-8 text-white text-center">
            <p className="text-[#C9A84C] text-sm font-body mb-4 tracking-widest uppercase">Sample Wording</p>
            <p className="font-body text-white/70 text-sm mb-1">Con gran alegría</p>
            <p className="font-heading text-2xl font-bold mb-1">
              Ricardo & María López
            </p>
            <p className="font-body text-white/70 text-sm mb-4">request the honor of your presence</p>
            <p className="font-body text-white/70 text-sm mb-1">at the Quinceañera celebration of their daughter</p>
            <p className="font-heading text-4xl font-bold text-[#C9A84C] my-4">Sofía Elena</p>
            <p className="font-body text-white/60 text-sm">
              Saturday, the fifteenth of June<br />
              Two thousand and twenty-five<br />
              at six o&apos;clock in the evening
            </p>
            <div className="mt-5 pt-5 border-t border-white/10">
              <p className="font-body text-sm text-white/70">Sacred Heart Cathedral</p>
              <p className="font-body text-sm text-white/50">Followed by dinner and dancing</p>
              <p className="font-body text-sm text-white/50">El Paso Marriott, Downtown</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
