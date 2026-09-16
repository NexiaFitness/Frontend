import { describe, expect, it, vi } from "vitest";

import { navigateDashboardBack, readSafeReturnTo } from "../sessionDetailNavigation";

describe("readSafeReturnTo", () => {
    it("accepts internal dashboard paths only", () => {
        expect(readSafeReturnTo({ from: "/dashboard/clients/1?tab=sessions" })).toBe(
            "/dashboard/clients/1?tab=sessions",
        );
        expect(readSafeReturnTo({ from: "https://evil.example/x" })).toBeNull();
        expect(readSafeReturnTo({ from: "/login" })).toBeNull();
    });
});

describe("navigateDashboardBack", () => {
    it("prefers state.from", () => {
        const navigate = vi.fn();
        navigateDashboardBack(navigate, { from: "/dashboard/sessions" }, "/dashboard");
        expect(navigate).toHaveBeenCalledWith("/dashboard/sessions");
    });

    it("uses history back when from is missing and idx > 0", () => {
        const navigate = vi.fn();
        vi.spyOn(window.history, "state", "get").mockReturnValue({ idx: 2 });
        navigateDashboardBack(navigate, null, "/dashboard/sessions");
        expect(navigate).toHaveBeenCalledWith(-1);
    });

    it("falls back when no from and no history", () => {
        const navigate = vi.fn();
        vi.spyOn(window.history, "state", "get").mockReturnValue({ idx: 0 });
        navigateDashboardBack(navigate, null, "/dashboard/sessions");
        expect(navigate).toHaveBeenCalledWith("/dashboard/sessions");
    });
});
