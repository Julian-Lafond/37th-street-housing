import { ImageResponse } from "next/og";
import { getUnit, getUnitSlugs } from "@/lib/data";
import { advertisedMonthlyPrice, formatCurrency } from "@/lib/pricing";
import { GOLDEN, OG_FONTS, OG_SIZE } from "@/lib/og";

export const alt = "Apartment at 37th Street Housing near USC";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await getUnitSlugs()).map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = await getUnit(slug);
  const price = unit ? advertisedMonthlyPrice(unit) : null;

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "64px 72px", background: GOLDEN, color: "#1b1f1d", fontFamily: "Manrope" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 4 }}>
          <span>37TH STREET HOUSING</span>
          <span>NEAR USC</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Fraunces", fontSize: 200, lineHeight: 0.9, letterSpacing: -6 }}>{unit?.displayName ?? "37th Street"}</div>
          {unit && (
            <div style={{ display: "flex", gap: 40, marginTop: 36, fontSize: 40 }}>
              <span>
                {unit.bedrooms} Bed · {unit.bathrooms} Bath
              </span>
              <span>{unit.squareFeet.toLocaleString("en-US")} sq ft</span>
              {price !== null && <span>{formatCurrency(price)} / month</span>}
            </div>
          )}
        </div>
        <div style={{ display: "flex", fontSize: 26 }}>Fully furnished · In-unit washer & dryer · Available August 2027</div>
      </div>
    ),
    { ...size, fonts: OG_FONTS },
  );
}
