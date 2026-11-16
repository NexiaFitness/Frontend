import { describe, expect, it } from "vitest";
import { formatClientVolumeCapacitySetsLabel } from "./volumeIntensityContext";

describe("formatClientVolumeCapacitySetsLabel (A6)", () => {
    it("con rango global uniforme muestra solo el máximo", () => {
        expect(
            formatClientVolumeCapacitySetsLabel({
                minSets: 8,
                maxSets: 16,
                variesByMuscleGroup: false,
            })
        ).toBe("16 series por grupo muscular a la semana");
    });

    it("sin mínimo (solo techo) también muestra el máximo", () => {
        expect(
            formatClientVolumeCapacitySetsLabel({
                minSets: null,
                maxSets: 16,
                variesByMuscleGroup: false,
            })
        ).toBe("16 series por grupo muscular a la semana");
    });

    it("si el máximo varía por grupo deja el rango", () => {
        expect(
            formatClientVolumeCapacitySetsLabel({
                minSets: 8,
                maxSets: 16,
                variesByMuscleGroup: true,
            })
        ).toBe("8–16 series por grupo muscular a la semana");
    });

    it("si varía por grupo pero min y max coinciden, solo el máximo", () => {
        expect(
            formatClientVolumeCapacitySetsLabel({
                minSets: 16,
                maxSets: 16,
                variesByMuscleGroup: true,
            })
        ).toBe("16 series por grupo muscular a la semana");
    });
});
