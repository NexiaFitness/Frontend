import { TEST_CATEGORIES, type TestCategory } from "../types/testing";

export interface PhysicalQualityColor {
  hex: string;
  /** Tailwind bg class for dots, bars, progress fills */
  bgClass: string;
}

const SLUG_TO_TEST_CATEGORY: Record<string, TestCategory> = {
  strength: "strength",
  hypertrophy: "anaerobic",
  endurance: "aerobic",
  power: "power",
  cardio: "speed",
  mobility: "mobility",
  aerobic: "aerobic",
  anaerobic: "anaerobic",
  speed: "speed",
};

const HEX_TO_BG_CLASS: Record<string, string> = {
  "#DC2626": "bg-red-600",
  "#EA580C": "bg-orange-600",
  "#CA8A04": "bg-yellow-600",
  "#16A34A": "bg-green-600",
  "#2563EB": "bg-blue-600",
  "#9333EA": "bg-purple-600",
};

const FALLBACK_PALETTE: PhysicalQualityColor[] = [
  { hex: "#0891B2", bgClass: "bg-cyan-600" },
  { hex: "#DB2777", bgClass: "bg-pink-600" },
  { hex: "#4F46E5", bgClass: "bg-indigo-600" },
  { hex: "#059669", bgClass: "bg-emerald-600" },
];

const fallbackCache = new Map<string, PhysicalQualityColor>();
let fallbackIdx = 0;

export function getPhysicalQualityColor(slug: string): PhysicalQualityColor {
  const testCat = SLUG_TO_TEST_CATEGORY[slug.toLowerCase()];
  if (testCat) {
    const info = TEST_CATEGORIES[testCat];
    return {
      hex: info.color,
      bgClass: HEX_TO_BG_CLASS[info.color] ?? "bg-muted-foreground",
    };
  }

  const cached = fallbackCache.get(slug);
  if (cached) return cached;

  const color = FALLBACK_PALETTE[fallbackIdx % FALLBACK_PALETTE.length];
  fallbackIdx++;
  fallbackCache.set(slug, color);
  return color;
}

export function resetFallbackCache(): void {
  fallbackCache.clear();
  fallbackIdx = 0;
}
