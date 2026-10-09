import { describe, expect, it } from "vitest";
import { formatPrescriptionTableRest } from "./athletePrescriptionTableFormat";

describe("athletePrescriptionTableFormat", () => {
    it("formats rest without descanso suffix", () => {
        expect(formatPrescriptionTableRest(90)).toBe("1:30");
        expect(formatPrescriptionTableRest(60)).toBe("1m");
        expect(formatPrescriptionTableRest(45)).toBe("45s");
    });
});
