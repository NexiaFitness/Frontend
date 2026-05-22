import { describe, expect, it } from "vitest";
import {
    formatVolumeRatioHoy,
    resolveDailyVolumeStatus,
    volumeMuscleValidationToPanelRow,
    volumeStatusLabel,
} from "./weeklyVolumePanelModel";

describe("weeklyVolumePanelModel", () => {
    it("resolveDailyVolumeStatus usa banda ±10 %", () => {
        expect(resolveDailyVolumeStatus(3, 10)).toBe("deficit");
        expect(resolveDailyVolumeStatus(10, 10)).toBe("on_target");
        expect(resolveDailyVolumeStatus(12, 10)).toBe("excess");
    });

    it("volumeMuscleValidationToPanelRow mapea validación sin porcentaje", () => {
        const row = volumeMuscleValidationToPanelRow({
            muscle_group_id: 2,
            name_es: "espalda",
            weekly_target: 13,
            daily_expected: 10,
            actual_sets: 3,
        });
        expect(row.status).toBe("deficit");
        expect(row.draftSets).toBe(3);
        expect(row.targetToday).toBe(10);
    });

    it("formatVolumeRatioHoy session_review incluye 'series hoy'", () => {
        const text = formatVolumeRatioHoy(
            { draftSets: 3, targetToday: 13, accumulated: 3, rangeMax: null, targetCenter: 13 },
            "session_review"
        );
        expect(text).toBe("3 / 13 series hoy");
    });

    it("volumeStatusLabel coincide con constructor", () => {
        expect(volumeStatusLabel("deficit")).toBe("Déficit");
        expect(volumeStatusLabel("on_target")).toBe("En rango");
        expect(volumeStatusLabel("excess")).toBe("Exceso");
    });
});
