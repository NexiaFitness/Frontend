import { describe, expect, it } from "vitest";

import type { TrainingSession } from "@nexia/shared/types/trainingSessions";

import { countSessionsInPeriodBlockPhase } from "../planningShellUtils";

const block = {
    id: 10,
    start_date: "2026-09-16",
    end_date: "2026-10-31",
};

function session(
    partial: Pick<TrainingSession, "id" | "session_date" | "period_block_id">,
): TrainingSession {
    return {
        id: partial.id,
        session_date: partial.session_date,
        period_block_id: partial.period_block_id,
        session_name: "Test",
        training_plan_id: 1,
        status: "planned",
    } as TrainingSession;
}

describe("countSessionsInPeriodBlockPhase", () => {
    it("cuenta solo sesiones en rango de fechas del bloque", () => {
        const sessions = [
            session({ id: 1, session_date: "2026-09-20", period_block_id: 10 }),
            session({ id: 2, session_date: "2026-11-01", period_block_id: 10 }),
            session({ id: 3, session_date: "2026-10-01", period_block_id: 99 }),
        ];
        expect(countSessionsInPeriodBlockPhase(sessions, block)).toBe(1);
    });

    it("incluye sesiones sin period_block_id si la fecha cae en la fase", () => {
        const sessions = [
            session({ id: 1, session_date: "2026-10-01", period_block_id: null }),
        ];
        expect(countSessionsInPeriodBlockPhase(sessions, block)).toBe(1);
    });
});
