import type { School } from "@/types/school";
import schoolsData from "@/data/schools.json";

const schools = schoolsData as School[];

export function getAllSchools(): School[] {
  return schools;
}

export function getSchoolByKod(kod: string): School | undefined {
  const normalized = kod?.trim().toUpperCase();
  return schools.find((s) => (s.kodSekolah || "").toUpperCase() === normalized);
}

export function filterSchools(options: {
  query?: string;
  negeri?: string;
  ppd?: string;
  jenis?: string;
  lokasi?: string;
  poskod?: string;
}): School[] {
  let result = [...schools];
  const q = options.query?.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (s) =>
        (s.namaSekolah || "").toLowerCase().includes(q) ||
        (s.kodSekolah || "").toLowerCase().includes(q) ||
        (s.alamat || "").toLowerCase().includes(q) ||
        (s.bandar || "").toLowerCase().includes(q)
    );
  }
  if (options.negeri) {
    const v = options.negeri.trim();
    result = result.filter((s) => (s.negeri || "").trim() === v);
  }
  if (options.ppd) {
    const v = options.ppd.trim();
    result = result.filter((s) => (s.ppd || "").trim() === v);
  }
  if (options.jenis) {
    const v = options.jenis.trim();
    result = result.filter((s) => (s.jenis || "").trim() === v);
  }
  if (options.lokasi) {
    const v = options.lokasi.trim();
    result = result.filter((s) => (s.lokasi || "").trim() === v);
  }
  if (options.poskod) {
    const v = options.poskod.trim();
    result = result.filter((s) => (s.poskod || "").trim() === v);
  }
  return result;
}

export function getUniqueNegeri(): string[] {
  const set = new Set(schools.map((s) => (s.negeri || "").trim()).filter(Boolean));
  return Array.from(set).sort();
}

export function getUniquePpd(): string[] {
  const set = new Set(schools.map((s) => (s.ppd || "").trim()).filter(Boolean));
  return Array.from(set).sort();
}

export function getUniqueJenis(): string[] {
  const set = new Set(schools.map((s) => (s.jenis || "").trim()).filter(Boolean));
  return Array.from(set).sort();
}

export function getUniqueLokasi(): string[] {
  const set = new Set(schools.map((s) => (s.lokasi || "").trim()).filter(Boolean));
  return Array.from(set).sort();
}

export type SchoolSuggestion = { kodSekolah: string; namaSekolah?: string; negeri?: string };

function scoreSchoolMatch(s: School, q: string): number {
  const name = (s.namaSekolah || "").toLowerCase();
  const code = (s.kodSekolah || "").toLowerCase();
  const bandar = (s.bandar || "").toLowerCase();
  const alamat = (s.alamat || "").toLowerCase();
  let score = 0;
  if (name.startsWith(q)) score += 100;
  else if (code.startsWith(q)) score += 90;
  else if (name.includes(q)) score += 50;
  else if (code.includes(q)) score += 40;
  else if (bandar.includes(q)) score += 20;
  else if (alamat.includes(q)) score += 10;
  else return 0;
  // Prefer word-boundary matches: any word in name starting with q
  const words = name.split(/\s+/);
  if (words.some((w) => w.startsWith(q))) score += 30;
  return score;
}

function schoolMatchesQuery(s: School, q: string): boolean {
  const name = (s.namaSekolah || "").toLowerCase();
  const code = (s.kodSekolah || "").toLowerCase();
  const bandar = (s.bandar || "").toLowerCase();
  const alamat = (s.alamat || "").toLowerCase();
  return (
    name.includes(q) ||
    code.includes(q) ||
    bandar.includes(q) ||
    alamat.includes(q)
  );
}

export function getSearchSuggestions(query: string, limit = 12): SchoolSuggestion[] {
  const q = query?.trim().toLowerCase();
  if (!q || q.length < 2) return [];
  const filtered = schools.filter((s) => schoolMatchesQuery(s, q));
  const scored = filtered
    .map((s) => ({ school: s, score: scoreSchoolMatch(s, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => ({
      kodSekolah: x.school.kodSekolah,
      namaSekolah: x.school.namaSekolah,
      negeri: x.school.negeri,
    }));
  return scored;
}

/** Haversine distance in km */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getSchoolsNear(lat: number, lng: number, radiusKm: number): School[] {
  return schools
    .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
    .map((s) => ({ school: s, dist: distanceKm(lat, lng, s.lat!, s.lng!) }))
    .filter((x) => x.dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist)
    .map((x) => x.school);
}
