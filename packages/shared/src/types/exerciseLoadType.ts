/**
 * exerciseLoadType.ts — Tipo de carga de ejercicio (catálogo S2).
 *
 * Alineado con backend LoadTypeEnum (`app/db/models/base.py`) y
 * `normalize_load_type` en `tipo_carga_classifier.py`.
 */

export const EXERCISE_LOAD_TYPE = {
    BODYWEIGHT: "bodyweight",
    EXTERNAL: "external",
    MIXED: "mixed",
} as const;

export type ExerciseLoadType = (typeof EXERCISE_LOAD_TYPE)[keyof typeof EXERCISE_LOAD_TYPE];

const CANONICAL_VALUES: ReadonlySet<string> = new Set(Object.values(EXERCISE_LOAD_TYPE));

const LEGACY_ALIASES: Record<string, ExerciseLoadType> = {
    ext: EXERCISE_LOAD_TYPE.EXTERNAL,
    free_weight: EXERCISE_LOAD_TYPE.EXTERNAL,
};

/** Normaliza legacy + enum; null si vacío o desconocido. */
export function normalizeExerciseLoadType(
    value: string | null | undefined
): ExerciseLoadType | null {
    if (!value?.trim()) return null;
    const cleaned = value.trim().toLowerCase();
    const aliased = LEGACY_ALIASES[cleaned];
    if (aliased) return aliased;
    if (CANONICAL_VALUES.has(cleaned)) {
        return cleaned as ExerciseLoadType;
    }
    return null;
}

export function isExerciseLoadType(value: string): value is ExerciseLoadType {
    return normalizeExerciseLoadType(value) !== null;
}

export const EXERCISE_LOAD_TYPE_FILTER_OPTIONS: ReadonlyArray<{
    value: ExerciseLoadType;
    label: string;
}> = [
    { value: EXERCISE_LOAD_TYPE.BODYWEIGHT, label: "Peso corporal" },
    { value: EXERCISE_LOAD_TYPE.EXTERNAL, label: "Carga externa" },
    { value: EXERCISE_LOAD_TYPE.MIXED, label: "Mixta" },
];

/** Etiqueta UI en español para chips, badges y filtros. */
export function exerciseLoadTypeLabel(value: string | null | undefined): string {
    const normalized = normalizeExerciseLoadType(value);
    if (!normalized) return "";
    const match = EXERCISE_LOAD_TYPE_FILTER_OPTIONS.find((o) => o.value === normalized);
    return match?.label ?? normalized;
}

/** Opciones de filtro «Todos» + enum canónico (valor API = value). */
export function exerciseLoadTypeMatchesFilter(
    exerciseLoadType: string | null | undefined,
    filter: "all" | ExerciseLoadType
): boolean {
    if (filter === "all") return true;
    return normalizeExerciseLoadType(exerciseLoadType) === filter;
}
