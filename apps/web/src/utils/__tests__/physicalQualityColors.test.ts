import { describe, it, expect, beforeEach } from "vitest";
import {
  getPhysicalQualityColor,
  resetFallbackCache,
} from "@nexia/shared/utils/physicalQualityColors";

beforeEach(() => {
  resetFallbackCache();
});

describe("getPhysicalQualityColor", () => {
  it("returns a known color for 'strength'", () => {
    const result = getPhysicalQualityColor("strength");
    expect(result.hex).toBeTruthy();
    expect(typeof result.hex).toBe("string");
    expect(result.bgClass).toBeTruthy();
  });

  it("returns a known color for 'hypertrophy'", () => {
    const result = getPhysicalQualityColor("hypertrophy");
    expect(result.hex).toBeTruthy();
  });

  it("returns aggregate variety blue for general slug (not catalog palette)", () => {
    const result = getPhysicalQualityColor("general");
    expect(result.hex).toBe("#0E7490");
  });

  it("uses display_order for catalog slugs when provided", () => {
    const first = getPhysicalQualityColor("fuerza_maxima", { displayOrder: 1 });
    const second = getPhysicalQualityColor("hipertrofia", { displayOrder: 2 });
    expect(first.hex).not.toBe(second.hex);
  });

  it("returns a known color for 'endurance'", () => {
    const result = getPhysicalQualityColor("endurance");
    expect(result.hex).toBeTruthy();
  });

  it("returns a known color for 'power'", () => {
    const result = getPhysicalQualityColor("power");
    expect(result.hex).toBeTruthy();
  });

  it("returns a known color for 'cardio'", () => {
    const result = getPhysicalQualityColor("cardio");
    expect(result.hex).toBeTruthy();
  });

  it("returns a known color for 'mobility'", () => {
    const result = getPhysicalQualityColor("mobility");
    expect(result.hex).toBeTruthy();
  });

  it("is case-insensitive for known slugs", () => {
    const lower = getPhysicalQualityColor("strength");
    const upper = getPhysicalQualityColor("Strength");
    expect(lower.hex).toBe(upper.hex);
  });

  it("returns a fallback color for unknown slugs", () => {
    const result = getPhysicalQualityColor("flexibility");
    expect(result.hex).toBeTruthy();
    expect(result.bgClass).toBeTruthy();
  });

  it("returns the same fallback for the same unknown slug", () => {
    const first = getPhysicalQualityColor("unknown_quality");
    const second = getPhysicalQualityColor("unknown_quality");
    expect(first.hex).toBe(second.hex);
  });

  it("assigns stable colors for the same unknown slug", () => {
    const a = getPhysicalQualityColor("slug_a");
    const b = getPhysicalQualityColor("slug_a");
    expect(a.hex).toBe(b.hex);
  });

  it("resetFallbackCache clears the stable slug cache", () => {
    getPhysicalQualityColor("cached_slug");
    resetFallbackCache();
    expect(getPhysicalQualityColor("cached_slug").hex).toBeTruthy();
  });
});
