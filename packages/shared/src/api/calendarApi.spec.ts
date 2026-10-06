import { describe, expect, it } from "vitest";
import { buildCalendarEventsSearchParams } from "./calendarApi";

describe("buildCalendarEventsSearchParams I5", () => {
    it("convierte YYYY-MM-DD a instantes aware de Madrid", () => {
        const params = buildCalendarEventsSearchParams({
            from: "2026-10-07",
            to: "2026-10-07",
        });
        expect(params.get("from")).toBe("2026-10-06T22:00:00.000Z");
        expect(params.get("to")).toBe("2026-10-07T21:59:59.000Z");
        expect(params.get("from")?.includes("T00:00:00")).toBe(false);
    });
});
