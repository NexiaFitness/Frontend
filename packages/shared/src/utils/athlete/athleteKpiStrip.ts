/**
 * athleteKpiStrip.ts — Datos KPI strip dashboard (motivacional, sin guiones vacíos).
 */

export interface AthleteKpiStripData {
    adherencePrimary: string;
    adherenceLabel: string;
    streakPrimary: string;
    streakLabel: string;
    showFlame: boolean;
    streakMotivational: boolean;
}

export interface KpiStripInput {
    sessionsPlanned: number;
    sessionsCompleted: number;
    /** D10: completed extras outside the plan (optional). */
    sessionsExtraCompleted?: number;
    adherencePercent: number | null;
    trainingStreak: number;
    daysUntilNextSession?: number | null;
}

function extrasLabelSuffix(extra: number): string {
    if (extra <= 0) return "";
    return extra === 1 ? " · +1 extra" : ` · +${extra} extras`;
}

export function buildAthleteKpiStripData(input: KpiStripInput): AthleteKpiStripData {
    const {
        sessionsPlanned,
        sessionsCompleted,
        sessionsExtraCompleted = 0,
        adherencePercent,
        trainingStreak,
        daysUntilNextSession,
    } = input;
    const extraSuffix = extrasLabelSuffix(sessionsExtraCompleted);

    let adherencePrimary: string;
    let adherenceLabel: string;

    if (sessionsPlanned <= 0) {
        adherencePrimary = "—";
        adherenceLabel =
            sessionsExtraCompleted > 0
                ? `${sessionsExtraCompleted === 1 ? "1 sesión extra" : `${sessionsExtraCompleted} sesiones extra`}`
                : "Semana de descanso";
    } else if (sessionsPlanned === 1) {
        adherencePrimary = `${sessionsCompleted}/1`;
        adherenceLabel =
            sessionsCompleted === 1
                ? `Sesión del plan hecha${extraSuffix}`
                : "Te queda 1 sesión";
    } else {
        adherencePrimary =
            adherencePercent != null
                ? `${adherencePercent}%`
                : `${sessionsCompleted}/${sessionsPlanned}`;
        adherenceLabel = `${sessionsCompleted}/${sessionsPlanned} del plan${extraSuffix}`;
    }

    let streakPrimary: string;
    let streakLabel: string;
    let showFlame = false;
    let streakMotivational = false;

    if (trainingStreak > 0) {
        streakPrimary = String(trainingStreak);
        streakLabel = trainingStreak === 1 ? "día seguido" : "días seguidos";
        showFlame = true;
    } else if (sessionsPlanned > 0 && sessionsCompleted === 0) {
        streakMotivational = true;
        if (daysUntilNextSession === 1) {
            streakPrimary = "Mañana";
            streakLabel = "Arranca tu racha";
        } else if (daysUntilNextSession === 0) {
            streakPrimary = "Hoy";
            streakLabel = "Empieza tu racha";
        } else {
            streakPrimary = "0";
            streakLabel = "Primera sesión pendiente";
        }
    } else {
        streakMotivational = true;
        streakPrimary = "0";
        streakLabel = "Empieza hoy";
    }

    return {
        adherencePrimary,
        adherenceLabel,
        streakPrimary,
        streakLabel,
        showFlame,
        streakMotivational,
    };
}
