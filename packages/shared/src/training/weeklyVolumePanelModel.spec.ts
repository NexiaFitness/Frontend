import { describe, expect, it } from "vitest";
import {
    buildWeeklyVolumePanelRows,
    formatVolumeRatioHoy,
    mapSessionLoadDraftRowToPanelInput,
} from "./weeklyVolumePanelModel";

describe("B6 #7 weekly + hoy", () => {
    it("el mapper no descarta accumulated_saved_without_session", () => {
        const input = mapSessionLoadDraftRowToPanelInput({
            muscle_group_id: 1,
            name_es: "Pecho",
            draft_sets: 4,
            draft_direct: 4,
            draft_indirect: 0,
            daily_target: 4,
            accumulated_saved_without_session: 8,
        });
        expect(input.accumulated_saved_without_session).toBe(8);
    });

    it("muestra acumulado semanal como cifra principal y +N hoy", () => {
        const rows = buildWeeklyVolumePanelRows(
            [
                mapSessionLoadDraftRowToPanelInput({
                    muscle_group_id: 1,
                    name_es: "Pecho",
                    draft_sets: 4,
                    daily_target: 4,
                    accumulated_saved_without_session: 8,
                }),
            ],
            16
        );
        expect(formatVolumeRatioHoy(rows[0])).toBe("12 / 16 semana +4 hoy");
    });

    it("sin acumulado guardado sigue el ratio de hoy (V1 / GET semanal)", () => {
        const rows = buildWeeklyVolumePanelRows(
            [
                mapSessionLoadDraftRowToPanelInput({
                    muscle_group_id: 1,
                    name_es: "Pecho",
                    draft_sets: 4,
                    daily_target: 4,
                }),
            ],
            16
        );
        expect(formatVolumeRatioHoy(rows[0])).toBe("4 / 4 programadas · hoy");
    });
});
