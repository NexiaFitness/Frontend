import { describe, expect, it } from "vitest";
import {
    buildCalendarCreateSessionSearchParams,
    buildTrainingSessionCountByDate,
    formatClientCalendarDaySessionCountAria,
    formatClientWorkoutSessionCountShort,
    filterSessionsOnDate,
    getClientSessionsOnDate,
    mergeClientTrainingAndStandaloneSessions,
    resolveClientDaySessionAction,
} from "./clientSessionsOnDate";

describe("clientSessionsOnDate", () => {
    it("formatClientWorkoutSessionCountShort — plural sesiones (no sesión+es)", () => {
        expect(formatClientWorkoutSessionCountShort(1)).toBe("1 sesión");
        expect(formatClientWorkoutSessionCountShort(6)).toBe("6 sesiones");
        expect(formatClientWorkoutSessionCountShort(6)).not.toContain("sesiónes");
        expect(formatClientWorkoutSessionCountShort(0)).toBe("");
    });

    it("formatClientCalendarDaySessionCountAria — usa conteo corto + de entrenamiento", () => {
        expect(formatClientCalendarDaySessionCountAria(1)).toBe("1 sesión de entrenamiento");
        expect(formatClientCalendarDaySessionCountAria(2)).toBe("2 sesiones de entrenamiento");
        expect(formatClientCalendarDaySessionCountAria(2)).not.toContain("sesiónes");
    });

    it("buildTrainingSessionCountByDate agrupa y omite canceladas", () => {
        const merged = [
            ...mergeClientTrainingAndStandaloneSessions(
                [{ id: 1, session_date: "2026-09-07", status: "planned" } as never],
                [{ id: 2, session_date: "2026-09-07", status: "planned" } as never],
            ),
            {
                id: 3,
                session_date: "2026-09-08",
                status: "cancelled",
                session_kind: "standalone",
            } as never,
        ];
        const counts = buildTrainingSessionCountByDate(merged);
        expect(counts.get("2026-09-07")).toBe(2);
        expect(counts.has("2026-09-08")).toBe(false);
    });

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

    it("resolveClientDaySessionAction — 0 / 1 / N", () => {
        expect(resolveClientDaySessionAction([])).toEqual({ kind: "create" });
        const one = {
            id: 1,
            session_kind: "standalone" as const,
            session_name: "A",
        } as never;
        expect(resolveClientDaySessionAction([one])).toEqual({
            kind: "open_one",
            session: one,
        });
        const two = [
            { id: 2, session_kind: "training" as const, session_name: "B" } as never,
            { id: 1, session_kind: "standalone" as const, session_name: "A" } as never,
        ];
        const pick = resolveClientDaySessionAction(two);
        expect(pick.kind).toBe("pick");
        if (pick.kind === "pick") {
            expect(pick.sessions.map((s) => s.id)).toEqual([1, 2]);
        }
    });

    it("buildCalendarCreateSessionSearchParams — planId solo en vigencia", () => {
        const inRange = buildCalendarCreateSessionSearchParams({
            clientId: 5,
            dateStr: "2026-06-15",
            activePlanId: 9,
            planStartDate: "2026-01-01",
            planEndDate: "2026-12-31",
        });
        expect(inRange.get("planId")).toBe("9");
        expect(inRange.get("sessionKind")).toBeNull();

        const outRange = buildCalendarCreateSessionSearchParams({
            clientId: 5,
            dateStr: "2027-01-01",
            activePlanId: 9,
            planStartDate: "2026-01-01",
            planEndDate: "2026-12-31",
        });
        expect(outRange.get("planId")).toBeNull();
    });
});
