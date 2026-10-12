/**
 * TR-2 — Aplica `execution-summary` por serie sobre la vista de prescripción.
 * Usa `step_key` (misma regla que `buildAthleteRunSteps`) para no colisionar ejercicios repetidos en bloques distintos.
 */

import type { ClientSetExecutionRow } from "../types/trainerSetExecutions";
import type { SessionExecutionSummary } from "../types/trainerSetExecutions";
import { buildAthleteRunSteps } from "../utils/athlete/buildAthleteRunSteps";
import type {
    SessionBlockView,
    SessionExerciseGroupView,
    SessionExerciseSetView,
    SessionExerciseSlotView,
    SessionStructureView,
} from "./sessionBlockView";

function buildExecutionByStepKey(
    summary: SessionExecutionSummary
): Map<string, ClientSetExecutionRow> {
    const index = new Map<string, ClientSetExecutionRow>();
    for (const exercise of summary.exercises) {
        for (const row of exercise.executions) {
            if (row.record_status !== "registered") continue;
            index.set(row.step_key, row);
        }
    }
    return index;
}

function applyExecutionRow(
    set: SessionExerciseSetView,
    row: ClientSetExecutionRow
): SessionExerciseSetView {
    return {
        ...set,
        actualWeight: row.weight_kg ?? null,
        actualReps: row.reps != null ? String(row.reps) : set.actualReps,
        actualEffortValue: row.rpe ?? set.actualEffortValue,
    };
}

type SetPatchKey = string;

function setPatchKey(
    blockId: number,
    groupId: string,
    slotLabel: string,
    setIndex: number
): SetPatchKey {
    return `${blockId}|${groupId}|${slotLabel}|${setIndex}`;
}

function applyPatchesToView(
    view: SessionStructureView,
    patches: Map<SetPatchKey, ClientSetExecutionRow>
): SessionStructureView {
    if (patches.size === 0) return view;

    let anyChange = false;
    const blocks = view.blocks.map((block) => {
        const groups = block.groups.map((group) => {
            const slots = group.slots.map((slot) => {
                const sets = slot.sets.map((set) => {
                    const row = patches.get(
                        setPatchKey(block.blockId, group.groupId, slot.slotLabel, set.index)
                    );
                    if (!row) return set;
                    anyChange = true;
                    return applyExecutionRow(set, row);
                });
                const setsChanged = sets.some((s, i) => s !== slot.sets[i]);
                return setsChanged ? { ...slot, sets } : slot;
            });
            const slotsChanged = slots.some((s, i) => s !== group.slots[i]);
            return slotsChanged ? { ...group, slots } : group;
        });
        const groupsChanged = groups.some((g, i) => g !== block.groups[i]);
        return groupsChanged ? { ...block, groups } : block;
    });

    return anyChange ? { ...view, blocks } : view;
}

export function mergeSessionStructureWithExecutionSummary(
    view: SessionStructureView,
    summary: SessionExecutionSummary | null | undefined
): SessionStructureView {
    if (!summary?.has_executions || summary.exercises.length === 0) {
        return view;
    }

    const execByStepKey = buildExecutionByStepKey(summary);
    const patches = new Map<SetPatchKey, ClientSetExecutionRow>();

    for (const step of buildAthleteRunSteps(view)) {
        if (step.kind !== "single_set") continue;
        const row = execByStepKey.get(step.stepKey);
        if (!row) continue;
        patches.set(
            setPatchKey(step.blockId, step.groupId, step.slotLabel, step.setIndex),
            row
        );
    }

    return applyPatchesToView(view, patches);
}
