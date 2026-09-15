import { describe, expect, it } from "vitest";
import {
    applyClientDetailHomeSearchParams,
    buildClientHomePath,
    isClientDetailHomeSearchParams,
} from "../trainingPlanNavigation";

describe("trainingPlanNavigation — client home", () => {
    it("buildClientHomePath apunta al tab overview", () => {
        expect(buildClientHomePath(346)).toBe("/dashboard/clients/346?tab=overview");
    });

    it("isClientDetailHomeSearchParams es true solo en resumen limpio", () => {
        expect(isClientDetailHomeSearchParams(new URLSearchParams("tab=overview"))).toBe(true);
        expect(isClientDetailHomeSearchParams(new URLSearchParams())).toBe(true);
        expect(isClientDetailHomeSearchParams(new URLSearchParams("tab=planning&plan=1"))).toBe(
            false,
        );
        expect(
            isClientDetailHomeSearchParams(
                new URLSearchParams("tab=planning&blockAuthor=create&blockStep=qualities"),
            ),
        ).toBe(false);
    });

    it("applyClientDetailHomeSearchParams limpia sub-journeys y fija overview", () => {
        const prev = new URLSearchParams(
            "tab=planning&plan=99&planTab=execution&blockAuthor=edit&blockId=3&planningView=analytics&focus=alerts",
        );
        const next = applyClientDetailHomeSearchParams(prev);
        expect(next.get("tab")).toBe("overview");
        expect(next.get("plan")).toBeNull();
        expect(next.get("blockAuthor")).toBeNull();
        expect(next.get("planningView")).toBeNull();
        expect(next.get("focus")).toBeNull();
    });
});
