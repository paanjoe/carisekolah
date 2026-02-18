import { describe, it, expect } from "vitest";
import { schoolTypeBadgeClass } from "./school-detail-utils";

describe("schoolTypeBadgeClass", () => {
  it("returns SK badge classes for SK", () => {
    const c = schoolTypeBadgeClass("SK");
    expect(c).toContain("amber");
  });

  it("returns SMK badge classes for SMK", () => {
    const c = schoolTypeBadgeClass("SMK");
    expect(c).toContain("blue");
  });

  it("returns muted fallback for unknown type", () => {
    const c = schoolTypeBadgeClass("UNKNOWN");
    expect(c).toContain("muted");
  });

  it("returns muted for empty/undefined", () => {
    expect(schoolTypeBadgeClass("")).toContain("muted");
    expect(schoolTypeBadgeClass(undefined)).toContain("muted");
  });
});
