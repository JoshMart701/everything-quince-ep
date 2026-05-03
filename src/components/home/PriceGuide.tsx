import { PRICE_GUIDE } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function PriceGuide() {
  return (
    <section id="prices" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="gold-divider mx-auto mb-4" />
          <h2 className="section-title">El Paso Price Guide</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Real pricing data from local quinceañera vendors in El Paso and surrounding areas.
            Prices vary based on package, date, and customization.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {PRICE_GUIDE.map((item) => (
            <div
              key={item.category}
              className="card p-5 hover:shadow-[0_4px_24px_rgba(196,84,122,0.12)] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-body font-semibold text-[#3D1A2E] text-base">{item.category}</h3>
                <span className="text-xs text-[#3D1A2E]/50 bg-[#FDF7F0] px-2 py-0.5 rounded-full">
                  per {item.unit}
                </span>
              </div>

              {/* Price range bar */}
              <div className="mb-3">
                <div className="w-full bg-[#f3ddb9] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#C4547A] to-[#C9A84C] h-2 rounded-full"
                    style={{
                      marginLeft: `${(item.low / 6000) * 100}%`,
                      width: `${((item.high - item.low) / 6000) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#3D1A2E]/50 font-body">Starting at</p>
                  <p className="font-heading font-bold text-[#C4547A] text-lg">
                    {formatCurrency(item.low)}
                  </p>
                </div>
                <div className="text-center text-[#3D1A2E]/30 text-sm">—</div>
                <div className="text-right">
                  <p className="text-xs text-[#3D1A2E]/50 font-body">Up to</p>
                  <p className="font-heading font-bold text-[#3D1A2E] text-lg">
                    {formatCurrency(item.high)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer & CTA */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#FDF7F0] rounded-2xl p-6 border border-[#f3ddb9]">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-[#C9A84C] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#3D1A2E]/70 font-body">
              Prices shown are estimates based on El Paso market data. Actual pricing depends on
              package details, guest count, and availability. Get a free custom quote from vendors directly.
            </p>
          </div>
          <Link
            href="/vendors"
            className="btn-primary flex-shrink-0"
          >
            Compare Vendors
          </Link>
        </div>
      </div>
    </section>
  );
}
