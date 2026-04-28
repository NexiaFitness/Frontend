import { describe, expect, it } from "vitest";
import { buildWeeklyVolumePanelRows, summarizeVolumeRowStatuses } from "./weeklyVolumePanelModel";
import { mondayOfIsoWeekContaining } from "../utils/isoWeekRange";

describe("mondayOfIsoWeekContaining", () => {
    it("returns Monday for a Wednesday in April 2026", () => {
        expect(mondayOfIsoWeekContaining("2026-04-15")).toBe("2026-04-13");
    });

    it("returns same Monday when input is Monday", () => {
        expect(mondayOfIsoWeekContaining("2026-04-13")).toBe("2026-04-13");
    });
});

describe("buildWeeklyVolumePanelRows", () => {
    it("marks no_target when target is null", () => {
        const rows = buildWeeklyVolumePanelRows(
            [{ muscle_group_id: 1, name_es: "Pecho", planned_sets_sum: 5 }],
            null
        );
        expect(rows[0].status).toBe("no_target");
        expect(rows[0].rangeMin).toBeNull();
        expect(rows[0].draftSets).toBe(0);
        expect(rows[0].targetToday).toBeNull();
    });

    it("classifies deficit and excess with ±10% band (weekly fallback)", () => {
        const target = 10;
        const rows = buildWeeklyVolumePanelRows(
            [
                { muscle_group_id: 1, name_es: "A", planned_sets_sum: 8 },
                { muscle_group_id: 2, name_es: "B", planned_sets_sum: 10 },
                { muscle_group_id: 3, name_es: "C", planned_sets_sum: 12 },
            ],
            target
        );
        expect(rows[0].status).toBe("deficit");   // 8 < 9
        expect(rows[1].status).toBe("on_target"); // 10 within 9–11
        expect(rows[2].status).toBe("excess");    // 12 > 11
    });

    it("classifies daily mode when daily_target is provided", () => {
        const target = 10; // targetCenter semanal, no se usa en modo diario
        const rows = buildWeeklyVolumePanelRows(
            [
                { muscle_group_id: 1, name_es: "A", planned_sets_sum: 20, draft_sets: 3, daily_target: 5 },
                { muscle_group_id: 2, name_es: "B", planned_sets_sum: 20, draft_sets: 5, daily_target: 5 },
                { muscle_group_id: 3, name_es: "C", planned_sets_sum: 20, draft_sets: 6, daily_target: 5 },
            ],
            target
        );
        // daily_target=5 => range 4–5 (floor 4.5=4, ceil 5.5=6)
        expect(rows[0].status).toBe("deficit");   // 3 < 4
        expect(rows[0].targetToday).toBe(5);
        expect(rows[0].draftSets).toBe(3);
        expect(rows[1].status).toBe("on_target"); // 5 within 4–6
        expect(rows[2].status).toBe("on_target"); // 6 === 6 => on_target
    });

    it("daily mode: excess when strictly above ceil band", () => {
        const rows = buildWeeklyVolumePanelRows(
            [
                { muscle_group_id: 1, name_es: "X", planned_sets_sum: 10, draft_sets: 7, daily_target: 5 },
            ],
            10
        );
        // daily_target=5 => rangeMax = max(4, ceil(5.5)) = 6
        expect(rows[0].status).toBe("excess"); // 7 > 6
    });
});

describe("summarizeVolumeRowStatuses", () => {
    it("counts statuses", () => {
        const s = summarizeVolumeRowStatuses([
            { muscleGroupId: 1, nameEs: "", accumulated: 1, draftSets: 1, targetToday: null, rangeMin: 1, rangeMax: 2, targetCenter: 1, status: "deficit" },
            { muscleGroupId: 2, nameEs: "", accumulated: 2, draftSets: 2, targetToday: null, rangeMin: 1, rangeMax: 2, targetCenter: 1, status: "on_target" },
        ]);
        expect(s.deficit).toBe(1);
        expect(s.on_target).toBe(1);
        expect(s.excess).toBe(0);
    });
});
