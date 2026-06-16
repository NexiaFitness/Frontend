/**
 * athleteSessionUtils.ts — Utilidades de fechas y sesiones para portal atleta.
 * Contexto: portal atleta F0, sin DOM.
 * Contratos: agent.md, 09_UX_VISTAS
 * @author Frontend Team
 * @since v6.1.0
 */

import type { TrainingSession } from "../../types/trainingSessions";
import type { SessionStructureView } from "../../sessionProgramming/sessionBlockView";
import type { AthleteFlatExercise } from "../../offline/athleteSessionTypes";

const DAY_LABELS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

/** Fecha local YYYY-MM-DD (sin UTC drift). */
export function toLocalDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function parseSessionDateLocal(sessionDate: string): Date {
    const [y, m, d] = sessionDate.split("-").map(Number);
    return new Date(y, m - 1, d);
}

export function isSameLocalDay(a: Date, b: Date): boolean {
    return toLocalDateKey(a) === toLocalDateKey(b);
}

export function isSessionToday(session: TrainingSession, today = new Date()): boolean {
    if (!session.session_date) return false;
    return isSameLocalDay(parseSessionDateLocal(session.session_date), today);
}

export function formatAthleteDate(isoDate: string): string {
    const date = parseSessionDateLocal(isoDate);
    return date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

export function formatAthleteDateLong(isoDate: string): string {
    const date = parseSessionDateLocal(isoDate);
    return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

export interface WeekDayStripItem {
    dateKey: string;
    label: string;
    dayNumber: number;
    isToday: boolean;
    sessions: TrainingSession[];
}

/** Genera 7 días centrados en la semana actual (Lun–Dom). */
export function buildWeekStrip(sessions: TrainingSession[], reference = new Date()): WeekDayStripItem[] {
    const ref = new Date(reference);
    ref.setHours(0, 0, 0, 0);
    const dayOfWeek = ref.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() + mondayOffset);

    const sessionsByDate = new Map<string, TrainingSession[]>();
    for (const session of sessions) {
        if (!session.session_date) continue;
        const key = session.session_date;
        const list = sessionsByDate.get(key) ?? [];
        list.push(session);
        sessionsByDate.set(key, list);
    }

    const todayKey = toLocalDateKey(reference);
    const items: WeekDayStripItem[] = [];

    for (let i = 0; i < 7; i += 1) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const dateKey = toLocalDateKey(day);
        items.push({
            dateKey,
            label: DAY_LABELS_SHORT[day.getDay()],
            dayNumber: day.getDate(),
            isToday: dateKey === todayKey,
            sessions: sessionsByDate.get(dateKey) ?? [],
        });
    }

    return items;
}

export function findTodaySession(
    sessions: TrainingSession[],
    today = new Date()
): TrainingSession | undefined {
    return sessions.find((s) => isSessionToday(s, today));
}

export function findNextUpcomingSession(
    sessions: TrainingSession[],
    today = new Date()
): TrainingSession | undefined {
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    return [...sessions]
        .filter((s) => {
            if (!s.session_date) return false;
            const d = parseSessionDateLocal(s.session_date);
            return d >= todayStart && s.status !== "completed";
        })
        .sort((a, b) => {
            const da = a.session_date ?? "";
            const db = b.session_date ?? "";
            return da.localeCompare(db);
        })[0];
}

export type AthleteSessionFilter = "all" | "upcoming" | "completed" | "month";

export function filterAthleteSessions(
    sessions: TrainingSession[],
    filter: AthleteSessionFilter,
    today = new Date()
): TrainingSession[] {
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const month = today.getMonth();
    const year = today.getFullYear();

    const sorted = [...sessions].sort((a, b) => {
        const da = a.session_date ?? "";
        const db = b.session_date ?? "";
        return db.localeCompare(da);
    });

    switch (filter) {
        case "upcoming":
            return sorted
                .filter((s) => {
                    if (!s.session_date) return false;
                    const d = parseSessionDateLocal(s.session_date);
                    return d >= todayStart && s.status !== "completed";
                })
                .reverse();
        case "completed":
            return sorted.filter((s) => s.status === "completed");
        case "month":
            return sorted.filter((s) => {
                if (!s.session_date) return false;
                const d = parseSessionDateLocal(s.session_date);
                return d.getMonth() === month && d.getFullYear() === year;
            });
        default:
            return sorted;
    }
}

export function getSessionStatusLabel(session: TrainingSession, today = new Date()): string {
    if (isSessionToday(session, today)) return "Hoy";
    if (session.status === "completed") return "Completada";
    if (session.status === "skipped") return "Omitida";
    if (session.session_date && session.status === "planned") {
        const sessionDay = parseSessionDateLocal(session.session_date);
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        if (sessionDay < todayStart) return "No realizada";
    }
    return "Programada";
}

export function getTrainingGoalLabel(goal: string | null | undefined): string {
    if (!goal) return "Sin objetivo definido";
    const labels: Record<string, string> = {
        hypertrophy: "Hipertrofia",
        strength: "Fuerza",
        power: "Potencia",
        endurance: "Resistencia",
        weight_loss: "Pérdida de peso",
        rehabilitation: "Rehabilitación",
        general_fitness: "Fitness general",
        sport_performance: "Rendimiento deportivo",
    };
    return labels[goal] ?? goal;
}

/** Parsea reps planificadas ("8", "8-10") a entero para steppers. */
export function parseAthleteReps(value: string | number | null | undefined): number {
    if (value == null) return 8;
    const raw = String(value).trim();
    const match = raw.match(/\d+/);
    const n = match ? Number.parseInt(match[0], 10) : 8;
    return Number.isFinite(n) && n > 0 ? n : 8;
}

/** Aplana la estructura de sesión en pasos de logger (1 paso = 1 serie). */
export function flattenAthleteExercises(view: SessionStructureView): AthleteFlatExercise[] {
    const items: AthleteFlatExercise[] = [];

    for (const block of view.blocks) {
        for (const group of block.groups) {
            for (const slot of group.slots) {
                for (const set of slot.sets) {
                    const parts: string[] = [];
                    if (set.label) parts.push(set.label);
                    if (set.plannedReps) parts.push(`${set.plannedReps} reps`);
                    if (set.plannedWeight != null) parts.push(`@ ${set.plannedWeight} kg`);
                    if (set.plannedDuration != null) parts.push(`${set.plannedDuration}s`);

                    items.push({
                        stepKey: `${set.sourceLineId}-${set.index}`,
                        blockExerciseId: set.sourceLineId,
                        name: slot.exerciseName,
                        blockName: block.blockTypeName,
                        groupKind: group.kind,
                        setLabel: set.label,
                        setIndex: set.index,
                        totalSetsInSlot: slot.sets.length,
                        plannedLabel: parts.join(" · ") || "Según prescripción",
                        defaultWeight: set.plannedWeight ?? set.actualWeight ?? 0,
                        defaultReps: parseAthleteReps(set.plannedReps ?? set.actualReps),
                        restSeconds: set.plannedRest ?? group.restBetweenSeconds ?? null,
                        defaultRpe: set.actualEffortValue ?? set.effortValue ?? null,
                        videoUrl: null,
                        loggedSets: 0,
                    });
                }
            }
        }
    }

    return items;
}
