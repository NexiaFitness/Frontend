import { describe, expect, it } from "vitest";
import {
    buildAthleteStrengthPrescriptionGroupMeta,
    formatAthletePreviewGroupKindLabel,
    isStrengthPrescriptionMapKind,
    strengthPrescriptionToggleLabels,
} from "./athleteStrengthPrescriptionPresentation";

describe("athleteStrengthPrescriptionPresentation", () => {
    it("marks strength map kinds", () => {
        expect(isStrengthPrescriptionMapKind("single_set")).toBe(true);
        expect(isStrengthPrescriptionMapKind("emom")).toBe(false);
    });

    it("formats group kind labels", () => {
        expect(formatAthletePreviewGroupKindLabel("single_set")).toBe("Single set");
        expect(formatAthletePreviewGroupKindLabel("dropset")).toBe("Drop set");
    });

    it("uses dropset toggle copy", () => {
        expect(strengthPrescriptionToggleLabels("dropset").show).toBe("Ver series");
        expect(strengthPrescriptionToggleLabels("dropset").rowColumn).toBe("Drop");
    });

    it("puts rounds in meta not in kind label", () => {
        const meta = buildAthleteStrengthPrescriptionGroupMeta({
            kind: "superset",
            rounds: 3,
            restBetweenSeconds: 90,
        });
        expect(meta[0]).toBe("3 rondas");
        expect(meta.some((l) => l.includes("Descanso entre rondas"))).toBe(false);
    });

    it("superset uses Ver series like single set", () => {
        expect(strengthPrescriptionToggleLabels("superset").show).toBe("Ver series");
    });

    it("timed modalities use Ver series expand copy", () => {
        for (const kind of ["amrap", "emom"] as const) {
            expect(strengthPrescriptionToggleLabels(kind).show).toBe("Ver series");
            expect(strengthPrescriptionToggleLabels(kind).hide).toBe("Ocultar series");
        }
        expect(strengthPrescriptionToggleLabels("for_time").rowColumn).toBe("Ronda");
    });
});
