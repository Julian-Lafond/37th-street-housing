import { ImageResponse } from "next/og";
import { GOLDEN, OG_EXTERIOR, OG_FONTS, OG_SIZE } from "@/lib/og";
import { DEFAULT_SHARE_IMAGE } from "@/lib/seo";

export const alt = DEFAULT_SHARE_IMAGE.alt;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: GOLDEN, fontFamily: "Manrope" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640, padding: "64px 56px" }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#1b1f1d" }}>UNIVERSITY PARK · LOS ANGELES</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Fraunces", fontSize: 96, lineHeight: 1, color: "#1b1f1d" }}>37th Street</div>
            <div style={{ fontSize: 30, marginTop: 24, color: "#1b1f1d", lineHeight: 1.35 }}>
              Furnished 3–5 bedroom apartments, a private bath for every bedroom, ~5 min walk to USC.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#1b1f1d" }}>Now leasing for August 2027</div>
        </div>
        <img src={OG_EXTERIOR} alt="" width={560} height={630} style={{ objectFit: "cover", borderTopLeftRadius: 120 }} />
      </div>
    ),
    { ...size, fonts: OG_FONTS },
  );
}
