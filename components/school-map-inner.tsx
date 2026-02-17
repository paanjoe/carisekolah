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
    const el = mapContainerRef.current;

    const map = L.map(el, { zoomControl: false }).setView(MALAYSIA_CENTER, DEFAULT_ZOOM);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap, &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
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

    const popupLabels = {
      logoPlaceholder: t("popupLogoPlaceholder"),
      code: t("popupCode"),
      enrolment: t("popupEnrolment"),
      ptr: t("popupPtr"),
      viewDetails: t("popupViewDetails"),
      compare: t("popupCompare"),
    };

    toShow.forEach((s) => {
      const isHighlight = highlightKod && (s.kodSekolah || "").toUpperCase() === highlightKod.toUpperCase();
      const icon = L.divIcon({
        html: `<div style="width:${isHighlight ? 16 : 12}px;height:${isHighlight ? 16 : 12}px;border-radius:50%;background:${isHighlight ? "#dc2626" : "#2563eb"};border:2px solid white;"></div>`,
        className: "",
        iconSize: [isHighlight ? 16 : 12, isHighlight ? 16 : 12],
      });
      const marker = L.marker([s.lat, s.lng], { icon })
        .addTo(map)
        .bindPopup(buildPopupHtml(s, locale, popupLabels), { minWidth: 280, maxWidth: 320 });
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
  }, [withCoords, highlightKod, nearMe, radiusKm, locale, t]);

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
      <div className="absolute top-2 right-2 flex flex-wrap gap-2 justify-end z-[1000]">
        <button
          type="button"
          onClick={requestLocation}
          className="px-3 py-1.5 rounded-md bg-white border border-border shadow-sm text-sm font-medium hover:bg-muted/80 text-foreground"
        >
          {t("nearMe")}
        </button>
        {nearMe && (
          <>
            <label className="flex items-center gap-1 text-sm bg-background/95 border border-border rounded-md px-2 py-1.5 shadow-sm">
              <span className="text-muted-foreground">{t("radiusKm")}:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value) || 10)}
                className="w-14 border border-border rounded px-1.5 py-0.5 text-foreground bg-background text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() => setNearMe(null)}
              className="px-2 py-1.5 rounded-md border border-border bg-background/95 text-sm hover:bg-muted/80 shadow-sm text-foreground"
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

type PopupLabels = {
  logoPlaceholder: string;
  code: string;
  enrolment: string;
  ptr: string;
  viewDetails: string;
  compare: string;
};

function buildPopupHtml(s: School, locale: string, labels: PopupLabels): string {
  const name = escapeHtml(s.namaSekolah || s.kodSekolah);
  const kod = encodeURIComponent(s.kodSekolah);
  const state = escapeHtml((s.negeri || "").trim() || "");
  const type = escapeHtml((s.jenis || "").trim() || "");
  const ppd = escapeHtml((s.ppd || "").trim() || "");
  const bandar = escapeHtml((s.bandar || "").trim() || "");
  const poskod = escapeHtml(String(s.poskod ?? "").trim());
  const enrolmen = typeof s.enrolmen === "number" ? s.enrolmen : null;
  const guru = typeof s.guru === "number" ? s.guru : null;
  const ptr =
    enrolmen != null && guru != null && guru > 0 ? (enrolmen / guru).toFixed(1) : null;

  const details: string[] = [];
  details.push(`<p style="margin:0 0 4px;font-size:12px;color:#6b7280;">${labels.code}: ${escapeHtml(s.kodSekolah)}</p>`);
  if (state || ppd) details.push(`<p style="margin:0 0 4px;font-size:12px;color:#6b7280;">${state}${state && ppd ? " · " : ""}${ppd}</p>`);
  if (bandar || poskod) details.push(`<p style="margin:0 0 4px;font-size:12px;color:#6b7280;">${bandar} ${poskod}</p>`);
  if (enrolmen != null) details.push(`<p style="margin:0 0 4px;font-size:12px;color:#6b7280;">${labels.enrolment}: ${enrolmen}</p>`);
  if (ptr != null) details.push(`<p style="margin:0;font-size:12px;color:#6b7280;">${labels.ptr}: ${ptr}</p>`);

  return `
<div style="min-width:260px;padding:0;font-family:inherit;">
  <div style="display:flex;gap:10px;margin-bottom:10px;">
    <div style="width:48px;height:48px;background:#e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#6b7280;flex-shrink:0;">${escapeHtml(labels.logoPlaceholder)}</div>
    <div style="flex:1;min-width:0;">
      <a href="/${locale}/${kod}" style="font-weight:600;font-size:14px;color:#2563eb;text-decoration:none;line-height:1.3;">${name}</a>
    </div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
    ${state ? `<span style="background:rgba(201,162,39,0.2);color:#b45309;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:500;">${state}</span>` : ""}
    ${type ? `<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:500;">${type}</span>` : ""}
  </div>
  <div style="margin-bottom:10px;">${details.join("")}</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    <a href="/${locale}/${kod}" style="display:inline-block;padding:6px 12px;background:#c9a227;color:white!important;border-radius:6px;font-size:12px;font-weight:500;text-decoration:none;">${escapeHtml(labels.viewDetails)}</a>
    <a href="/${locale}/compare" style="display:inline-block;padding:6px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;text-decoration:none;color:#374151;">${escapeHtml(labels.compare)}</a>
  </div>
</div>`;
}
