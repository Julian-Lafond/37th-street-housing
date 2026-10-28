import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#22304a", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 46, width: 92, height: 92, borderRadius: 999, background: "#f2704e" }} />
        <div style={{ position: "absolute", top: 112, left: 0, width: 180, height: 68, background: "#22304a" }} />
        <div style={{ position: "absolute", top: 114, left: 28, width: 124, height: 8, borderRadius: 4, background: "#f7f2ea" }} />
        <div style={{ position: "absolute", top: 136, left: 52, width: 76, height: 8, borderRadius: 4, background: "#f7f2ea" }} />
      </div>
    ),
    size,
  );
}
