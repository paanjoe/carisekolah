import { describe, it, expect } from "vitest";
import {
  getSchoolByKod,
  getAllSchools,
  getSearchSuggestions,
  filterSchools,
  getUniqueNegeri,
  getSchoolComparisonStats,
} from "./schools";

describe("getSchoolByKod", () => {
  it("returns school when code exists (case-insensitive)", () => {
    const school = getSchoolByKod("JBA0001");
    expect(school).toBeDefined();
    expect(school?.kodSekolah).toBe("JBA0001");
    expect(school?.namaSekolah).toBeDefined();
  });

  it("returns same school for lowercase code", () => {
    const school = getSchoolByKod("jba0001");
    expect(school?.kodSekolah).toBe("JBA0001");
  });

  it("returns undefined for unknown code", () => {
    expect(getSchoolByKod("UNKNOWN999")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getSchoolByKod("")).toBeUndefined();
  });
});

describe("getAllSchools", () => {
  it("returns non-empty array", () => {
    const all = getAllSchools();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
    expect(all[0]).toHaveProperty("kodSekolah");
    expect(all[0]).toHaveProperty("namaSekolah");
  });
});

describe("getSearchSuggestions", () => {
  it("returns empty array for query shorter than 2 chars", () => {
    expect(getSearchSuggestions("")).toEqual([]);
    expect(getSearchSuggestions("a")).toEqual([]);
  });

  it("returns suggestions with kodSekolah and optional namaSekolah, negeri", () => {
    const results = getSearchSuggestions("SK", 5);
    expect(Array.isArray(results)).toBe(true);
    results.forEach((s) => {
      expect(s).toHaveProperty("kodSekolah");
      expect(typeof s.kodSekolah).toBe("string");
    });
    if (results.length > 0) {
      expect(results.length).toBeLessThanOrEqual(5);
    }
  });

  it("respects limit parameter", () => {
    const results = getSearchSuggestions("sekolah", 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});

describe("filterSchools", () => {
  it("filters by negeri when provided", () => {
    const filtered = filterSchools({ negeri: "JOHOR" });
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((s) => expect(s.negeri).toBe("JOHOR"));
  });

  it("returns subset when query is provided", () => {
    const all = getAllSchools();
    const filtered = filterSchools({ query: "BATU" });
    expect(filtered.length).toBeLessThanOrEqual(all.length);
  });

  it("returns empty for non-matching negeri", () => {
    const filtered = filterSchools({ negeri: "NONEXISTENT_STATE" });
    expect(filtered).toEqual([]);
  });
});

describe("getUniqueNegeri", () => {
  it("returns sorted non-empty array of strings", () => {
    const negeri = getUniqueNegeri();
    expect(Array.isArray(negeri)).toBe(true);
    expect(negeri.length).toBeGreaterThan(0);
    const sorted = [...negeri].sort();
    expect(negeri).toEqual(sorted);
  });
});

describe("getSchoolComparisonStats", () => {
  it("returns stats for a real school", () => {
    const school = getSchoolByKod("JBA0001");
    expect(school).toBeDefined();
    const all = getAllSchools();
    const stats = getSchoolComparisonStats(all, school!);
    expect(stats).toHaveProperty("schoolPtr");
    expect(stats).toHaveProperty("nationalPtr");
    expect(stats).toHaveProperty("stateName");
    expect(stats).toHaveProperty("typeName");
    expect(stats).toHaveProperty("isPacked");
  });
});
