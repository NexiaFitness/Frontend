import { describe, expect, it } from "vitest";
import {
    buildWeeklyVolumePanelRows,
    formatVolumeRatioHoy,
    mapSessionLoadDraftRowToPanelInput,
    mapWeeklySavedRowToPanelInput,
} from "./weeklyVolumePanelModel";

describe("mapSessionLoadDraftRowToPanelInput", () => {
    it("usa solo draft_sets y desglose del borrador (no acumulado semanal)", () => {
        const input = mapSessionLoadDraftRowToPanelInput({
            muscle_group_id: 1,
            name_es: "glúteos",
            draft_sets: 4,
            draft_direct: 3,
            draft_indirect: 1,
            daily_target: 9,
            pattern_session_days: 2,
        });

        expect(input.planned_sets_sum).toBe(4);
        expect(input.direct_sets).toBe(3);
        expect(input.indirect_sets).toBe(1);
        expect(input.data_scope).toBe("session_draft");
    });
});

describe("buildWeeklyVolumePanelRows", () => {
    it("modo diario: status según draft_sets vs daily_target", () => {
        const rows = buildWeeklyVolumePanelRows(
            [
                mapSessionLoadDraftRowToPanelInput({
                    muscle_group_id: 1,
                    name_es: "glúteos",
                    draft_sets: 4,
                    draft_direct: 3,
                    draft_indirect: 1,
                    daily_target: 9,
                }),
            ],
            18
        );

        expect(rows[0]?.draftSets).toBe(4);
        expect(rows[0]?.accumulated).toBe(4);
        expect(rows[0]?.status).toBe("deficit");
        expect(rows[0]?.dataScope).toBe("session_draft");
    });

    it("fallback semanal: session_draft usa draft_sets como numerador, no projected_total", () => {
        const rows = buildWeeklyVolumePanelRows(
            [
                {
                    muscle_group_id: 2,
                    name_es: "cuádriceps",
                    planned_sets_sum: 4,
                    direct_sets: 3,
                    indirect_sets: 1,
                    draft_sets: 4,
                    daily_target: 0,
                    data_scope: "session_draft",
                },
            ],
            18
        );

        expect(rows[0]?.status).toBe("deficit");
        expect(formatVolumeRatioHoy(rows[0]!)).toBe("4 / 18 esta sesión");
    });

    it("weekly_saved: numerador es acumulado semanal guardado", () => {
        const rows = buildWeeklyVolumePanelRows(
            [mapWeeklySavedRowToPanelInput({
                muscle_group_id: 3,
                name_es: "gemelos",
                planned_sets_sum: 11,
                direct_sets: 9,
                indirect_sets: 2,
            })],
            18
        );

        expect(rows[0]?.accumulated).toBe(11);
        expect(formatVolumeRatioHoy(rows[0]!)).toBe("11 / 18 semana");
    });
});
