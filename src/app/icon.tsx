import { ImageResponse } from "next/og";

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
          background: "#07080c",
          color: "#d6f25c",
          fontSize: 20,
          fontWeight: 650,
          letterSpacing: -1,
        }}
      >
        A
      </div>
    ),
    size,
  );
}
