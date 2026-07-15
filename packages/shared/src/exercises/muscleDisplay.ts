/**
 * Prime-mover display logic (DC-11) — shared business rules for web + future RN.
 * API must return muscles sorted: PMs by priority ASC, then other roles.
 */

export const MAX_MUSCLE_BADGE_CHIPS = 3;

export interface MuscleRoleRef {
    name_es?: string | null;
    name?: string | null;
    name_en?: string | null;
    role?: string | null;
    priority?: number | null;
}

export interface ExerciseMuscleFacetInput {
    muscles?: MuscleRoleRef[] | null;
    musculatura_principal?: string | null;
}

export function isPrimeMoverRole(role: string | undefined | null): boolean {
    const r = (role || "").toLowerCase().replace(/\s+/g, "_");
    return r === "prime_mover" || r === "primary";
}

function muscleDisplayName(m: MuscleRoleRef): string {
    return (m.name_es || m.name || m.name_en || "").trim();
}

function primaryMuscleSegment(musculatura: string | null | undefined): string {
    if (!musculatura) return "";
    return musculatura.split(",")[0]?.trim() ?? "";
}

/** Prime movers ordered by API priority (fallback: array order). */
export function exercisePrimeMoverRefs(ex: ExerciseMuscleFacetInput): MuscleRoleRef[] {
    const muscles = ex.muscles;
    if (!Array.isArray(muscles) || muscles.length === 0) return [];

    const prime = muscles.filter((m) => isPrimeMoverRole(m.role));
    if (prime.length === 0) return [];

    const hasPriority = prime.some((m) => (m.priority ?? 0) > 0);
    if (hasPriority) {
        return [...prime].sort(
            (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
        );
    }
    return prime;
}

/** Display labels for prime mover chips (max N). */
export function exercisePrimeMoverLabels(
    ex: ExerciseMuscleFacetInput,
    maxChips: number = MAX_MUSCLE_BADGE_CHIPS
): string[] {
    const labels = exercisePrimeMoverRefs(ex)
        .map(muscleDisplayName)
        .filter(Boolean);
    if (labels.length > 0) return labels.slice(0, maxChips);

    const legacy = primaryMuscleSegment(ex.musculatura_principal);
    if (legacy) return [legacy];
    return (ex.musculatura_principal || "").trim()
        ? [(ex.musculatura_principal || "").trim()]
        : [];
}

/** First chip — search facets, legacy callers migrating to multi-chip. */
export function muscleFacetLabel(ex: ExerciseMuscleFacetInput): string {
    const labels = exercisePrimeMoverLabels(ex, 1);
    return labels[0] ?? "";
}

/** Filter / search: match if any prime_mover label equals filter (case-insensitive). */
export function exerciseMatchesMuscleFilter(
    ex: ExerciseMuscleFacetInput,
    filterLabel: string
): boolean {
    const needle = filterLabel.trim().toLowerCase();
    if (!needle) return true;
    return exercisePrimeMoverLabels(ex).some(
        (label) => label.trim().toLowerCase() === needle
    );
}

/** Search haystack includes any PM label. */
export function exerciseMuscleSearchText(ex: ExerciseMuscleFacetInput): string {
    return exercisePrimeMoverLabels(ex).join(" ").toLowerCase();
}

/** All muscle labels for filter option derivation (unique PM labels). */
export function collectPrimeMoverFilterOptions(
    exercises: ExerciseMuscleFacetInput[]
): string[] {
    const set = new Set<string>();
    for (const ex of exercises) {
        for (const label of exercisePrimeMoverLabels(ex)) {
            if (label.trim()) set.add(label.trim());
        }
    }
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
}
