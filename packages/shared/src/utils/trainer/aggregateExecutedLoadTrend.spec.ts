import { describe, expect, it } from "vitest";
import { aggregateExecutedLoadByPeriod } from "./aggregateExecutedLoadTrend";
import type { SessionExecutedLoadRow } from "../../types/trainerSetExecutions";

describe("aggregateExecutedLoadByPeriod", () => {
    const rows: SessionExecutedLoadRow[] = [
        {
            training_session_id: 1,
            session_date: "2026-06-23",
            tonnage_kg: 800,
            executions_count: 4,
        },
        {
            training_session_id: 2,
            session_date: "2026-06-20",
            tonnage_kg: 400,
            executions_count: 2,
        },
    ];

    it("agrupa por semana ISO (lunes)", () => {
        const buckets = aggregateExecutedLoadByPeriod(rows, "weekly");
        expect(buckets).toHaveLength(2);
        expect(buckets[0].tonnage_kg).toBe(400);
        expect(buckets[1].tonnage_kg).toBe(800);
    });

    it("agrupa por mes", () => {
        const buckets = aggregateExecutedLoadByPeriod(rows, "monthly");
        expect(buckets).toHaveLength(1);
        expect(buckets[0].tonnage_kg).toBe(1200);
        expect(buckets[0].sessions_count).toBe(2);
    });
});
