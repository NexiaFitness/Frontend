/**
 * athleteRunStepKeysReference.v1.spec.ts — Parte B: copias JSON + claves FE.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SET_TYPE } from "../../types/sessionProgramming";
import reference from "../../fixtures/athlete_run_step_keys_v1.json";
import { buildAthleteRunSteps, type AthleteRunStep } from "./buildAthleteRunSteps";
import {
    block,
    dropLine,
    parallelLine,
    singleLine,
    timedLine,
    viewFromBlock,
} from "./athleteRunStepKeysReference.v1.fixtures";
import type { SessionStructureView } from "../../sessionProgramming/sessionBlockView";

const here = dirname(fileURLToPath(import.meta.url));

function collectExecutionStepKeys(steps: AthleteRunStep[]): string[] {
    const keys: string[] = [];
    for (const step of steps) {
        if (step.kind === "single_set") keys.push(step.stepKey);
        else if (step.kind === "group_round") {
            for (const slot of step.slots ?? []) keys.push(slot.stepKey);
        } else if (step.kind === "timed_block") keys.push(step.stepKey);
    }
    return keys.sort();
}

function viewForCase(caseId: string): SessionStructureView {
    switch (caseId) {
        case "single_set_planned_3":
            return viewFromBlock(block(10, SET_TYPE.SINGLE_SET), [singleLine(1, 100, 3)]);
        case "superset_2_rounds":
            return viewFromBlock(block(20, SET_TYPE.SUPERSET, 2), [
                parallelLine(1, 100, 1, 20),
                parallelLine(2, 200, 2, 20),
            ]);
        case "amrap_timed":
            return viewFromBlock(block(30, SET_TYPE.AMRAP, 3), [timedLine(1, 100, 1, SET_TYPE.AMRAP, 30)]);
        case "emom_timed":
            return viewFromBlock(block(40, SET_TYPE.EMOM, 3), [timedLine(1, 100, 1, SET_TYPE.EMOM, 40)]);
        case "for_time_timed":
            return viewFromBlock(block(41, SET_TYPE.FOR_TIME, 3), [
                timedLine(2, 200, 1, SET_TYPE.FOR_TIME, 41),
            ]);
        case "dropset_two_exercises_r1":
            return viewFromBlock(block(50, SET_TYPE.DROPSET, 1), [
                dropLine(1, 0, 1, "10", 1),
                dropLine(2, 1, 2, "7", 0),
            ]);
        default:
            throw new Error(`unknown case ${caseId}`);
    }
}

describe("athlete_run_step_keys_v1", () => {
    it("copia FE idéntica a backend (contenido JSON)", () => {
        const fePath = join(here, "../../fixtures/athlete_run_step_keys_v1.json");
        const bePath = join(here, "../../../../../../backend/tests/fixtures/athlete_run_step_keys_v1.json");
        const feJson = JSON.parse(readFileSync(fePath, "utf8"));
        const beJson = JSON.parse(readFileSync(bePath, "utf8"));
        expect(feJson).toEqual(beJson);
    });

    it.each(reference.cases.map((c) => [c.id, c.expected_keys.sort()] as const))(
        "%s alinea con referencia",
        (caseId, expected) => {
            expect(collectExecutionStepKeys(buildAthleteRunSteps(viewForCase(caseId)))).toEqual(expected);
        }
    );
});
