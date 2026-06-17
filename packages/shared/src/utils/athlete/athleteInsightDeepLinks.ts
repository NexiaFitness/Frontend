/**
 * athleteInsightDeepLinks.ts — Enlaces profundos del insight V01 (F3b-FE-05).
 * Progreso siempre explícito; segundo enlace contextual según datos F3.
 * Sin duplicar footer (sesiones/plan/cuenta).
 */

import type { AthleteDashboardMode } from "./athleteDashboardMode";

export type InsightDeepLinkAction =
    | "progress"
    | "progress_exercise"
    | "feedback_history";

export interface InsightDeepLink {
    id: string;
    label: string;
    hint: string;
    action: InsightDeepLinkAction;
    exerciseId?: number;
}

export interface InsightDeepLinksInput {
    mode: AthleteDashboardMode;
    hasTrainerResponse: boolean;
    hasPersonalRecord: boolean;
    topRecordExerciseId?: number;
    topRecordExerciseName?: string;
}

function buildSecondaryLink(input: InsightDeepLinksInput): InsightDeepLink | null {
    if (input.hasTrainerResponse) {
        return {
            id: "feedback-history",
            label: "Historial de notas",
            hint: "Toda la conversación con tu entrenador",
            action: "feedback_history",
        };
    }

    if (input.hasPersonalRecord && input.topRecordExerciseId != null) {
        const name = input.topRecordExerciseName?.trim() || "tu ejercicio";
        return {
            id: "pr-evolution",
            label: `Evolución de ${name}`,
            hint: "Gráfica y récords del movimiento",
            action: "progress_exercise",
            exerciseId: input.topRecordExerciseId,
        };
    }

    if (
        input.mode === "train_today_done" ||
        input.mode === "week_done"
    ) {
        return {
            id: "feedback-after-session",
            label: "Cuéntale cómo te fue",
            hint: "Deja feedback de tu última sesión",
            action: "feedback_history",
        };
    }

    return {
        id: "feedback-history",
        label: "Historial de notas",
        hint: "Mensajes y feedback con tu entrenador",
        action: "feedback_history",
    };
}

/**
 * Máximo 2 enlaces: progreso (fijo) + uno contextual.
 * Futuro F3: share_summary (F3b-FE-04 share), ai_summary (F3d).
 */
export function buildInsightDeepLinks(input: InsightDeepLinksInput): InsightDeepLink[] {
    const links: InsightDeepLink[] = [
        {
            id: "progress",
            label: "Ver mi progreso",
            hint: "Pesos, récords y evolución semanal",
            action: "progress",
        },
    ];

    const secondary = buildSecondaryLink(input);
    if (secondary) {
        links.push(secondary);
    }

    return links;
}
