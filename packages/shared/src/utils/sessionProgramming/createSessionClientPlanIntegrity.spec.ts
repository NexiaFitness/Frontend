import { describe, expect, it } from "vitest";
import { buildCreateSessionQueryFromBlock } from "./buildCreateSessionQueryFromBlock";
import { resolveCreateSessionClientContext } from "./resolveCreateSessionClientContext";

describe("resolveCreateSessionClientContext", () => {
    it("uses plan.client_id when planId is set and query client matches", () => {
        expect(
            resolveCreateSessionClientContext({
                queryClientId: 10,
                planId: 99,
                planClientId: 10,
                isPlanLoading: false,
            }),
        ).toEqual({ status: "ready", effectiveClientId: 10 });
    });

    it("blocks mismatch between query clientId and plan owner", () => {
        expect(
            resolveCreateSessionClientContext({
                queryClientId: 345,
                planId: 548,
                planClientId: 354,
                isPlanLoading: false,
            }),
        ).toEqual({
            status: "mismatch",
            queryClientId: 345,
            planClientId: 354,
        });
    });

    it("allows plan-only URL without clientId query", () => {
        expect(
            resolveCreateSessionClientContext({
                queryClientId: null,
                planId: 548,
                planClientId: 354,
                isPlanLoading: false,
            }),
        ).toEqual({ status: "ready", effectiveClientId: 354 });
    });
});

describe("buildCreateSessionQueryFromBlock (G1)", () => {
    it("includes required navigation params", () => {
        const qs = buildCreateSessionQueryFromBlock({
            clientId: 10,
            planId: 20,
            block: { id: 3, start_date: "2026-09-01", end_date: "2026-09-30" },
            anchorDate: "2026-09-10",
            weeklyStructureWeeks: [],
            sessionsInBlock: [],
        });
        expect(qs.get("clientId")).toBe("10");
        expect(qs.get("planId")).toBe("20");
        expect(qs.get("periodBlockId")).toBe("3");
        expect(qs.get("sessionKind")).toBe("program");
        expect(qs.get("date")).toBeTruthy();
    });
});
