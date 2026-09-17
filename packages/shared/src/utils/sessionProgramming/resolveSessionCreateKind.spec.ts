import { describe, expect, it } from "vitest";
import {
    defaultSessionCreateKind,
    parseSessionCreateKindParam,
} from "./resolveSessionCreateKind";

describe("parseSessionCreateKindParam (D2)", () => {
    it("accepts program and standalone", () => {
        expect(parseSessionCreateKindParam("program")).toBe("program");
        expect(parseSessionCreateKindParam("standalone")).toBe("standalone");
    });

    it("returns null for unknown values", () => {
        expect(parseSessionCreateKindParam(null)).toBeNull();
        expect(parseSessionCreateKindParam("")).toBeNull();
        expect(parseSessionCreateKindParam("training")).toBeNull();
    });
});

describe("defaultSessionCreateKind (D2)", () => {
    it("forces program when planId in URL", () => {
        expect(
            defaultSessionCreateKind({ planIdFromUrl: 9, hasActivePlanForDate: false }),
        ).toBe("program");
    });

    it("prefers program when assignment covers date", () => {
        expect(
            defaultSessionCreateKind({ planIdFromUrl: null, hasActivePlanForDate: true }),
        ).toBe("program");
    });

    it("defaults to standalone without plan on date", () => {
        expect(
            defaultSessionCreateKind({ planIdFromUrl: null, hasActivePlanForDate: false }),
        ).toBe("standalone");
    });
});
