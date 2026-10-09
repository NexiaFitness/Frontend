/**
 * athleteProgressUtils.ts — Agregaciones de progreso atleta (F2 V10/V11).
 * Contexto: builders puros para el hook de Mi progreso; sin DOM.
 * Notas: primer peso no es PR; adherencia excluye futuras y skipped/cancelled.
 * L-1: ~430 líneas de un circuito tracking/sesiones; partirlo duplicaría agrupación.
 * @author Frontend Team
 * @since v6.1.0
 */

import type { ProgressTracking } from "../../types/progress";
import type { TrainingSession } from "../../types/trainingSessions";
import { getMondayOfWeekLocal } from "../calendarWeekForBlock";
import {
    type AthleteDateRange,
    formatWeekAxisLabel,
    isDateInAthleteRange,
    iterateMondaysInclusive,
} from "./athleteProgressPeriod";
import { toLocalDateKey } from "./athleteSessionUtils";

export interface WeeklyActivityBar {
    weekKey: string;
    week: string;
    count: number;
}

export interface TopExerciseRow {
    exerciseId: number;
    exerciseName: string;
    latestWeight: number | null;
    weightDelta: number | null;
    lastDate: string;
}

export interface RecentRecordRow {
    exerciseId: number;
    exerciseName: string;
    maxWeight: number | null;
    maxReps: number | null;
    trackingDate: string;
    previousMaxWeight: number | null;
    isPersonalBest: boolean;
}

export interface AdherenceSnapshot {
    percent: number | null;
    completed: number;
    planned: number;
}

export interface NamedProgressRows<T> {
    rows: T[];
    unresolvedIds: number[];
}

const EXCLUDED_ADHERENCE_STATUSES = new Set(["skipped", "cancelled"]);
const MAX_WEEK_BARS = 12;

function trackingDateKey(row: ProgressTracking): string | null {
    if (!row.tracking_date) return null;
    return row.tracking_date.slice(0, 10);
}

function isCountablePlannedSession(session: TrainingSession, todayKey: string): boolean {
    if (!session.session_date) return false;
    if (session.is_active === false) return false;
    const dateKey = session.session_date.slice(0, 10);
    if (dateKey > todayKey) return false;
    const status = session.status ?? "";
    if (EXCLUDED_ADHERENCE_STATUSES.has(status)) return false;
    return true;
}

/** Adherencia: vencidas no skipped/cancelled en el rango; % y fracción de la misma cuenta. */
export function computeAdherence(
    sessions: TrainingSession[],
    range: AthleteDateRange,
    todayKey: string
): AdherenceSnapshot {
    const plannedSessions = sessions.filter(
        (session) =>
            isCountablePlannedSession(session, todayKey) &&
            isDateInAthleteRange(session.session_date, range)
    );
    const planned = plannedSessions.length;
    if (planned === 0) {
        return { percent: null, completed: 0, planned: 0 };
    }
    const completed = plannedSessions.filter((s) => s.status === "completed").length;
    return {
        percent: Math.round((completed / planned) * 100),
        completed,
        planned,
    };
}

/** @deprecated Usar computeAdherence con rango explícito. */
export function computeAdherence30d(
    sessions: TrainingSession[],
    today: Date = new Date()
): AdherenceSnapshot {
    const todayKey = toLocalDateKey(today);
    const start = toLocalDateKey(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)
    );
    return computeAdherence(sessions, { start, end: todayKey }, todayKey);
}

/** Barras de sesiones completadas, semanas continuas (incluye ceros). */
export function buildWeeklyActivityBars(
    sessions: TrainingSession[],
    range: AthleteDateRange,
    maxWeeks = MAX_WEEK_BARS
): WeeklyActivityBar[] {
    const counts = new Map<string, number>();
    for (const session of sessions) {
        if (session.status !== "completed" || !session.session_date) continue;
        if (!isDateInAthleteRange(session.session_date, range)) continue;
        const monday = getMondayOfWeekLocal(session.session_date.slice(0, 10));
        counts.set(monday, (counts.get(monday) ?? 0) + 1);
    }

    const mondays = iterateMondaysInclusive(range.start, range.end);
    const bars = mondays.map((weekKey) => ({
        weekKey,
        week: formatWeekAxisLabel(weekKey),
        count: counts.get(weekKey) ?? 0,
    }));
    return bars.length > maxWeeks ? bars.slice(-maxWeeks) : bars;
}

/** Semanas seguidas con >= 1 sesión; ignora un 0 final (semana en curso vacía). */
export function countTrailingTrainingWeeks(bars: WeeklyActivityBar[]): number {
    if (bars.length === 0) return 0;
    let index = bars.length - 1;
    if (bars[index].count === 0) index -= 1;
    let streak = 0;
    while (index >= 0 && bars[index].count >= 1) {
        streak += 1;
        index -= 1;
    }
    return streak;
}

function groupTrackingByExercise(
    tracking: ProgressTracking[],
    range?: AthleteDateRange
): Map<number, ProgressTracking[]> {
    const byExercise = new Map<number, ProgressTracking[]>();
    for (const row of tracking) {
        if (row.is_active === false) continue;
        const dateKey = trackingDateKey(row);
        if (!dateKey) continue;
        if (range && !isDateInAthleteRange(dateKey, range)) continue;
        const list = byExercise.get(row.exercise_id) ?? [];
        list.push(row);
        byExercise.set(row.exercise_id, list);
    }
    return byExercise;
}

/** Top ejercicios: delta neto primer vs último del periodo. Sin nombre → omitir. */
export function buildTopExercises(
    tracking: ProgressTracking[],
    exerciseNames: Map<number, string>,
    range: AthleteDateRange,
    limit = 5
): NamedProgressRows<TopExerciseRow> {
    const unresolvedIds: number[] = [];
    const rows: TopExerciseRow[] = [];

    for (const [exerciseId, records] of groupTrackingByExercise(tracking, range)) {
        const name = exerciseNames.get(exerciseId)?.trim();
        if (!name) {
            unresolvedIds.push(exerciseId);
            continue;
        }

        const sorted = [...records].sort((a, b) =>
            (a.tracking_date ?? "").localeCompare(b.tracking_date ?? "")
        );
        const withWeight = sorted.filter((r) => (r.max_weight ?? 0) > 0);
        if (withWeight.length === 0) continue;

        const first = withWeight[0];
        const latest = withWeight[withWeight.length - 1];
        const latestWeight = latest.max_weight;
        let weightDelta: number | null = null;
        if (
            withWeight.length >= 2 &&
            latestWeight != null &&
            first.max_weight != null
        ) {
            weightDelta = Math.round((latestWeight - first.max_weight) * 10) / 10;
        }

        rows.push({
            exerciseId,
            exerciseName: name,
            latestWeight,
            weightDelta,
            lastDate: latest.tracking_date ?? "",
        });
    }

    const ranked = [...rows].sort((a, b) => {
        const aGain = a.weightDelta != null && a.weightDelta > 0 ? a.weightDelta : -1;
        const bGain = b.weightDelta != null && b.weightDelta > 0 ? b.weightDelta : -1;
        if (bGain !== aGain) return bGain - aGain;
        return (b.latestWeight ?? 0) - (a.latestWeight ?? 0);
    });

    return { rows: ranked.slice(0, limit), unresolvedIds };
}

function collectPersonalRecordEvents(tracking: ProgressTracking[]): RecentRecordRow[] {
    const events: RecentRecordRow[] = [];
    const byExercise = groupTrackingByExercise(tracking);

    for (const [exerciseId, records] of byExercise) {
        const sorted = [...records]
            .filter((r) => r.max_weight != null)
            .sort((a, b) => (a.tracking_date ?? "").localeCompare(b.tracking_date ?? ""));
        let runningMax = 0;
        for (const row of sorted) {
            const weight = row.max_weight ?? 0;
            if (weight <= runningMax) continue;
            const previousMax = runningMax > 0 ? runningMax : null;
            runningMax = weight;
            if (previousMax == null) continue;
            events.push({
                exerciseId,
                exerciseName: "",
                maxWeight: row.max_weight,
                maxReps: row.max_reps,
                trackingDate: row.tracking_date ?? "",
                previousMaxWeight: previousMax,
                isPersonalBest: true,
            });
        }
    }

    return events;
}

/** PRs: exige marca previa del mismo ejercicio. Sin tope de conteo. */
export function countPersonalRecords(
    tracking: ProgressTracking[],
    range?: AthleteDateRange,
    exerciseNames?: Map<number, string>
): number {
    return collectPersonalRecordEvents(tracking).filter((row) => {
        if (range && !isDateInAthleteRange(row.trackingDate, range)) return false;
        if (exerciseNames && !exerciseNames.get(row.exerciseId)?.trim()) return false;
        return true;
    }).length;
}

/** PRs recientes para lista (tope visual). Omite ejercicios sin nombre. */
export function buildRecentRecords(
    tracking: ProgressTracking[],
    exerciseNames: Map<number, string>,
    range?: AthleteDateRange,
    limit = 5
): NamedProgressRows<RecentRecordRow> {
    const unresolvedIds: number[] = [];
    const named: RecentRecordRow[] = [];
    for (const event of collectPersonalRecordEvents(tracking)) {
        if (range && !isDateInAthleteRange(event.trackingDate, range)) continue;
        const name = exerciseNames.get(event.exerciseId)?.trim();
        if (!name) {
            unresolvedIds.push(event.exerciseId);
            continue;
        }
        named.push({ ...event, exerciseName: name });
    }
    return {
        rows: named
            .sort((a, b) => b.trackingDate.localeCompare(a.trackingDate))
            .slice(0, limit),
        unresolvedIds: [...new Set(unresolvedIds)],
    };
}

export interface ExerciseProgressChartPoint {
    date: string;
    weight: number | null;
    volume: number | null;
    reps: number | null;
}

export function buildExerciseProgressChart(
    tracking: ProgressTracking[]
): ExerciseProgressChartPoint[] {
    return [...tracking]
        .filter((t) => t.is_active)
        .sort((a, b) => a.tracking_date.localeCompare(b.tracking_date))
        .map((t) => ({
            date: t.tracking_date,
            weight: t.max_weight,
            reps: t.max_reps,
            volume:
                t.max_weight != null && t.max_reps != null
                    ? Math.round(t.max_weight * t.max_reps)
                    : null,
        }));
}

/** Fecha ISO → clave YYYY-MM-DD para comparar tracking y sesiones. */
export function normalizeTrackingDateKey(value: string): string {
    return value.slice(0, 10);
}

export function trackingDatesMatch(a: string, b: string): boolean {
    return normalizeTrackingDateKey(a) === normalizeTrackingDateKey(b);
}

/** Últimas N entradas; si ensureDate está fuera del top, la incluye (p. ej. PR). */
export function buildExerciseHistoryTable(
    tracking: ProgressTracking[],
    limit = 8,
    ensureDate?: string | null
): ProgressTracking[] {
    const active = [...tracking]
        .filter((t) => t.is_active !== false)
        .sort((a, b) => b.tracking_date.localeCompare(a.tracking_date));

    const sliced = active.slice(0, limit);

    if (!ensureDate) return sliced;

    const pinKey = normalizeTrackingDateKey(ensureDate);
    const pinned = active.find(
        (row) => normalizeTrackingDateKey(row.tracking_date) === pinKey
    );
    if (!pinned) return sliced;
    if (sliced.some((row) => row.id === pinned.id)) return sliced;

    return [pinned, ...sliced.slice(0, Math.max(0, limit - 1))];
}

export interface SessionLoadRow {
    exerciseId: number;
    exerciseName: string;
    maxWeight: number | null;
    maxReps: number | null;
    previousWeight: number | null;
    weightDelta: number | null;
}

/** Cargas registradas en una fecha de sesión (progress_tracking). */
export function buildSessionLoadsForDate(
    tracking: ProgressTracking[],
    sessionDate: string,
    exerciseNames: Map<number, string>
): SessionLoadRow[] {
    const key = normalizeTrackingDateKey(sessionDate);
    return tracking
        .filter(
            (row) =>
                row.is_active !== false &&
                normalizeTrackingDateKey(row.tracking_date) === key
        )
        .map((row) => ({
            exerciseId: row.exercise_id,
            exerciseName:
                exerciseNames.get(row.exercise_id) ?? `Ejercicio #${row.exercise_id}`,
            maxWeight: row.max_weight,
            maxReps: row.max_reps,
            previousWeight: null,
            weightDelta: null,
        }))
        .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}

/** Sesión completada inmediatamente anterior a una fecha. */
export function findPreviousCompletedSession(
    sessions: TrainingSession[],
    beforeDate: string
): TrainingSession | undefined {
    const beforeKey = normalizeTrackingDateKey(beforeDate);
    return [...sessions]
        .filter(
            (s) =>
                s.status === "completed" &&
                s.session_date &&
                normalizeTrackingDateKey(s.session_date) < beforeKey
        )
        .sort((a, b) => (b.session_date ?? "").localeCompare(a.session_date ?? ""))[0];
}

/** Cargas de sesión + delta vs sesión anterior (mismo ejercicio). */
export function buildSessionLoadsWithComparison(
    tracking: ProgressTracking[],
    sessions: TrainingSession[],
    sessionDate: string,
    exerciseNames: Map<number, string>
): SessionLoadRow[] {
    const current = buildSessionLoadsForDate(tracking, sessionDate, exerciseNames);
    const previousSession = findPreviousCompletedSession(sessions, sessionDate);
    if (!previousSession?.session_date) return current;

    const previousByExercise = new Map<number, ProgressTracking>();
    const prevKey = normalizeTrackingDateKey(previousSession.session_date);
    for (const row of tracking) {
        if (
            row.is_active !== false &&
            normalizeTrackingDateKey(row.tracking_date) === prevKey
        ) {
            previousByExercise.set(row.exercise_id, row);
        }
    }

    return current.map((row) => {
        const prev = previousByExercise.get(row.exerciseId);
        const previousWeight =
            prev?.max_weight != null && prev.max_weight > 0 ? prev.max_weight : null;
        let weightDelta: number | null = null;
        if (
            row.maxWeight != null &&
            row.maxWeight > 0 &&
            previousWeight != null
        ) {
            weightDelta = Math.round((row.maxWeight - previousWeight) * 10) / 10;
        }
        return { ...row, previousWeight, weightDelta };
    });
}

/** Sesión completada en la misma fecha que un registro de tracking. */
export function findSessionByTrackingDate(
    sessions: TrainingSession[],
    trackingDate: string
): TrainingSession | undefined {
    return sessions.find(
        (s) =>
            s.status === "completed" &&
            s.session_date &&
            trackingDatesMatch(s.session_date, trackingDate)
    );
}
