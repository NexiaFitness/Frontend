/**
 * athleteRunProgressSteps.ts — Alineación run steps (buildAthleteRunSteps) con BE-1 progress.
 */

import type { AthleteRunProgress, AthleteRunRecordStatus } from "../../types/athleteRunProgress";
import type { AthleteRunStep } from "./buildAthleteRunSteps";

const RESOLVED: AthleteRunRecordStatus[] = ["registered", "not_performed"];

export function buildProgressStatusMap(
    progress: AthleteRunProgress | null | undefined
): Map<string, AthleteRunRecordStatus | "pending"> {
    const map = new Map<string, AthleteRunRecordStatus | "pending">();
    if (!progress) return map;

    for (const row of progress.steps) {
        map.set(row.step_key, row.status);
    }
    for (const block of progress.blocks) {
        for (const key of block.pending_step_keys) {
            if (!map.has(key)) map.set(key, "pending");
        }
        for (const key of block.expected_step_keys) {
            if (!map.has(key)) map.set(key, "pending");
        }
    }
    return map;
}

/** Claves BE-1 que un paso UI del guiado puede persistir. */
export function collectProgressKeysForRunStep(step: AthleteRunStep): string[] {
    const keys: string[] = [step.stepKey];

    if (step.kind === "timed_block") {
        if (step.slots?.length) {
            for (const slot of step.slots) keys.push(slot.stepKey);
        }
        if (step.emomIntervals?.length) {
            for (const interval of step.emomIntervals) {
                for (const slot of interval.slots) keys.push(slot.stepKey);
            }
        }
        if (step.forTimeRounds?.length) {
            for (const round of step.forTimeRounds) {
                for (const slot of round.slots) keys.push(slot.stepKey);
            }
        }
        return [...new Set(keys)];
    }

    if (step.slots?.length) {
        for (const slot of step.slots) keys.push(slot.stepKey);
    }
    return [...new Set(keys)];
}

export function isProgressKeyResolved(
    stepKey: string,
    statusMap: Map<string, AthleteRunRecordStatus | "pending">
): boolean {
    const status = statusMap.get(stepKey);
    if (status == null || status === "pending") return false;
    return RESOLVED.includes(status);
}

export function isRunStepResolved(
    step: AthleteRunStep,
    progress: AthleteRunProgress | null | undefined
): boolean {
    if (!progress) return false;
    const statusMap = buildProgressStatusMap(progress);
    const keys = collectProgressKeysForRunStep(step);
    const executionKeys = keys.filter((k) => k !== step.stepKey || step.kind !== "timed_block");
    const keysToCheck =
        step.kind === "timed_block"
            ? keys
            : executionKeys.length > 0
              ? executionKeys
              : keys;
    return keysToCheck.every((k) => isProgressKeyResolved(k, statusMap));
}

/**
 * Primer índice de paso UI sin resolver. Si todos resueltos → runSteps.length.
 */
export function findFirstPendingStepIndex(
    runSteps: readonly AthleteRunStep[],
    progress: AthleteRunProgress | null | undefined
): number {
    if (!progress || runSteps.length === 0) return 0;
    for (let i = 0; i < runSteps.length; i += 1) {
        if (!isRunStepResolved(runSteps[i], progress)) return i;
    }
    return runSteps.length;
}

export function allRunStepsResolved(
    runSteps: readonly AthleteRunStep[],
    progress: AthleteRunProgress | null | undefined
): boolean {
    return findFirstPendingStepIndex(runSteps, progress) >= runSteps.length;
}

export function collectResolvedStepKeysFromProgress(
    progress: AthleteRunProgress | null | undefined
): Set<string> {
    const out = new Set<string>();
    if (!progress) return out;
    for (const row of progress.steps) {
        if (RESOLVED.includes(row.status)) out.add(row.step_key);
    }
    return out;
}

export function isRunStepTouchedForProgress(
    step: AthleteRunStep,
    touchedKeys: ReadonlySet<string>
): boolean {
    if (touchedKeys.has(step.stepKey)) return true;
    return collectProgressKeysForRunStep(step).some((key) => touchedKeys.has(key));
}

/** Marca paso guiado (y claves de progress) como editado — evita skip M9 solo-peso. */
export function touchRunStepKeysForPersist(
    touchedKeys: Set<string>,
    step: AthleteRunStep | undefined
): void {
    if (!step) return;
    touchedKeys.add(step.stepKey);
    for (const key of collectProgressKeysForRunStep(step)) {
        touchedKeys.add(key);
    }
}

export function shouldSkipRunStepPersist(
    step: AthleteRunStep,
    progress: AthleteRunProgress | null | undefined,
    touchedKeys: ReadonlySet<string>
): boolean {
    if (!progress) return false;
    if (!isRunStepResolved(step, progress)) return false;
    return !isRunStepTouchedForProgress(step, touchedKeys);
}
