/**
 * exerciseUiBucket.ts — Utilidades de derivación de ui_bucket para ejercicios
 *
 * Implementa la Regla 1 de FEATURE_UX_MEJORA_ESTRUCTURA_SEMANAL §9.5:
 * - Solo role = primary entra en el cálculo.
 * - Precedencia de buckets: LOWER > UPPER > CORE > POWER_LOCOMOTION > ACCESSORY.
 * - Empate dentro del mismo bucket: gana el pattern_id numérico más bajo.
 * - Sin primarios: null (estado anómalo; no usar secondary para bucket).
 *
 * @author Frontend Team
 * @since Fase B — FEATURE_UX_MEJORA_ESTRUCTURA_SEMANAL
 */

import type { MovementPatternUiBucket, MovementPatternRole } from "../types/exercise";

// ========================================
// ETIQUETAS UI
// ========================================

/** Mapa oficial ui_bucket → etiqueta en español (§9.2, §9.5 Regla 4) */
export const UI_BUCKET_LABELS: Record<MovementPatternUiBucket, string> = {
    LOWER: "Tren inferior",
    UPPER: "Tren superior",
    CORE: "Core / Estabilidad",
    POWER_LOCOMOTION: "Potencia / Locomoción",
    ACCESSORY: "Accesorio / Prehab",
};

// ========================================
// PRECEDENCIA DE BUCKETS (Regla 1)
// ========================================

/** Orden de precedencia: número más bajo = mayor prioridad. */
/** Orden de precedencia visual (mayor → menor) y orden de grupos en UI. */
export const UI_BUCKET_ORDER: MovementPatternUiBucket[] = [
    "LOWER",
    "UPPER",
    "CORE",
    "POWER_LOCOMOTION",
    "ACCESSORY",
];

const UI_BUCKET_PRECEDENCE: Record<MovementPatternUiBucket, number> = {
    LOWER: 1,
    UPPER: 2,
    CORE: 3,
    POWER_LOCOMOTION: 4,
    ACCESSORY: 5,
};

const VALID_BUCKETS = new Set<string>(Object.keys(UI_BUCKET_PRECEDENCE));

// ========================================
// HELPER DE DERIVACIÓN
// ========================================

/** Entrada mínima para el helper: acepta ExerciseMovementPattern, VariantMovementPattern, etc. */
export interface ExerciseUiBucketInput {
    role: MovementPatternRole | null | string;
    movement_pattern?: {
        id: number;
        ui_bucket?: MovementPatternUiBucket | string;
    } | null;
}

/**
 * Deriva el `ui_bucket` de presentación/filtrado de un ejercicio (o variante)
 * a partir de sus patrones asociados.
 *
 * Reglas (§9.5 Regla 1):
 * 1. Solo se consideran filas con `role === 'primary'`.
 * 2. Se toma el `ui_bucket` de cada primary válido.
 * 3. Gana el bucket con mayor precedencia (número más bajo en `UI_BUCKET_PRECEDENCE`).
 * 4. Si varios primarios comparten el mismo bucket ganador, desempata el `pattern_id` más bajo.
 * 5. Si no hay primarios, devuelve `null`.
 *
 * @param patterns - Relaciones ejercicio-patrón (ej. `ExerciseMovementPattern[]`)
 * @returns `MovementPatternUiBucket` o `null` si no aplica.
 */
export function exerciseUiBucket(
    patterns: readonly ExerciseUiBucketInput[] | null | undefined
): MovementPatternUiBucket | null {
    if (!patterns || patterns.length === 0) return null;

    const candidates: { bucket: MovementPatternUiBucket; patternId: number }[] = [];

    for (const p of patterns) {
        if (!p) continue;
        if (p.role !== "primary") continue;

        const mp = p.movement_pattern;
        if (!mp) continue;

        const rawBucket = mp.ui_bucket;
        if (!rawBucket) continue;

        const bucket = String(rawBucket).trim().toUpperCase();
        if (!VALID_BUCKETS.has(bucket)) continue;

        candidates.push({
            bucket: bucket as MovementPatternUiBucket,
            patternId: mp.id,
        });
    }

    if (candidates.length === 0) return null;

    // Ordenar por: precedencia ascendente, luego patternId ascendente
    candidates.sort((a, b) => {
        const precDiff = UI_BUCKET_PRECEDENCE[a.bucket] - UI_BUCKET_PRECEDENCE[b.bucket];
        if (precDiff !== 0) return precDiff;
        return a.patternId - b.patternId;
    });

    return candidates[0].bucket;
}

/**
 * Versión segura que devuelve siempre un string (útil para UI cuando se prefiere
 * mostrar un bucket por defecto en lugar de null).
 *
 * @param patterns - Relaciones ejercicio-patrón
 * @param fallback - Bucket por defecto si no hay primarios (default: `"ACCESSORY"`)
 * @returns `MovementPatternUiBucket` nunca null.
 */
export function exerciseUiBucketOrFallback(
    patterns: readonly ExerciseUiBucketInput[] | null | undefined,
    fallback: MovementPatternUiBucket = "ACCESSORY"
): MovementPatternUiBucket {
    return exerciseUiBucket(patterns) ?? fallback;
}
