/**
 * athleteSessionUtils.ts — Utilidades de fechas y sesiones para portal atleta.
 * Contexto: portal atleta F0, sin DOM.
 * Contratos: agent.md, 09_UX_VISTAS
 * @author Frontend Team
 * @since v6.1.0
 */

import type { TrainingSession } from "../../types/trainingSessions";
import type { ClientFeedback } from "../../types/training";
import type { SessionStructureView } from "../../sessionProgramming/sessionBlockView";
import type { AthleteFlatExercise } from "../../offline/athleteSessionTypes";
import {
    formatTrainerNoteForAthlete,
    hasHumanTrainerNote,
} from "./athleteSessionNotesUtils";

const DAY_LABELS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

/** F3c-FE-02 — completed con cumplimiento de series por debajo de este umbral. */
export const PARTIAL_SESSION_COMPLETION_THRESHOLD = 50;

export interface SessionCompletionView {
    status?: string | null;
    completion_percentage?: number | null;
}

/** Cumplimiento 0–100 para sesiones completed; null si no aplica o sin dato. */
export function getCompletedSessionCompletionPercent(
    session: SessionCompletionView
): number | null {
    if (session.status !== "completed") return null;
    const pct = session.completion_percentage;
    if (pct == null || !Number.isFinite(pct)) return null;
    return Math.min(100, Math.max(0, pct));
}

/** Sesión marcada completed pero con pocas series registradas (F3c-FE-02). */
export function isPartiallyClosedSession(session: SessionCompletionView): boolean {
    const pct = getCompletedSessionCompletionPercent(session);
    return pct != null && pct < PARTIAL_SESSION_COMPLETION_THRESHOLD;
}

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

/** Días calendario desde hoy hasta la fecha de sesión (0 = hoy, 1 = mañana). */
export function computeDaysUntilSession(
    sessionDate: string,
    today = new Date()
): number {
    const sessionDay = parseSessionDateLocal(sessionDate);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    sessionDay.setHours(0, 0, 0, 0);
    const diffMs = sessionDay.getTime() - todayStart.getTime();
    return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

export function formatWeekdayLong(date: Date): string {
    const label = date.toLocaleDateString("es-ES", { weekday: "long" });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatWeekdayForSession(sessionDate: string): string {
    return formatWeekdayLong(parseSessionDateLocal(sessionDate));
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

/** Última sesión completed (fecha más reciente). */
export function findLatestCompletedSession(
    sessions: TrainingSession[]
): TrainingSession | undefined {
    return filterAthleteSessions(sessions, "completed")[0];
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
    if (session.status === "completed") {
        return isPartiallyClosedSession(session) ? "Cerrada parcial" : "Completada";
    }
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

/** Días consecutivos con al menos una sesión completada (racha activa). */
export function computeTrainingStreak(
    sessions: TrainingSession[],
    today = new Date()
): number {
    const completedDates = new Set<string>();
    for (const session of sessions) {
        if (session.status === "completed" && session.session_date) {
            completedDates.add(session.session_date);
        }
    }
    if (completedDates.size === 0) return 0;

    const todayKey = toLocalDateKey(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toLocalDateKey(yesterday);

    let cursorKey: string | null = null;
    if (completedDates.has(todayKey)) {
        cursorKey = todayKey;
    } else if (completedDates.has(yesterdayKey)) {
        cursorKey = yesterdayKey;
    } else {
        return 0;
    }

    let streak = 0;
    const cursor = parseSessionDateLocal(cursorKey);
    while (completedDates.has(toLocalDateKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
}

/** Sesión más reciente con notas humanas del entrenador (excluye avisos coherencia). */
export function findLatestTrainerSessionNote(
    sessions: TrainingSession[]
): { session: TrainingSession; note: string } | null {
    const withNotes = sessions
        .map((s) => {
            const raw = s.notes?.trim();
            if (!raw || !hasHumanTrainerNote(raw)) return null;
            return { session: s, note: formatTrainerNoteForAthlete(raw) };
        })
        .filter((x): x is { session: TrainingSession; note: string } => x != null)
        .sort((a, b) =>
            (b.session.session_date ?? "").localeCompare(a.session.session_date ?? "")
        );
    return withNotes[0] ?? null;
}

const MS_7_DAYS = 7 * 24 * 60 * 60 * 1000;

/** @deprecated F3a — use hasUnreadTrainerResponse from athleteFeedbackUtils */
export function hasRecentFeedbackAwaitingResponse(
    feedbackItems: ClientFeedback[],
    now = Date.now()
): boolean {
    return feedbackItems.some((item) => {
        const t = new Date(item.feedback_date).getTime();
        return Number.isFinite(t) && now - t <= MS_7_DAYS;
    });
}

/** Parsea reps planificadas ("8", "8-10") a entero para steppers. */
export function parseAthleteReps(value: string | number | null | undefined): number {
    if (value == null) return 8;
    const raw = String(value).trim();
    const match = raw.match(/\d+/);
    const n = match ? Number.parseInt(match[0], 10) : 8;
    return Number.isFinite(n) && n > 0 ? n : 8;
}

/** Etiqueta de prescripción para run atleta (sin kg planificado residual — F3c-FE-03). */
function buildAthletePlannedLabel(set: {
    label: string;
    plannedReps: string | null;
    plannedDuration: number | null;
    effortCharacter: string | null;
    effortValue: number | null;
}): string {
    const parts: string[] = [];
    if (set.label) parts.push(set.label);
    if (set.plannedReps) parts.push(`${set.plannedReps} reps`);
    if (set.effortValue != null) {
        if (set.effortCharacter === "rpe") {
            parts.push(`RPE ${set.effortValue}`);
        } else if (set.effortCharacter === "rir") {
            parts.push(`RIR ${set.effortValue}`);
        } else if (set.effortCharacter === "pct_rm") {
            parts.push(`${set.effortValue}% RM`);
        }
    }
    if (set.plannedDuration != null) parts.push(`${set.plannedDuration}s`);
    return parts.join(" · ") || "Según prescripción";
}

/** Aplana la estructura de sesión en pasos de logger (1 paso = 1 serie). */
export function flattenAthleteExercises(view: SessionStructureView): AthleteFlatExercise[] {
    const items: AthleteFlatExercise[] = [];

    for (const block of view.blocks) {
        for (const group of block.groups) {
            for (const slot of group.slots) {
                for (const set of slot.sets) {
                    items.push({
                        stepKey: `${set.sourceLineId}-${set.index}`,
                        blockExerciseId: set.sourceLineId,
                        exerciseId: slot.exerciseId,
                        name: slot.exerciseName,
                        blockName: block.blockTypeName,
                        groupKind: group.kind,
                        setLabel: set.label,
                        setIndex: set.index,
                        totalSetsInSlot: slot.sets.length,
                        plannedLabel: buildAthletePlannedLabel(set),
                        plannedWeight: set.plannedWeight ?? null,
                        defaultWeight: set.actualWeight ?? 0,
                        defaultReps: parseAthleteReps(set.plannedReps ?? set.actualReps),
                        restSeconds: set.plannedRest ?? group.restBetweenSeconds ?? null,
                        defaultRpe: set.actualEffortValue ?? set.effortValue ?? null,
                        videoUrl: null,
                        loggedSets: set.rowLoggedSets ?? 0,
                    });
                }
            }
        }
    }

    return items;
}
