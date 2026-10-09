/**
 * athleteProgressInsight.ts — Veredicto determinista de Mi progreso.
 * Contexto: una frase para el atleta; sin IA ni copy de coherence de entrenador.
 * @author Frontend Team
 * @since v1.0.3
 */

import type { AdherenceSnapshot, RecentRecordRow } from "./athleteProgressUtils";

export interface AthleteProgressInsightInput {
    personalRecords: RecentRecordRow[];
    consecutiveWeeks: number;
    adherence: AdherenceSnapshot;
    previousAdherence: AdherenceSnapshot | null;
    lifetimeCompleted: number;
    nextSessionName: string | null;
    hasActivePlan: boolean;
}

export interface AthleteProgressInsight {
    kind:
        | "pr"
        | "streak"
        | "adherence_up"
        | "welcome"
        | "resume";
    headline: string;
    subline: string | null;
}

function formatKg(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}

export function buildAthleteProgressInsight(
    input: AthleteProgressInsightInput
): AthleteProgressInsight | null {
    const latestPr = input.personalRecords[0];
    if (latestPr?.maxWeight != null) {
        const sub =
            input.personalRecords.length > 1
                ? `${input.personalRecords.length} marcas personales en este periodo`
                : null;
        return {
            kind: "pr",
            headline: `Nueva marca en ${latestPr.exerciseName}: ${formatKg(latestPr.maxWeight)} kg`,
            subline: sub,
        };
    }

    if (input.consecutiveWeeks >= 3) {
        return {
            kind: "streak",
            headline: `${input.consecutiveWeeks} semanas seguidas entrenando`,
            subline: null,
        };
    }

    if (
        input.previousAdherence?.percent != null &&
        input.adherence.percent != null &&
        input.adherence.percent - input.previousAdherence.percent >= 10
    ) {
        return {
            kind: "adherence_up",
            headline: "Mejor tramo que el anterior",
            subline: `Adherencia ${input.adherence.percent}%`,
        };
    }

    if (input.lifetimeCompleted >= 1 && input.lifetimeCompleted <= 3) {
        return {
            kind: "welcome",
            headline: `Buen comienzo: ya llevas ${input.lifetimeCompleted} ${
                input.lifetimeCompleted === 1 ? "sesión" : "sesiones"
            }`,
            subline: null,
        };
    }

    if (
        input.hasActivePlan &&
        input.adherence.percent != null &&
        input.adherence.percent < 50 &&
        input.nextSessionName
    ) {
        return {
            kind: "resume",
            headline: "Puedes retomar",
            subline: `Tu próxima sesión es ${input.nextSessionName}`,
        };
    }

    return null;
}
