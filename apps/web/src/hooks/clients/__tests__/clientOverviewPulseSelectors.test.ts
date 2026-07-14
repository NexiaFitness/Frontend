/**
 * clientOverviewPulseSelectors.test.ts — Tests selectores cockpit Resumen (UX-OVERVIEW F0).
 */

import { describe, expect, it } from "vitest";
import {
    buildPulseRows,
    buildRecommendationsMode,
    buildStatChips,
    findLastCompletedSession,
    findUpcomingSession,
} from "../clientOverviewPulseSelectors";
import type { BuildOverviewViewModelInput } from "../clientOverviewPulseSelectors";
import { createMockTrainingSession } from "@/test-utils/fixtures/clients";

const baseInput = (overrides: Partial<BuildOverviewViewModelInput> = {}): BuildOverviewViewModelInput => ({
    clientId: 1,
    sessions: [],
    testResults: [],
    progressHistory: [],
    activeInjuries: [],
    loadInsights: null,
    ...overrides,
});

describe("clientOverviewPulseSelectors", () => {
    it("findUpcomingSession returns nearest future session", () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);
        const sessions = [
            createMockTrainingSession({
                session_date: tomorrowStr,
                status: "scheduled",
            }),
        ];
        expect(findUpcomingSession(sessions)?.session_date).toBe(tomorrowStr);
    });

    it("buildPulseRows includes empty row when no activity", () => {
        const rows = buildPulseRows(baseInput());
        expect(rows).toHaveLength(1);
        expect(rows[0].kind).toBe("empty");
    });

    it("buildPulseRows orders session before signals", () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const rows = buildPulseRows(
            baseInput({
                sessions: [
                    createMockTrainingSession({
                        id: 10,
                        session_date: yesterday.toISOString().slice(0, 10),
                        status: "completed",
                    }),
                ],
                loadInsights: {
                    client_id: 1,
                    completed_sessions_count: 1,
                    has_sufficient_data: true,
                    signals: [
                        {
                            signal_type: "plateau",
                            exercise_id: 1,
                            exercise_name: "Press banca",
                            severity: "info",
                            message: "Meseta detectada",
                        },
                    ],
                    recent_loads: [],
                },
            }),
        );
        expect(rows[0].kind).toBe("last_session");
        expect(rows[1].kind).toBe("signal");
    });

    it("buildStatChips marks monotony warning above 2.0", () => {
        const chips = buildStatChips(
            baseInput({
                coherence: {
                    adherence_percentage: 90,
                    sessions_completed: 9,
                    sessions_total: 10,
                    average_srpe: 7,
                    monotony: 2.5,
                    strain: 10,
                    prescribed_vs_perceived: [],
                    monotony_by_week: [],
                    strain_by_week: [],
                    summary: "",
                    recommendations: [],
                },
            }),
        );
        const monotony = chips.find((c) => c.id === "monotony");
        expect(monotony?.tone).toBe("warning");
        expect(monotony?.href).toContain("daily-coherence");
    });

    it("buildRecommendationsMode maps incomplete and complete", () => {
        expect(
            buildRecommendationsMode({
                client_id: 1,
                status: "incomplete",
                message: "Falta data",
                missing_fields: ["experiencia"],
                recommendations: null,
                based_on: {
                    experience: null,
                    training_frequency: null,
                    session_duration: null,
                    objective: null,
                },
            }),
        ).toBe("incomplete");
        expect(
            buildRecommendationsMode({
                client_id: 1,
                status: "complete",
                recommendations: {
                    volume: {
                        level: "moderate",
                        level_es: "Moderado",
                        range: "10-15",
                        min_sets: 10,
                        max_sets: 15,
                        explanation: "",
                    },
                    intensity: {
                        level: "moderate",
                        level_es: "Moderado",
                        rpe_range: "7-8",
                        percent_1rm_range: "70-80",
                        rir_range: "2-3",
                        explanation: "",
                    },
                    exercise_selection: {
                        categories: [],
                        categories_raw: [],
                        explanation: "",
                    },
                },
                based_on: {
                    experience: "intermediate",
                    training_frequency: 3,
                    session_duration: "medium",
                    objective: "Strength",
                },
                scenario: { key: "default", input_classification: {} },
            }),
        ).toBe("compact_ok");
    });

    it("findLastCompletedSession ignores future sessions", () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const session = findLastCompletedSession([
            createMockTrainingSession({
                session_date: tomorrow.toISOString().slice(0, 10),
                status: "completed",
            }),
        ]);
        expect(session).toBeNull();
    });
});
