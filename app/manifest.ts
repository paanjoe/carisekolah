import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "carisekolah.my",
    short_name: "carisekolah.my",
    description: "Cari dan analisis sekolah KPM mengikut lokasi dan statistik.",
    start_url: "/ms",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c9a227",
  };
}
