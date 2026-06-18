/**
 * athleteProgressUtils.ts — Agregaciones de progreso atleta (F2 V10/V11).
 * Sin DOM — reutilizable en hooks.
 */

import type { ProgressTracking } from "../../types/progress";
import type { TrainingSession } from "../../types/trainingSessions";
import { parseSessionDateLocal, toLocalDateKey } from "./athleteSessionUtils";

export interface WeeklyActivityBar {
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
    isPersonalBest: boolean;
}

const MS_30_DAYS = 30 * 24 * 60 * 60 * 1000;

function isoWeekLabel(date: Date): string {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    const month = monday.getMonth() + 1;
    return `${monday.getDate()}/${month}`;
}

/** Barras sesiones completadas por semana (últimas 8 semanas con datos). */
export function buildWeeklyActivityBars(
    sessions: TrainingSession[],
    weeks = 8
): WeeklyActivityBar[] {
    const completed = sessions.filter(
        (s) => s.status === "completed" && s.session_date
    );

    const counts = new Map<string, { sortKey: string; count: number }>();

    for (const session of completed) {
        const date = parseSessionDateLocal(session.session_date!);
        const label = isoWeekLabel(date);
        const sortKey = toLocalDateKey(date);
        const existing = counts.get(label);
        if (existing) {
            existing.count += 1;
            if (sortKey < existing.sortKey) existing.sortKey = sortKey;
        } else {
            counts.set(label, { sortKey, count: 1 });
        }
    }

    return [...counts.entries()]
        .sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey))
        .slice(-weeks)
        .map(([week, { count }]) => ({ week, count }));
}

function withinLast30Days(isoDate: string): boolean {
    const t = parseSessionDateLocal(isoDate).getTime();
    return Date.now() - t <= MS_30_DAYS;
}

/** Top ejercicios por Δ peso en ventana 30d (desde ProgressTracking). */
export function buildTopExercises(
    tracking: ProgressTracking[],
    exerciseNames: Map<number, string>,
    limit = 5
): TopExerciseRow[] {
    const byExercise = new Map<number, ProgressTracking[]>();

    for (const row of tracking) {
        if (!row.is_active) continue;
        const list = byExercise.get(row.exercise_id) ?? [];
        list.push(row);
        byExercise.set(row.exercise_id, list);
    }

    const rows: TopExerciseRow[] = [];

    for (const [exerciseId, records] of byExercise) {
        const sorted = [...records].sort((a, b) =>
            a.tracking_date.localeCompare(b.tracking_date)
        );
        const recent = sorted.filter((r) => withinLast30Days(r.tracking_date));
        if (recent.length === 0) continue;

        const meaningful = recent.filter((r) => (r.max_weight ?? 0) > 0);
        const pool = meaningful.length > 0 ? meaningful : recent;
        const latest = pool[pool.length - 1];
        const previous =
            pool.length >= 2 ? pool[pool.length - 2] : null;
        const latestWeight = latest.max_weight;
        let weightDelta: number | null = null;
        if (
            latestWeight != null &&
            previous?.max_weight != null
        ) {
            weightDelta = Math.round((latestWeight - previous.max_weight) * 10) / 10;
        }

        rows.push({
            exerciseId,
            exerciseName: exerciseNames.get(exerciseId) ?? `Ejercicio #${exerciseId}`,
            latestWeight,
            weightDelta,
            lastDate: latest.tracking_date,
        });
    }

    return rows
        .sort((a, b) => Math.abs(b.weightDelta ?? 0) - Math.abs(a.weightDelta ?? 0))
        .slice(0, limit);
}

/** PRs recientes: registros donde max_weight alcanza máximo histórico del ejercicio. */
export function buildRecentRecords(
    tracking: ProgressTracking[],
    exerciseNames: Map<number, string>,
    limit = 5
): RecentRecordRow[] {
    const byExercise = new Map<number, ProgressTracking[]>();
    const maxWeightByExercise = new Map<number, number>();

    for (const row of tracking) {
        if (!row.is_active || row.max_weight == null) continue;
        const list = byExercise.get(row.exercise_id) ?? [];
        list.push(row);
        byExercise.set(row.exercise_id, list);
        const prev = maxWeightByExercise.get(row.exercise_id) ?? 0;
        if (row.max_weight > prev) {
            maxWeightByExercise.set(row.exercise_id, row.max_weight);
        }
    }

    const prEvents: RecentRecordRow[] = [];

    for (const [exerciseId, records] of byExercise) {
        const sorted = [...records].sort((a, b) =>
            a.tracking_date.localeCompare(b.tracking_date)
        );
        let runningMax = 0;
        for (const r of sorted) {
            const w = r.max_weight ?? 0;
            const isPb = w > runningMax;
            if (isPb) {
                runningMax = w;
                prEvents.push({
                    exerciseId,
                    exerciseName:
                        exerciseNames.get(exerciseId) ?? `Ejercicio #${exerciseId}`,
                    maxWeight: r.max_weight,
                    maxReps: r.max_reps,
                    trackingDate: r.tracking_date,
                    isPersonalBest: true,
                });
            }
        }
    }

    return prEvents
        .sort((a, b) => b.trackingDate.localeCompare(a.trackingDate))
        .slice(0, limit);
}

/** Adherencia 30d desde sesiones planificadas vs completadas. */
export function computeAdherence30d(sessions: TrainingSession[]): {
    percent: number | null;
    completed: number;
    planned: number;
} {
    const cutoff = Date.now() - MS_30_DAYS;
    const inWindow = sessions.filter((s) => {
        if (!s.session_date) return false;
        return parseSessionDateLocal(s.session_date).getTime() >= cutoff;
    });

    if (inWindow.length === 0) {
        return { percent: null, completed: 0, planned: 0 };
    }

    const completed = inWindow.filter((s) => s.status === "completed").length;
    const percent = Math.round((completed / inWindow.length) * 100);
    return { percent, completed, planned: inWindow.length };
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

/** Últimas N entradas de tracking para tabla V11. */
export function buildExerciseHistoryTable(
    tracking: ProgressTracking[],
    limit = 5
): ProgressTracking[] {
    return [...tracking]
        .filter((t) => t.is_active)
        .sort((a, b) => b.tracking_date.localeCompare(a.tracking_date))
        .slice(0, limit);
}

/** Sesión completada en la misma fecha que un registro de tracking. */
export function findSessionByTrackingDate(
    sessions: TrainingSession[],
    trackingDate: string
): TrainingSession | undefined {
    return sessions.find(
        (s) =>
            s.status === "completed" &&
            s.session_date === trackingDate
    );
}
