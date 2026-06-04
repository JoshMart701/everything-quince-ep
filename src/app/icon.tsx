// Served at /icon — Next.js auto-links as favicon
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "white",
            fontFamily: "serif",
            lineHeight: 1,
            marginTop: -1,
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size }
  );
}
