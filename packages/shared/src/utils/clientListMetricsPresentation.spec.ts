import { describe, expect, it } from "vitest";

import type { ClientListItem } from "../types/client";
import {
    getClientAdherenceTooltip,
    getClientSatisfactionDisplay,
    getClientSatisfactionTrendDisplay,
    hasClientSessionSatisfaction,
} from "./clientListMetricsPresentation";

const baseClient: ClientListItem = {
    id: 1,
    nombre: "Test",
    apellidos: "Client",
    mail: "test@example.com",
    fatigue_level: null,
    fatigue_level_numeric: 2,
    adherence_percentage: 60,
    last_satisfaction: null,
    satisfaction_level: null,
    last_satisfaction_date: null,
    avg_satisfaction_recent: null,
    satisfaction_trend: null,
    progress_trend: null,
    status: null,
};

describe("clientListMetricsPresentation", () => {
    it("hasClientSessionSatisfaction is false without rating fields", () => {
        expect(hasClientSessionSatisfaction(baseClient)).toBe(false);
    });

    it("getClientSatisfactionDisplay returns unrated without session rating", () => {
        const display = getClientSatisfactionDisplay(baseClient);
        expect(display.unrated).toBe(true);
        expect(display.level).toBeNull();
        expect(display.tooltip).toBe("Sin valoración post-sesión");
    });

    it("getClientSatisfactionDisplay uses real rating when present", () => {
        const display = getClientSatisfactionDisplay({
            ...baseClient,
            last_satisfaction: 5,
            satisfaction_level: "happy",
            last_satisfaction_date: "2026-07-09T10:00:00.000Z",
        });
        expect(display.unrated).toBe(false);
        expect(display.level).toBe("happy");
        expect(display.tooltip).toContain("5/5");
        expect(display.tooltip).toContain("Satisfacción post-sesión");
    });

    it("getClientAdherenceTooltip formats adherence", () => {
        expect(getClientAdherenceTooltip(58.6)).toContain("59%");
        expect(getClientAdherenceTooltip(null)).toContain("sin datos");
    });

    it("getClientSatisfactionTrendDisplay is null without trend", () => {
        expect(getClientSatisfactionTrendDisplay(baseClient)).toEqual({
            trend: null,
            tooltip: null,
        });
    });

    it("getClientSatisfactionTrendDisplay labels trend when present", () => {
        const result = getClientSatisfactionTrendDisplay({
            ...baseClient,
            satisfaction_trend: "up",
        });
        expect(result.trend).toBe("up");
        expect(result.tooltip).toContain("mejora");
    });
});
