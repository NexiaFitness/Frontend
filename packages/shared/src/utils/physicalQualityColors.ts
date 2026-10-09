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

/** Misma paleta estable que usa el fallback por slug (QualityShareBar / periodización). */
export const PHYSICAL_QUALITY_PALETTE: PhysicalQualityColor[] = [
  { hex: "#0891B2", bgClass: "bg-cyan-600" },
  { hex: "#DB2777", bgClass: "bg-pink-600" },
  { hex: "#4F46E5", bgClass: "bg-indigo-600" },
  { hex: "#059669", bgClass: "bg-emerald-600" },
];

/**
 * Reparto agregado «General» / sin foco único.
 * Azul apagado, fuera de PHYSICAL_QUALITY_PALETTE (no compite con cualidades del catálogo).
 */
export const AGGREGATE_VARIETY_QUALITY_COLOR: PhysicalQualityColor = {
  hex: "#0E7490",
  bgClass: "bg-cyan-700",
};

const fallbackCache = new Map<string, PhysicalQualityColor>();

export interface PhysicalQualityCatalogEntry {
  name: string;
  slug: string;
  display_order?: number;
}

export interface PhysicalQualityColorOptions {
  /** Orden en catálogo BE (physical_qualities.display_order). */
  displayOrder?: number;
}

function isNeutralAggregateSlug(slug: string): boolean {
  const key = slug.toLowerCase();
  return key === "general" || key === "mixto" || key === "sin_foco";
}

function stablePaletteColorForSlug(slug: string): PhysicalQualityColor {
  const cached = fallbackCache.get(slug);
  if (cached) return cached;

  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  const color = PHYSICAL_QUALITY_PALETTE[hash % PHYSICAL_QUALITY_PALETTE.length];
  fallbackCache.set(slug, color);
  return color;
}

function colorFromDisplayOrder(displayOrder: number): PhysicalQualityColor {
  const index = Math.max(0, displayOrder - 1) % PHYSICAL_QUALITY_PALETTE.length;
  return PHYSICAL_QUALITY_PALETTE[index];
}

/** Resuelve slug de catálogo a partir del nombre mostrado en analytics. */
export function resolvePhysicalQualitySlug(
  displayName: string,
  catalog?: PhysicalQualityCatalogEntry[]
): string {
  const normalized = displayName.trim().toLowerCase();
  if (catalog?.length) {
    const byName = catalog.find((c) => c.name.trim().toLowerCase() === normalized);
    if (byName) return byName.slug;
    const bySlug = catalog.find((c) => c.slug.trim().toLowerCase() === normalized);
    if (bySlug) return bySlug.slug;
  }
  return normalized
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "_");
}

/**
 * Color por slug de cualidad (canónico FE: entrenador + atleta).
 * Con displayOrder del catálogo → misma posición estable que en bloques de periodización.
 */
export function getPhysicalQualityColor(
  slug: string,
  options?: PhysicalQualityColorOptions
): PhysicalQualityColor {
  const key = slug.toLowerCase();

  if (isNeutralAggregateSlug(key)) {
    return AGGREGATE_VARIETY_QUALITY_COLOR;
  }

  const testCat = SLUG_TO_TEST_CATEGORY[key];
  if (testCat) {
    const info = TEST_CATEGORIES[testCat];
    return {
      hex: info.color,
      bgClass: HEX_TO_BG_CLASS[info.color] ?? "bg-muted-foreground",
    };
  }

  if (options?.displayOrder != null && options.displayOrder > 0) {
    return colorFromDisplayOrder(options.displayOrder);
  }

  return stablePaletteColorForSlug(key);
}

export function resetFallbackCache(): void {
  fallbackCache.clear();
}
