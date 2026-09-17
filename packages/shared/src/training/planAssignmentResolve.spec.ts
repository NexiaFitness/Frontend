import { describe, it, expect } from "vitest";
import type { TrainingPlanInstance } from "../types/training";
import {
    assignmentRangesOverlap,
    dayBeforeYmd,
    findOverlappingCommittedInstances,
    pickAssignmentCoveringDate,
    proposedTrimEndYmd,
} from "./planAssignmentResolve";

function inst(partial: Partial<TrainingPlanInstance> & Pick<TrainingPlanInstance, "id">): TrainingPlanInstance {
    return {
        template_id: null,
        source_plan_id: 1,
        client_id: 52,
        trainer_id: 1,
        name: "Plan",
        description: null,
        goal: "hypertrophy",
        status: "active",
        customizations: null,
        assigned_at: "",
        template_revision_snapshot_id: null,
        template_revision_number: null,
        materialized_at: null,
        materialized_structure_hash: null,
        created_at: "",
        updated_at: "",
        is_active: true,
        start_date: "2026-09-01",
        end_date: "2026-10-01",
        ...partial,
    };
}

describe("assignmentRangesOverlap", () => {
    it("A.end == B.start → solape (inclusivo)", () => {
        expect(
            assignmentRangesOverlap("2026-09-01", "2026-10-01", "2026-10-01", "2026-11-01")
        ).toBe(true);
    });

    it("B.start == A.end + 1 día → no solape", () => {
        expect(
            assignmentRangesOverlap("2026-09-01", "2026-10-01", "2026-10-02", "2026-11-01")
        ).toBe(false);
    });
});

describe("proposedTrimEndYmd", () => {
    it("recorta al día anterior al incoming", () => {
        expect(proposedTrimEndYmd("2026-09-01", "2026-09-25")).toBe("2026-09-24");
    });
});

describe("dayBeforeYmd", () => {
    it("resta un día calendario", () => {
        expect(dayBeforeYmd("2026-09-25")).toBe("2026-09-24");
    });
});

describe("findOverlappingCommittedInstances", () => {
    it("ignora completed", () => {
        const rows = [
            inst({ id: 1, status: "completed", start_date: "2026-09-01", end_date: "2026-10-30" }),
            inst({ id: 2, status: "active", start_date: "2026-09-01", end_date: "2026-10-01" }),
        ];
        const found = findOverlappingCommittedInstances(
            rows,
            52,
            "2026-09-20",
            "2026-11-01"
        );
        expect(found.map((i) => i.id)).toEqual([2]);
    });
});

describe("pickAssignmentCoveringDate", () => {
    it("no devuelve futuro si hoy no está en rango", () => {
        const day = new Date(2026, 8, 16);
        const rows = [
            inst({
                id: 10,
                start_date: "2026-10-02",
                end_date: "2026-11-30",
            }),
        ];
        expect(pickAssignmentCoveringDate(rows, 52, day)).toBeUndefined();
    });

    it("devuelve instancia que cubre hoy", () => {
        const day = new Date(2026, 8, 16);
        const rows = [
            inst({ id: 1, start_date: "2026-09-01", end_date: "2026-09-30" }),
        ];
        expect(pickAssignmentCoveringDate(rows, 52, day)?.id).toBe(1);
    });
});
