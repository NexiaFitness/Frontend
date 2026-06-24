/**
 * clientExerciseLoadPresentation — Copy y variantes visuales RM formal vs e1RM (CEO-01).
 * Única fuente de textos entrenador y clases por estado del card formal.
 */

export type FormalRmCardState = "recorded" | "linked_pending" | "unlinked";

export function resolveFormalRmCardState(
    hasFormal: boolean,
    isLinked: boolean,
): FormalRmCardState {
    if (hasFormal) return "recorded";
    if (isLinked) return "linked_pending";
    return "unlinked";
}

export function formalRmCardClassName(state: FormalRmCardState): string {
    if (state === "recorded") {
        return "rounded-lg border border-primary/35 bg-primary/5 p-4 space-y-3";
    }
    return "rounded-lg border border-dashed border-border bg-surface p-4 space-y-3";
}

export function formalRmIconClassName(state: FormalRmCardState): string {
    return state === "recorded"
        ? "size-4 text-primary"
        : "size-4 text-muted-foreground";
}

export function formalRmBadgeLabel(state: FormalRmCardState): string {
    switch (state) {
        case "recorded":
            return "Tests físicos";
        case "linked_pending":
            return "Pendiente";
        default:
            return "Sin vincular";
    }
}

export function formalRmBadgeVariant(
    state: FormalRmCardState,
): "default" | "outline" {
    return state === "recorded" ? "default" : "outline";
}

export const EXERCISE_LOAD_PANEL_SUBTITLE =
    "Compara el RM del test (Tests físicos) con el 1RM estimado de las series en sesión.";

export const EXERCISE_LOAD_ESTIMATED_BADGE = "Epley · Sesión";

export const EXERCISE_LOAD_NO_ESTIMATE =
    "Sin series con peso en sesión para estimar 1RM en este periodo.";

export const EXERCISE_LOAD_EMPTY =
    "Sin test formal ni series con peso para estimar 1RM en este periodo.";
