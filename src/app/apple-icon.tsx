// Served at /apple-icon — Next.js auto-links as apple-touch-icon
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            fontSize: 112,
            fontWeight: 700,
            color: "white",
            fontFamily: "serif",
            lineHeight: 1,
            marginTop: -6,
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size }
  );
}
