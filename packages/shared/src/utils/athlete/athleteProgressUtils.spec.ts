/**
 * athleteProgressUtils.spec.ts — Adherencia, PR, deltas y semanas continuas.
 * @author Frontend Team
 * @since v6.1.0
 */

import { describe, expect, it } from "vitest";
import type { ProgressTracking } from "../../types/progress";
import type { TrainingSession } from "../../types/trainingSessions";
import {
    buildRecentRecords,
    buildTopExercises,
    buildWeeklyActivityBars,
    computeAdherence,
    countPersonalRecords,
    countTrailingTrainingWeeks,
} from "./athleteProgressUtils";

function session(partial: Partial<TrainingSession> & { id: number }): TrainingSession {
    return {
        client_id: 1,
        trainer_id: 1,
        session_name: "Sesión",
        session_type: "strength",
        id: partial.id,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        is_active: true,
        session_date: "2026-10-01",
        status: "planned",
        ...partial,
    } as TrainingSession;
}

function track(
    partial: Partial<ProgressTracking> & { id: number; exercise_id: number }
): ProgressTracking {
    return {
        client_id: 1,
        is_active: true,
        tracking_date: "2026-10-01",
        max_weight: 50,
        max_reps: 5,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        ...partial,
    } as ProgressTracking;
}

const RANGE = { start: "2026-09-09", end: "2026-10-08" };

describe("computeAdherence", () => {
    it("excludes future and skipped sessions", () => {
        const result = computeAdherence(
            [
                session({ id: 1, session_date: "2026-10-01", status: "completed" }),
                session({ id: 2, session_date: "2026-10-02", status: "planned" }),
                session({ id: 3, session_date: "2026-10-03", status: "skipped" }),
                session({ id: 4, session_date: "2026-10-20", status: "planned" }),
            ],
            RANGE,
            "2026-10-08"
        );
        expect(result).toEqual({ percent: 50, completed: 1, planned: 2 });
    });

    it("excludes cancelled sessions from the denominator", () => {
        const result = computeAdherence(
            [
                session({ id: 1, session_date: "2026-10-01", status: "completed" }),
                session({ id: 2, session_date: "2026-10-02", status: "cancelled" }),
            ],
            RANGE,
            "2026-10-08"
        );
        expect(result).toEqual({ percent: 100, completed: 1, planned: 1 });
    });

    it("returns null percent without due sessions", () => {
        expect(computeAdherence([], RANGE, "2026-10-08").percent).toBeNull();
    });
});

describe("buildWeeklyActivityBars", () => {
    it("fills zero weeks and does not collide across years", () => {
        const bars = buildWeeklyActivityBars(
            [
                session({
                    id: 1,
                    session_date: "2025-12-30",
                    status: "completed",
                }),
                session({
                    id: 2,
                    session_date: "2026-01-13",
                    status: "completed",
                }),
            ],
            { start: "2025-12-29", end: "2026-01-18" }
        );
        expect(bars[0].weekKey).toBe("2025-12-29");
        expect(bars.some((b) => b.weekKey === "2026-01-05" && b.count === 0)).toBe(true);
        expect(bars.some((b) => b.weekKey === "2026-01-12" && b.count === 1)).toBe(true);
    });
});

describe("countTrailingTrainingWeeks", () => {
    it("skips an empty current week", () => {
        expect(
            countTrailingTrainingWeeks([
                { weekKey: "a", week: "a", count: 1 },
                { weekKey: "b", week: "b", count: 1 },
                { weekKey: "c", week: "c", count: 0 },
            ])
        ).toBe(2);
    });
});

describe("personal records", () => {
    const names = new Map([[1, "Sentadilla"]]);

    it("does not treat the first log as a PR", () => {
        const tracking = [
            track({ id: 1, exercise_id: 1, tracking_date: "2026-09-10", max_weight: 80 }),
        ];
        expect(countPersonalRecords(tracking, RANGE)).toBe(0);
        expect(buildRecentRecords(tracking, names, RANGE).rows).toHaveLength(0);
    });

    it("counts a later heavier set and ignores ties", () => {
        const tracking = [
            track({ id: 1, exercise_id: 1, tracking_date: "2026-09-10", max_weight: 80 }),
            track({ id: 2, exercise_id: 1, tracking_date: "2026-09-20", max_weight: 80 }),
            track({ id: 3, exercise_id: 1, tracking_date: "2026-10-01", max_weight: 85 }),
        ];
        expect(countPersonalRecords(tracking, RANGE)).toBe(1);
        const { rows } = buildRecentRecords(tracking, names, RANGE);
        expect(rows[0].maxWeight).toBe(85);
        expect(rows[0].previousMaxWeight).toBe(80);
    });

    it("counts every PR in the window without a visual cap", () => {
        const tracking = [
            track({ id: 1, exercise_id: 1, tracking_date: "2026-09-10", max_weight: 50 }),
            track({ id: 2, exercise_id: 1, tracking_date: "2026-09-12", max_weight: 55 }),
            track({ id: 3, exercise_id: 1, tracking_date: "2026-09-14", max_weight: 60 }),
            track({ id: 4, exercise_id: 1, tracking_date: "2026-09-16", max_weight: 65 }),
            track({ id: 5, exercise_id: 1, tracking_date: "2026-09-18", max_weight: 70 }),
            track({ id: 6, exercise_id: 1, tracking_date: "2026-09-20", max_weight: 75 }),
            track({ id: 7, exercise_id: 1, tracking_date: "2026-09-22", max_weight: 80 }),
        ];
        expect(countPersonalRecords(tracking, RANGE)).toBe(6);
        expect(countPersonalRecords(tracking, RANGE, names)).toBe(6);
        expect(countPersonalRecords(tracking, RANGE, new Map())).toBe(0);
        expect(buildRecentRecords(tracking, names, RANGE).rows).toHaveLength(5);
    });
});

describe("buildTopExercises", () => {
    it("uses first vs last of the period and skips unnamed rows", () => {
        const tracking = [
            track({ id: 1, exercise_id: 1, tracking_date: "2026-09-10", max_weight: 60 }),
            track({ id: 2, exercise_id: 1, tracking_date: "2026-09-20", max_weight: 62 }),
            track({ id: 3, exercise_id: 1, tracking_date: "2026-10-01", max_weight: 70 }),
            track({ id: 4, exercise_id: 9, tracking_date: "2026-10-01", max_weight: 100 }),
        ];
        const { rows, unresolvedIds } = buildTopExercises(
            tracking,
            new Map([[1, "Banca"]]),
            RANGE
        );
        expect(rows).toHaveLength(1);
        expect(rows[0].weightDelta).toBe(10);
        expect(unresolvedIds).toContain(9);
    });

    it("omits exercises without a positive load", () => {
        const tracking = [
            track({ id: 1, exercise_id: 1, tracking_date: "2026-10-01", max_weight: 0 }),
            track({ id: 2, exercise_id: 2, tracking_date: "2026-10-01", max_weight: null }),
        ];
        const { rows } = buildTopExercises(
            tracking,
            new Map([
                [1, "Curl"],
                [2, "Plancha"],
            ]),
            RANGE
        );
        expect(rows).toHaveLength(0);
    });

    it("ranks gains before drops and leaves a single log without delta", () => {
        const tracking = [
            track({ id: 1, exercise_id: 1, tracking_date: "2026-09-10", max_weight: 80 }),
            track({ id: 2, exercise_id: 1, tracking_date: "2026-10-01", max_weight: 70 }),
            track({ id: 3, exercise_id: 2, tracking_date: "2026-09-10", max_weight: 40 }),
            track({ id: 4, exercise_id: 2, tracking_date: "2026-10-01", max_weight: 50 }),
            track({ id: 5, exercise_id: 3, tracking_date: "2026-10-01", max_weight: 90 }),
        ];
        const { rows } = buildTopExercises(
            tracking,
            new Map([
                [1, "Peso muerto"],
                [2, "Remo"],
                [3, "Press"],
            ]),
            RANGE
        );
        expect(rows[0].exerciseName).toBe("Remo");
        expect(rows[0].weightDelta).toBe(10);
        expect(rows.find((row) => row.exerciseName === "Peso muerto")?.weightDelta).toBe(-10);
        expect(rows.find((row) => row.exerciseName === "Press")?.weightDelta).toBeNull();
    });
});
