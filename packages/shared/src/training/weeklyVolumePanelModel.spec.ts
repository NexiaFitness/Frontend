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
    });

    it("classifies deficit and excess with ±10% band", () => {
        const target = 10;
        const rows = buildWeeklyVolumePanelRows(
            [
                { muscle_group_id: 1, name_es: "A", planned_sets_sum: 8 },
                { muscle_group_id: 2, name_es: "B", planned_sets_sum: 12 },
            ],
            target
        );
        expect(rows[0].status).toBe("deficit");
        expect(rows[1].status).toBe("on_target");
    });
});

describe("summarizeVolumeRowStatuses", () => {
    it("counts statuses", () => {
        const s = summarizeVolumeRowStatuses([
            { muscleGroupId: 1, nameEs: "", accumulated: 1, rangeMin: 1, rangeMax: 2, targetCenter: 1, status: "deficit" },
            { muscleGroupId: 2, nameEs: "", accumulated: 2, rangeMin: 1, rangeMax: 2, targetCenter: 1, status: "on_target" },
        ]);
        expect(s.deficit).toBe(1);
        expect(s.on_target).toBe(1);
        expect(s.excess).toBe(0);
    });
});
