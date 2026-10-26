/**
 * exerciseUiBucket.ts — Orden y etiquetas de ui_bucket para patrones de movimiento.
 *
 * Alineado con backend `movement_patterns.ui_bucket` y tokens CSS bucket-* en web.
 * `planningPatternOptions` aplica `is_planning_selectable` (taxonomía v2, H2) a los selectores.
 */

import type { MovementPattern, MovementPatternUiBucket } from "../types/exercise";

export const UI_BUCKET_ORDER: readonly MovementPatternUiBucket[] = [
    "LOWER",
    "UPPER",
    "CORE",
    "POWER_LOCOMOTION",
    "ACCESSORY",
] as const;

export const UI_BUCKET_LABELS: Record<MovementPatternUiBucket, string> = {
    LOWER: "Tren inferior",
    UPPER: "Tren superior",
    CORE: "Core / Estabilidad",
    POWER_LOCOMOTION: "Potencia / Locomoción",
    ACCESSORY: "Accesorio / Prehab",
};

export type UiBucketTailwindKey =
    | "lower"
    | "upper"
    | "core"
    | "power"
    | "accessory";

const BUCKET_TO_TAILWIND: Record<MovementPatternUiBucket, UiBucketTailwindKey> =
    {
        LOWER: "lower",
        UPPER: "upper",
        CORE: "core",
        POWER_LOCOMOTION: "power",
        ACCESSORY: "accessory",
    };

/** Resuelve ui_bucket desconocido al bucket accesorio por defecto. */
export function uiBucketToTailwindKey(
    bucket: string | null | undefined,
): UiBucketTailwindKey {
    if (bucket != null && bucket in BUCKET_TO_TAILWIND) {
        return BUCKET_TO_TAILWIND[bucket as MovementPatternUiBucket];
    }
    return "accessory";
}

export function uiBucketLabel(bucket: string | null | undefined): string {
    if (bucket != null && bucket in UI_BUCKET_LABELS) {
        return UI_BUCKET_LABELS[bucket as MovementPatternUiBucket];
    }
    return "Otros";
}

/**
 * Patrones que un selector de planificación ofrece: los seleccionables y, además, los ya elegidos
 * aunque hayan dejado de serlo (p. ej. «locomotion»), para que el entrenador pueda verlos y quitarlos.
 */
export function planningPatternOptions(
    catalog: readonly MovementPattern[],
    selectedPatternIds: readonly number[],
): MovementPattern[] {
    const selected = new Set(selectedPatternIds);
    return catalog.filter((p) => p.is_planning_selectable || selected.has(p.id));
}
