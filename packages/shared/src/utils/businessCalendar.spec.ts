/**
 * businessCalendar.spec.ts — Instant fijos Europe/Madrid (D-REP-6).
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { describe, expect, it } from "vitest";
import {
    businessDayYmdFromInstant,
    businessTodayYmd,
    isWeekFinished,
    weekSundayYmd,
} from "./businessCalendar";

describe("businessCalendar", () => {
    it("2026-10-10T22:30:00Z → 2026-10-11 en Madrid (CEST)", () => {
        expect(
            businessDayYmdFromInstant(new Date("2026-10-10T22:30:00.000Z")),
        ).toBe("2026-10-11");
    });

    it("2026-11-10T23:30:00Z → 2026-11-11 en Madrid (CET)", () => {
        expect(
            businessDayYmdFromInstant(new Date("2026-11-10T23:30:00.000Z")),
        ).toBe("2026-11-11");
    });

    it("isWeekFinished: domingo anterior a hoy", () => {
        const monday = "2026-10-05";
        expect(weekSundayYmd(monday)).toBe("2026-10-11");
        expect(isWeekFinished(monday, "2026-10-11")).toBe(false);
        expect(isWeekFinished(monday, "2026-10-12")).toBe(true);
    });

    it("businessTodayYmd usa instante proporcionado", () => {
        expect(
            businessTodayYmd(new Date("2026-10-10T22:30:00.000Z")),
        ).toBe("2026-10-11");
    });
});
