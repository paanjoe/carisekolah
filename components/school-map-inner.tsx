"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { School } from "@/types/school";
import "leaflet/dist/leaflet.css";

type Props = {
  schools: School[];
  highlightKod?: string | null;
  locale: string;
};

const MALAYSIA_CENTER: [number, number] = [4.2, 101.9];
const DEFAULT_ZOOM = 7;

export function SchoolMapInner({ schools, highlightKod, locale }: Props) {
  const t = useTranslations("map");
  const mapRef = useRef<ReturnType<typeof import("leaflet").map> | null>(null);
  const markersRef = useRef<InstanceType<typeof import("leaflet").Marker>[]>([]);
  const circleRef = useRef<InstanceType<typeof import("leaflet").Circle> | null>(null);
  const [nearMe, setNearMe] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const withCoords = schools.filter(
    (s): s is School & { lat: number; lng: number } =>
      typeof s.lat === "number" && typeof s.lng === "number"
  );

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    const L = require("leaflet");

    const map = L.map(mapContainerRef.current).setView(MALAYSIA_CENTER, DEFAULT_ZOOM);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const L = require("leaflet");
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const toShow = nearMe
      ? withCoords.filter((s) => {
          const R = 6371;
          const dLat = ((s.lat - nearMe.lat) * Math.PI) / 180;
          const dLng = ((s.lng - nearMe.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((nearMe.lat * Math.PI) / 180) *
              Math.cos((s.lat * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c <= radiusKm;
        })
      : withCoords;

    toShow.forEach((s) => {
      const isHighlight = highlightKod && (s.kodSekolah || "").toUpperCase() === highlightKod.toUpperCase();
      const icon = L.divIcon({
        html: `<div style="width:${isHighlight ? 16 : 12}px;height:${isHighlight ? 16 : 12}px;border-radius:50%;background:${isHighlight ? "#dc2626" : "#2563eb"};border:2px solid white;"></div>`,
        className: "",
        iconSize: [isHighlight ? 16 : 12, isHighlight ? 16 : 12],
      });
      const marker = L.marker([s.lat, s.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div class="p-1 min-w-[140px]"><a href="/${locale}/sekolah/${encodeURIComponent(s.kodSekolah)}" class="font-medium hover:underline">${escapeHtml(s.namaSekolah || s.kodSekolah)}</a><br/><span class="text-gray-500 text-sm">${escapeHtml(s.bandar || "")} ${s.poskod || ""}</span></div>`
        );
      markersRef.current.push(marker);
    });

    if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }
    if (highlightKod && toShow.length > 0) {
      const one = toShow.find(
        (s) => (s.kodSekolah || "").toUpperCase() === (highlightKod || "").toUpperCase()
      );
      if (one) map.setView([one.lat, one.lng], 14);
    } else if (nearMe) {
      map.setView([nearMe.lat, nearMe.lng], 12);
      const circle = L.circle([nearMe.lat, nearMe.lng], { radius: radiusKm * 1000, color: "#2563eb", fillOpacity: 0.1 });
      circle.addTo(map);
      circleRef.current = circle;
    }
    return () => {
      if (circleRef.current && mapRef.current) {
        mapRef.current.removeLayer(circleRef.current);
        circleRef.current = null;
      }
    };
  }, [withCoords, highlightKod, nearMe, radiusKm]);

  function requestLocation() {
    if (!navigator.geolocation) {
      alert(t("geolocationUnsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setNearMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert(t("geolocationError"))
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="absolute inset-0" />
      <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-2 z-[1000]">
        <button
          type="button"
          onClick={requestLocation}
          className="px-3 py-1.5 rounded-md bg-white border shadow text-sm font-medium hover:bg-gray-50"
        >
          {t("nearMe")}
        </button>
        {nearMe && (
          <>
            <label className="flex items-center gap-1 text-sm bg-white/90 px-2 py-1 rounded">
              <span>{t("radiusKm")}:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value) || 10)}
                className="w-14 border rounded px-1"
              />
            </label>
            <button
              type="button"
              onClick={() => setNearMe(null)}
              className="px-2 py-1 rounded bg-gray-200 text-sm hover:bg-gray-300"
            >
              {t("clear")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
