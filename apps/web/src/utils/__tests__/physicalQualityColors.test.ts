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

  it("cycles through fallback palette for different unknown slugs", () => {
    const a = getPhysicalQualityColor("slug_a");
    const b = getPhysicalQualityColor("slug_b");
    const c = getPhysicalQualityColor("slug_c");
    const d = getPhysicalQualityColor("slug_d");
    const e = getPhysicalQualityColor("slug_e");
    // After 4 fallbacks, it should wrap around
    expect(e.hex).toBe(a.hex);
    // But b, c, d should differ from a (unless palette is size 1)
    expect(new Set([a.hex, b.hex, c.hex, d.hex]).size).toBe(4);
  });

  it("resetFallbackCache clears the cache", () => {
    const first = getPhysicalQualityColor("cached_slug");
    resetFallbackCache();
    const second = getPhysicalQualityColor("other_slug");
    expect(second.hex).toBe(first.hex); // same index 0 after reset
  });
});
