/**
 * sessionDayContextPresentation.test.ts — resolveSessionDayPhaseContext (G22).
 */

import { describe, expect, it } from "vitest";
import type { SessionRecommendationsResponse } from "@nexia/shared/types/sessionRecommendations";
import {
    buildBlockContextLine,
    resolveSessionDayPhaseContext,
    SESSION_DAY_CONTEXT_COPY,
} from "../sessionDayContextPresentation";

describe("resolveSessionDayPhaseContext", () => {
    it("returns null when response is undefined", () => {
        expect(
            resolveSessionDayPhaseContext({
                response: undefined,
                sessionDate: "2026-10-02",
            }),
        ).toBeNull();
    });

    it("returns no_active_plan when plan inactive", () => {
        const response: SessionRecommendationsResponse = {
            client_id: 1,
            session_date: "2026-10-02",
            has_active_plan: false,
            recommendations: null,
            coherence_warnings: [],
        };
        const ctx = resolveSessionDayPhaseContext({
            response,
            sessionDate: "2026-10-02",
        });
        expect(ctx?.kind).toBe("no_active_plan");
        expect(ctx && "title" in ctx && ctx.title).toBe(
            SESSION_DAY_CONTEXT_COPY.noPlanTitle,
        );
    });

    it("returns outside_phase once when plan has phases but no planned values", () => {
        const response: SessionRecommendationsResponse = {
            client_id: 1,
            session_date: "2026-10-02",
            has_active_plan: true,
            has_planned_values: false,
            has_planned_day: false,
            recommendations: null,
            coherence_warnings: [],
        };
        const ctx = resolveSessionDayPhaseContext({
            response,
            sessionDate: "2026-10-02",
            periodBlocks: [
                {
                    id: 1,
                    start_date: "2026-09-01",
                    end_date: "2026-12-31",
                } as never,
            ],
        });
        expect(ctx?.kind).toBe("outside_phase");
        expect(ctx && "body" in ctx && ctx.body).toBe(
            SESSION_DAY_CONTEXT_COPY.outsidePhaseBody,
        );
    });
});

describe("buildBlockContextLine", () => {
    const rec = {
        period_block_name: "Fase 1",
        period_block_start_date: "2026-12-02",
        period_block_end_date: "2026-12-08",
        block_week_ordinal: 1,
        block_week_count: 2,
    } as const;

    it("bloque 7 días mid-week: Semana 1 de 1, no el recuento calendario 2", () => {
        const line = buildBlockContextLine(rec as never, "2026-12-02");
        expect(line).toContain("Semana 1 de 1");
        expect(line).not.toContain("Semana 1 de 2");
    });
});
