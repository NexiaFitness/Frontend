import { describe, expect, it } from "vitest";
import { formatTrainerTimedEmomScore } from "./formatTrainerTimedEmomScore";

describe("formatTrainerTimedEmomScore", () => {
    it("casos contrato timed_block_result_detail_contract_v1", () => {
        expect(
            formatTrainerTimedEmomScore(6, 0, {
                kind: "emom",
                interval_total: 6,
                as_planned: true,
            })
        ).toBe("6/6 intervalos");

        expect(
            formatTrainerTimedEmomScore(null, null, {
                kind: "emom",
                interval_total: 6,
                as_planned: false,
                athlete_note: "Nota",
            })
        ).toBe("EMOM no completado");

        expect(
            formatTrainerTimedEmomScore(0, 0, {
                kind: "emom",
                interval_total: 6,
                as_planned: true,
                finished_early: true,
                completed_interval_count: 0,
            })
        ).toBe("0/6 intervalos");
    });
});
