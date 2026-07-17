/**
 * Unit tests — parseEvaluationValue / time units (E13).
 */
import { describe, expect, it } from "vitest";
import {
    isTimeUnit,
    parseEvaluationValue,
    unitSelectOptions,
} from "./createTestEvaluationPresentation";

describe("parseEvaluationValue", () => {
    it("parses decimal with comma", () => {
        expect(parseEvaluationValue("12,5", "kg")).toEqual({ ok: true, value: 12.5 });
    });

    it("parses min:seg to seconds", () => {
        expect(parseEvaluationValue("1:25", "s")).toEqual({ ok: true, value: 85 });
        expect(parseEvaluationValue("0:45", "s")).toEqual({ ok: true, value: 45 });
        expect(parseEvaluationValue("0:05", "seg")).toEqual({ ok: true, value: 5 });
    });

    it("accepts raw seconds when unit is s", () => {
        expect(parseEvaluationValue("85", "s")).toEqual({ ok: true, value: 85 });
    });

    it("rejects invalid min:seg", () => {
        expect(parseEvaluationValue("1:75", "s")).toEqual({
            ok: false,
            timeExpected: true,
        });
        expect(parseEvaluationValue("1:2:3", "s")).toEqual({
            ok: false,
            timeExpected: true,
        });
    });
});

describe("isTimeUnit / unitSelectOptions", () => {
    it("detects seconds unit", () => {
        expect(isTimeUnit("s")).toBe(true);
        expect(isTimeUnit("seg")).toBe(true);
        expect(isTimeUnit("kg")).toBe(false);
    });

    it("injects unknown unit into options", () => {
        const opts = unitSelectOptions("watt");
        expect(opts[0]).toEqual({ value: "watt", label: "watt" });
    });
});
