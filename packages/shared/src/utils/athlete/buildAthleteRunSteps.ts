/**
 * buildAthleteRunSteps.ts — Orden de ejecución atleta por tipo de serie (V05 Fase A).
 *
 * Expande SessionStructureView en pasos en el orden del gimnasio:
 * superset/giant/for_time → A1·R1 → A2·R1 → descanso → A1·R2…
 * dropset → MAIN → DROP 1 → … → descanso → siguiente ronda.
 */

import type {
    SessionExerciseGroupView,
    SessionExerciseSetView,
    SessionExerciseSlotView,
    SessionGroupKind,
    SessionStructureView,
} from "../../sessionProgramming/sessionBlockView";
import type { AthleteFlatExercise } from "../../offline/athleteSessionTypes";
import { shouldRestAfterCompletingStep } from "./athleteRunGroupContext";
import { parseAthleteReps } from "./athleteSessionUtils";

export type AthleteRunStepKind =
    | "single_set"
    | "group_round"
    | "parallel_slot"
    | "dropset_step"
    | "sequential_slot"
    | "timed_block";

export type AthleteRunInputMode = "weight_reps" | "reps_only" | "duration" | "rounds_only";

export interface AthleteRunRoundSlot {
    stepKey: string;
    slotLabel: string;
    exerciseId: number;
    exerciseName: string;
    setLabel: string;
    plannedLabel: string;
    blockExerciseId: number;
    inputMode: AthleteRunInputMode;
    defaultWeight: number;
    defaultReps: number;
    defaultRpe: number | null;
    loggedSets: number;
}

export interface AthleteRunStep {
    stepKey: string;
    kind: AthleteRunStepKind;
    groupKind: SessionGroupKind;
    blockId: number;
    blockName: string;
    groupId: string;
    badgeLabel: string;
    roundIndex: number;
    roundTotal: number | null;
    slotLabel: string;
    exerciseId: number;
    exerciseName: string;
    setLabel: string;
    setIndex: number;
    instruction: string;
    plannedLabel: string;
    restAfterSeconds: number | null;
    inputMode: AthleteRunInputMode;
    blockExerciseId: number;
    plannedWeight: number | null;
    defaultWeight: number;
    defaultReps: number;
    defaultRpe: number | null;
    loggedSets: number;
    totalSetsInSlot: number;
    timeCapMinutes: number | null;
    intervalSeconds: number | null;
    /** B.2 — todos los slots de la ronda (superset / giant / dropset) */
    slots?: AthleteRunRoundSlot[];
}

const GROUP_INSTRUCTION: Partial<Record<SessionGroupKind, string>> = {
    superset: "Alterna ejercicios sin descanso. Descansa al terminar la ronda.",
    giant_set: "Completa todos los ejercicios en orden. Descansa al terminar la ronda.",
    dropset: "Sin descanso entre drops. Descansa al terminar la secuencia.",
    amrap: "Máximo de rondas posibles en el tiempo indicado.",
    emom: "Completa el patrón cada minuto.",
    for_time: "Completa la secuencia en el menor tiempo posible.",
    single_set: "",
};

function buildPlannedLabel(set: SessionExerciseSetView): string {
    const parts: string[] = [];
    if (set.label) parts.push(set.label);
    if (set.plannedReps) parts.push(`${set.plannedReps} reps`);
    if (set.effortValue != null) {
        if (set.effortCharacter === "rpe") parts.push(`RPE ${set.effortValue}`);
        else if (set.effortCharacter === "rir") parts.push(`RIR ${set.effortValue}`);
        else if (set.effortCharacter === "pct_rm") parts.push(`${set.effortValue}% RM`);
    }
    if (set.plannedDuration != null) parts.push(`${set.plannedDuration}s`);
    return parts.join(" · ") || "Según prescripción";
}

function resolveInputMode(set: SessionExerciseSetView): AthleteRunInputMode {
    if (set.plannedDuration != null) return "duration";
    if (set.plannedWeight == null && set.plannedReps != null) return "reps_only";
    return "weight_reps";
}

function effectiveRounds(group: SessionExerciseGroupView): number {
    if (group.rounds != null && group.rounds > 0) return group.rounds;
    const maxSets = group.slots.reduce((max, slot) => Math.max(max, slot.sets.length), 0);
    return Math.max(1, maxSets);
}

function makeStepKey(
    groupId: string,
    roundIndex: number,
    slot: SessionExerciseSlotView,
    set: SessionExerciseSetView
): string {
    return `${groupId}-r${roundIndex}-${slot.slotLabel}-${set.label}-${set.index}`;
}

interface StepBuildContext {
    blockId: number;
    blockName: string;
    group: SessionExerciseGroupView;
    slot: SessionExerciseSlotView;
    set: SessionExerciseSetView;
    roundIndex: number;
    roundTotal: number;
    kind: AthleteRunStepKind;
    restAfterSeconds: number | null;
}

function buildStep(ctx: StepBuildContext): AthleteRunStep {
    const { group, slot, set, roundIndex, roundTotal } = ctx;
    return {
        stepKey: makeStepKey(group.groupId, roundIndex, slot, set),
        kind: ctx.kind,
        groupKind: group.kind,
        blockId: ctx.blockId,
        blockName: ctx.blockName,
        groupId: group.groupId,
        badgeLabel: group.badgeLabel,
        roundIndex,
        roundTotal,
        slotLabel: slot.slotLabel,
        exerciseId: slot.exerciseId,
        exerciseName: slot.exerciseName,
        setLabel: set.label,
        setIndex: set.index,
        instruction: GROUP_INSTRUCTION[group.kind] ?? "",
        plannedLabel: buildPlannedLabel(set),
        restAfterSeconds: ctx.restAfterSeconds,
        inputMode: resolveInputMode(set),
        blockExerciseId: set.sourceLineId,
        plannedWeight: set.plannedWeight ?? null,
        defaultWeight: set.actualWeight ?? 0,
        defaultReps: parseAthleteReps(set.plannedReps ?? set.actualReps),
        defaultRpe: set.actualEffortValue ?? set.effortValue ?? null,
        loggedSets: set.rowLoggedSets ?? 0,
        totalSetsInSlot: slot.sets.length,
        timeCapMinutes: group.timeCapMinutes,
        intervalSeconds: group.intervalSeconds,
    };
}

function buildRoundSlot(ctx: StepBuildContext): AthleteRunRoundSlot {
    const { slot, set, group } = ctx;
    const slotLabel = group.kind === "dropset" ? set.label : slot.slotLabel;

    return {
        stepKey: makeStepKey(ctx.group.groupId, ctx.roundIndex, slot, set),
        slotLabel,
        exerciseId: slot.exerciseId,
        exerciseName: slot.exerciseName,
        setLabel: set.label,
        plannedLabel: buildPlannedLabel(set),
        blockExerciseId: set.sourceLineId,
        inputMode: resolveInputMode(set),
        defaultWeight: set.actualWeight ?? 0,
        defaultReps: parseAthleteReps(set.plannedReps ?? set.actualReps),
        defaultRpe: set.actualEffortValue ?? set.effortValue ?? null,
        loggedSets: set.rowLoggedSets ?? 0,
    };
}

function buildGroupRoundStep(
    blockId: number,
    blockName: string,
    group: SessionExerciseGroupView,
    roundIndex: number,
    roundTotal: number,
    roundSlots: AthleteRunRoundSlot[]
): AthleteRunStep {
    const first = roundSlots[0];
    const firstSet = group.slots[0]?.sets[roundIndex - 1] ?? group.slots[0]?.sets[0];
    return {
        stepKey: `${group.groupId}-round-${roundIndex}`,
        kind: "group_round",
        groupKind: group.kind,
        blockId,
        blockName,
        groupId: group.groupId,
        badgeLabel: group.badgeLabel,
        roundIndex,
        roundTotal,
        slotLabel: first?.slotLabel ?? "",
        exerciseId: first?.exerciseId ?? 0,
        exerciseName: first?.exerciseName ?? "",
        setLabel: first?.setLabel ?? "",
        setIndex: firstSet?.index ?? roundIndex,
        instruction: GROUP_INSTRUCTION[group.kind] ?? "",
        plannedLabel: first?.plannedLabel ?? "",
        restAfterSeconds: group.restBetweenSeconds,
        inputMode: first?.inputMode ?? "weight_reps",
        blockExerciseId: first?.blockExerciseId ?? 0,
        plannedWeight: firstSet?.plannedWeight ?? null,
        defaultWeight: first?.defaultWeight ?? 0,
        defaultReps: first?.defaultReps ?? 0,
        defaultRpe: first?.defaultRpe ?? null,
        loggedSets: first?.loggedSets ?? 0,
        totalSetsInSlot: roundSlots.length,
        timeCapMinutes: group.timeCapMinutes,
        intervalSeconds: group.intervalSeconds,
        slots: roundSlots,
    };
}

/** Una pantalla UI por ronda (superset, giant_set). */
function expandGroupRoundRobin(
    blockId: number,
    blockName: string,
    group: SessionExerciseGroupView
): AthleteRunStep[] {
    const rounds = effectiveRounds(group);
    const steps: AthleteRunStep[] = [];

    for (let r = 0; r < rounds; r += 1) {
        const roundSlots: AthleteRunRoundSlot[] = [];

        for (const slot of group.slots) {
            const set = slot.sets[r];
            if (!set) continue;
            roundSlots.push(
                buildRoundSlot({
                    blockId,
                    blockName,
                    group,
                    slot,
                    set,
                    roundIndex: r + 1,
                    roundTotal: rounds,
                    kind: "group_round",
                    restAfterSeconds: null,
                })
            );
        }

        if (roundSlots.length > 0) {
            steps.push(buildGroupRoundStep(blockId, blockName, group, r + 1, rounds, roundSlots));
        }
    }

    return steps;
}

/** Una pantalla UI por secuencia dropset (MAIN → DROP…). */
function expandDropsetGroupRounds(
    blockId: number,
    blockName: string,
    group: SessionExerciseGroupView
): AthleteRunStep[] {
    const slot = group.slots[0];
    if (!slot) return [];

    const rounds = effectiveRounds(group);
    const steps: AthleteRunStep[] = [];

    for (let r = 0; r < rounds; r += 1) {
        const roundSlots: AthleteRunRoundSlot[] = [];

        for (const set of slot.sets) {
            roundSlots.push(
                buildRoundSlot({
                    blockId,
                    blockName,
                    group,
                    slot,
                    set,
                    roundIndex: r + 1,
                    roundTotal: rounds,
                    kind: "group_round",
                    restAfterSeconds: null,
                })
            );
        }

        if (roundSlots.length > 0) {
            steps.push(buildGroupRoundStep(blockId, blockName, group, r + 1, rounds, roundSlots));
        }
    }

    return steps;
}

/** Rondas × slots en orden — AMRAP / EMOM / for_time (Fase C, paso por slot). */
function expandRoundRobinSlots(
    blockId: number,
    blockName: string,
    group: SessionExerciseGroupView,
    kind: AthleteRunStepKind
): AthleteRunStep[] {
    const rounds = effectiveRounds(group);
    const steps: AthleteRunStep[] = [];

    for (let r = 0; r < rounds; r += 1) {
        for (let slotIdx = 0; slotIdx < group.slots.length; slotIdx += 1) {
            const slot = group.slots[slotIdx];
            const set = slot.sets[r];
            if (!set) continue;

            const isLastInRound = slotIdx === group.slots.length - 1;
            steps.push(
                buildStep({
                    blockId,
                    blockName,
                    group,
                    slot,
                    set,
                    roundIndex: r + 1,
                    roundTotal: rounds,
                    kind,
                    restAfterSeconds: isLastInRound ? group.restBetweenSeconds : null,
                })
            );
        }
    }

    return steps;
}

function expandSingleSetGroup(
    blockId: number,
    blockName: string,
    group: SessionExerciseGroupView
): AthleteRunStep[] {
    const steps: AthleteRunStep[] = [];
    const roundTotal = group.slots.reduce((sum, slot) => sum + slot.sets.length, 0);

    for (const slot of group.slots) {
        for (const set of slot.sets) {
            steps.push(
                buildStep({
                    blockId,
                    blockName,
                    group,
                    slot,
                    set,
                    roundIndex: set.index,
                    roundTotal,
                    kind: "single_set",
                    restAfterSeconds: set.plannedRest ?? null,
                })
            );
        }
    }

    return steps;
}

function expandAmrapGroup(
    blockId: number,
    blockName: string,
    group: SessionExerciseGroupView
): AthleteRunStep[] {
    if (group.slots.every((s) => s.sets.length <= 1) && group.rounds == null) {
        return expandRoundRobinSlots(blockId, blockName, { ...group, rounds: 1 }, "timed_block");
    }
    return expandRoundRobinSlots(blockId, blockName, group, "sequential_slot");
}

function expandEmomGroup(
    blockId: number,
    blockName: string,
    group: SessionExerciseGroupView
): AthleteRunStep[] {
    return expandRoundRobinSlots(blockId, blockName, group, "sequential_slot");
}

function expandGroup(
    blockId: number,
    blockName: string,
    group: SessionExerciseGroupView
): AthleteRunStep[] {
    switch (group.kind) {
        case "superset":
        case "giant_set":
            return expandGroupRoundRobin(blockId, blockName, group);
        case "dropset":
            return expandDropsetGroupRounds(blockId, blockName, group);
        case "for_time":
            return expandRoundRobinSlots(blockId, blockName, group, "sequential_slot");
        case "amrap":
            return expandAmrapGroup(blockId, blockName, group);
        case "emom":
            return expandEmomGroup(blockId, blockName, group);
        case "single_set":
        default:
            return expandSingleSetGroup(blockId, blockName, group);
    }
}

/** Orden de ejecución atleta a partir de la vista agrupada de sesión. */
export function buildAthleteRunSteps(view: SessionStructureView): AthleteRunStep[] {
    const steps: AthleteRunStep[] = [];

    for (const block of view.blocks) {
        for (const group of block.groups) {
            steps.push(...expandGroup(block.blockId, block.blockTypeName, group));
        }
    }

    return steps;
}

/** Expande pasos UI a filas planas para offline / compat F1. */
export function flattenRunStepsToFlatExercises(steps: AthleteRunStep[]): AthleteFlatExercise[] {
    const flat: AthleteFlatExercise[] = [];

    for (const step of steps) {
        if (step.kind === "group_round" && step.slots?.length) {
            for (const slot of step.slots) {
                flat.push({
                    stepKey: slot.stepKey,
                    blockExerciseId: slot.blockExerciseId,
                    exerciseId: slot.exerciseId,
                    name: slot.exerciseName,
                    blockName: step.blockName,
                    groupKind: step.groupKind,
                    setLabel: slot.setLabel,
                    setIndex: step.roundIndex,
                    totalSetsInSlot: step.roundTotal ?? 1,
                    plannedLabel: slot.plannedLabel,
                    plannedWeight: null,
                    defaultWeight: slot.defaultWeight,
                    defaultReps: slot.defaultReps,
                    restSeconds: step.restAfterSeconds,
                    defaultRpe: slot.defaultRpe,
                    videoUrl: null,
                    loggedSets: slot.loggedSets,
                    badgeLabel: step.badgeLabel,
                    groupId: step.groupId,
                    roundIndex: step.roundIndex,
                    roundTotal: step.roundTotal,
                    slotLabel: slot.slotLabel,
                    instruction: step.instruction || undefined,
                });
            }
            continue;
        }
        flat.push(runStepToFlatExercise(step));
    }

    return flat;
}

/** Adapta un paso de run al contrato offline/logger existente (F1). */
export function runStepToFlatExercise(step: AthleteRunStep): AthleteFlatExercise {
    return {
        stepKey: step.stepKey,
        blockExerciseId: step.blockExerciseId,
        exerciseId: step.exerciseId,
        name: step.exerciseName,
        blockName: step.blockName,
        groupKind: step.groupKind,
        setLabel: step.setLabel,
        setIndex: step.setIndex,
        totalSetsInSlot: step.totalSetsInSlot,
        plannedLabel: step.plannedLabel,
        plannedWeight: step.plannedWeight,
        defaultWeight: step.defaultWeight,
        defaultReps: step.defaultReps,
        restSeconds: step.restAfterSeconds,
        defaultRpe: step.defaultRpe,
        videoUrl: null,
        loggedSets: step.loggedSets,
        badgeLabel: step.badgeLabel,
        groupId: step.groupId,
        roundIndex: step.roundIndex,
        roundTotal: step.roundTotal,
        slotLabel: step.slotLabel,
        instruction: step.instruction || undefined,
    };
}

/**
 * Descanso tras confirmar el paso actual — regla canónica §5a.
 * Sin paso siguiente → null (fin de sesión; no overlay aunque el bloque prescriba rest).
 */
export function resolveRestAfterCompletingRunStep(
    current: AthleteRunStep,
    next: AthleteRunStep | undefined
): number | null {
    if (!next) return null;

    if (current.kind === "group_round") {
        const rest = current.restAfterSeconds;
        return rest != null && rest > 0 ? rest : null;
    }

    const flatCurrent = runStepToFlatExercise(current);
    const flatNext = runStepToFlatExercise(next);
    if (!shouldRestAfterCompletingStep(flatCurrent, flatNext)) return null;

    const seconds = flatCurrent.restSeconds;
    return seconds != null && seconds > 0 ? seconds : null;
}
