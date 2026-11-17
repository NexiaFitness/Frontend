import { describe, expect, it } from "vitest";
import { formatConstructorDayLabel } from "./weeklyVolumePanelPresentation";
import {
    buildWeeklyVolumePanelRows,
    formatVolumeRatioHoy,
    mapSessionLoadDraftRowToPanelInput,
    resolveWeekAlert,
} from "./weeklyVolumePanelModel";

function pecRow(overrides: Record<string, unknown> = {}) {
    return mapSessionLoadDraftRowToPanelInput({
        muscle_group_id: 1,
        name_es: "Pectorales",
        draft_sets: 5,
        draft_direct: 5,
        draft_indirect: 0,
        daily_target: 5,
        accumulated_saved_without_session: 0,
        structure_weekdays: [1, 4],
        ...overrides,
    });
}

describe("volumen del constructor: solo el día", () => {
    it("la cifra es el directo de hoy sobre el objetivo de hoy", () => {
        const rows = buildWeeklyVolumePanelRows([pecRow()], 11, 1);
        expect(formatVolumeRatioHoy(rows[0])).toBe("5/5");
        expect(rows[0].status).toBe("on_target");
        expect(rows[0].weekAlert).toBeNull();
    });

    it("el aviso de semana usa el efectivo y no cambia el estado de hoy", () => {
        const rows = buildWeeklyVolumePanelRows(
            [
                pecRow({
                    draft_sets: 5,
                    draft_direct: 3,
                    draft_indirect: 2,
                    daily_target: 5,
                    accumulated_saved_without_session: 0,
                    structure_weekdays: [1],
                }),
            ],
            11,
            1,
        );
        expect(formatVolumeRatioHoy(rows[0])).toBe("3/5");
        expect(rows[0].status).toBe("deficit");
        expect(rows[0].weekAlert).toEqual({ kind: "last_day_short", remaining: 6 });
    });

    it("5 de hoy en rango no dice semana completa si el efectivo no llega", () => {
        const rows = buildWeeklyVolumePanelRows([pecRow()], 11, 1);
        expect(rows[0].status).toBe("on_target");
        expect(rows[0].weekAlert).toBeNull();
    });

    it("la semana completa avisa aunque hoy esté en rango", () => {
        const rows = buildWeeklyVolumePanelRows(
            [pecRow({ accumulated_saved_without_session: 6 })],
            11,
            1,
        );
        expect(rows[0].status).toBe("on_target");
        expect(rows[0].weekAlert).toEqual({ kind: "complete", remaining: null });
    });

    it("sin días de estructura no inventa el último día", () => {
        expect(resolveWeekAlert(5, 11, 1, [])).toBeNull();
        expect(resolveWeekAlert(5, 11, null, [1])).toBeNull();
    });

    it("etiqueta el martes 17 nov 2026", () => {
        expect(formatConstructorDayLabel("2026-11-17")).toBe("mar 17");
    });
});
