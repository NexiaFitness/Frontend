import { describe, expect, it } from "vitest";
import {
    filterSessionsOnDate,
    getClientSessionsOnDate,
    mergeClientTrainingAndStandaloneSessions,
} from "./clientSessionsOnDate";

describe("clientSessionsOnDate", () => {
    it("filterSessionsOnDate normaliza ISO a YYYY-MM-DD", () => {
        const rows = [
            { session_date: "2026-09-16T00:00:00" },
            { session_date: "2026-09-17" },
        ];
        expect(filterSessionsOnDate(rows, "2026-09-16")).toHaveLength(1);
    });

    it("getClientSessionsOnDate merge training + standalone", () => {
        const onDay = getClientSessionsOnDate(
            [
                {
                    id: 1,
                    session_date: "2026-09-16",
                    session_name: "Prog",
                } as never,
            ],
            [
                {
                    id: 2,
                    session_date: "2026-09-16",
                    session_name: "Suelta",
                } as never,
            ],
            "2026-09-16",
        );
        expect(onDay).toHaveLength(2);
        expect(onDay.map((s) => s.session_kind).sort()).toEqual(["standalone", "training"]);
    });

    it("mergeClientTrainingAndStandaloneSessions ordena por fecha desc", () => {
        const merged = mergeClientTrainingAndStandaloneSessions(
            [{ id: 1, session_date: "2026-09-01" } as never],
            [{ id: 2, session_date: "2026-09-20" } as never],
        );
        expect(merged[0]?.session_date).toBe("2026-09-20");
    });
});
