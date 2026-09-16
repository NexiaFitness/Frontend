import { describe, expect, it } from "vitest";
import {
    buildClientSessionsPath,
    clearSessionsFocus,
    isSessionsCalendarFocus,
    isSessionsCalendarFocusQueryCleanup,
    SESSIONS_FOCUS_CALENDAR,
} from "../clientSessionsUrl";
import { shouldResetDashboardScrollOnNavigation } from "@/lib/dashboardScroll";

describe("clientSessionsUrl", () => {
    it("buildClientSessionsPath incluye tab, month y focus calendario", () => {
        const path = buildClientSessionsPath(346, {
            month: "2026-09-16",
            focusCalendar: true,
        });
        expect(path).toBe(
            "/dashboard/clients/346?tab=sessions&month=2026-09-16&sessionsFocus=calendar",
        );
    });

    it("isSessionsCalendarFocus y clearSessionsFocus", () => {
        const params = new URLSearchParams("tab=sessions&sessionsFocus=calendar");
        expect(isSessionsCalendarFocus(params)).toBe(true);
        const cleared = clearSessionsFocus(params);
        expect(cleared.get("sessionsFocus")).toBeNull();
        expect(cleared.get("tab")).toBe("sessions");
        expect(SESSIONS_FOCUS_CALENDAR).toBe("calendar");
    });

    it("no resetea scroll al limpiar sessionsFocus en la misma ruta", () => {
        const path = "/dashboard/clients/346";
        const withFocus = "?tab=sessions&month=2026-09-16&sessionsFocus=calendar";
        const withoutFocus = "?tab=sessions&month=2026-09-16";
        expect(
            isSessionsCalendarFocusQueryCleanup(withFocus, withoutFocus),
        ).toBe(true);
        expect(
            shouldResetDashboardScrollOnNavigation(
                { pathname: path, search: withFocus },
                { pathname: path, search: withoutFocus },
            ),
        ).toBe(false);
    });
});
