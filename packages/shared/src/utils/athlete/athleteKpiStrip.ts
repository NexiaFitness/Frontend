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
    adherencePercent: number | null;
    trainingStreak: number;
    daysUntilNextSession?: number | null;
}

export function buildAthleteKpiStripData(input: KpiStripInput): AthleteKpiStripData {
    const {
        sessionsPlanned,
        sessionsCompleted,
        adherencePercent,
        trainingStreak,
        daysUntilNextSession,
    } = input;

    let adherencePrimary: string;
    let adherenceLabel: string;

    if (sessionsPlanned <= 0) {
        adherencePrimary = "—";
        adherenceLabel = "Semana de descanso";
    } else if (sessionsPlanned === 1) {
        adherencePrimary = `${sessionsCompleted}/1`;
        adherenceLabel =
            sessionsCompleted === 1
                ? "Sesión hecha esta semana"
                : "Te queda 1 sesión";
    } else {
        adherencePrimary =
            adherencePercent != null
                ? `${adherencePercent}%`
                : `${sessionsCompleted}/${sessionsPlanned}`;
        adherenceLabel = `${sessionsCompleted}/${sessionsPlanned} sesiones`;
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
