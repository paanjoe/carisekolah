import { ImageResponse } from "next/og";

export const alt = "carisekolahmy — KPM School Finder. Search and analyse schools in Malaysia.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #fefce8 0%, #fef9c3 50%, #fef3c7 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #b45309 0%, #d97706 50%, #b45309 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: 48,
          }}
        >
          <span style={{ fontSize: 56, fontWeight: 700, color: "#78350f", letterSpacing: "-0.02em" }}>
            carisekolahmy
          </span>
          <span style={{ fontSize: 28, color: "#92400e", fontWeight: 600 }}>
            KPM School Finder
          </span>
          <span style={{ fontSize: 22, color: "#78716c", marginTop: 8 }}>
            Search and analyse schools by location and statistics
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 24,
              padding: "12px 24px",
              background: "rgba(255,255,255,0.7)",
              borderRadius: 12,
            }}
          >
            <span style={{ fontSize: 20, color: "#57534e" }}>🇲🇾</span>
            <span style={{ fontSize: 18, color: "#78716c", fontWeight: 500 }}>
              carisekolah.civictech.my
            </span>
          </div>
        </div>
        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            fontSize: 16,
            color: "#a8a29e",
          }}
        >
          Brought to you by CivicTechMY
        </div>
      </div>
    ),
    { ...size }
  );
}
