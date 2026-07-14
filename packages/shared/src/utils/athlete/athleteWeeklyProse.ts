/**
 * athleteWeeklyProse.ts — Prosa semanal determinista (tono entrenador).
 * Mirror: backend/app/services/athlete_weekly_prose.py
 */

import type { AthleteWeeklySummary } from "../../types/athleteWeeklySummary";

export const LOW_VOLUME_WEEK_MAX_PLANNED = 2;

function adherencePct(rate: number): number {
    return rate <= 1 ? Math.round(rate * 100) : Math.round(rate);
}

function formatWeightEs(value: number): string {
    return String(value).replace(".", ",");
}

function lowVolumeClosedLine(planned: number, pct: number): string {
    if (planned === 1) {
        return (
            `Esta semana tenías una sesión en el plan y la completaste (${pct}%). ` +
            "Cuando el plan sume más días, aquí verás tendencias de carga y récords."
        );
    }
    return (
        `Completaste las dos sesiones previstas esta semana (${pct}%). ` +
        "Mantén el ritmo si la frecuencia del plan se mantiene o aumenta."
    );
}

export function buildDeterministicWeeklyProse(
    summary: AthleteWeeklySummary
): string {
    const { adherence, personal_records, training_streak, feedback } = summary;
    const planned = adherence.sessions_planned;
    const completed = adherence.sessions_completed;
    const rate = adherence.adherence_rate;
    const parts: string[] = [];

    if (planned > 0) {
        const pct = adherencePct(rate);
        const weekClosed = completed >= planned;
        const lowVolume = planned <= LOW_VOLUME_WEEK_MAX_PLANNED;

        if (weekClosed && lowVolume) {
            parts.push(lowVolumeClosedLine(planned, pct));
        } else if (weekClosed) {
            parts.push(
                `Cerraste la semana con ${completed} de ${planned} sesiones (${pct}%). ` +
                    "La adherencia al plan es el primer indicador que revisamos."
            );
        } else if (completed > 0) {
            parts.push(
                `Llevas ${completed} de ${planned} sesiones esta semana (${pct}%). ` +
                    "Queda margen para cerrar el objetivo semanal del plan."
            );
        } else {
            parts.push(
                "Aún no hay sesiones completadas esta semana. " +
                    "Cuando entrenes, el registro te dará una foto clara del progreso."
            );
        }
    }

    for (const pr of personal_records.slice(0, 2)) {
        const name = pr.exercise_name || "ejercicio";
        let line = `Marcaste un récord en ${name}: ${formatWeightEs(pr.max_weight)} kg`;
        if (pr.previous_max_weight != null && pr.previous_max_weight > 0) {
            line += ` (antes ${formatWeightEs(pr.previous_max_weight)} kg)`;
        }
        parts.push(`${line}.`);
    }

    if (training_streak >= 3) {
        parts.push(
            `Llevas ${training_streak} días seguidos entrenando; la consistencia sostiene la progresión.`
        );
    }

    if (feedback.has_trainer_response) {
        const sessionName = feedback.latest_session_name ?? "tu última sesión";
        parts.push(`Tu entrenador dejó una respuesta sobre ${sessionName}.`);
    }

    if (parts.length === 0) {
        return "Cada sesión que registras aporta datos para ajustar carga y volumen con tu entrenador.";
    }

    return parts.join(" ");
}

export function isLowVolumeWeek(sessionsPlanned: number): boolean {
    return sessionsPlanned > 0 && sessionsPlanned <= LOW_VOLUME_WEEK_MAX_PLANNED;
}
