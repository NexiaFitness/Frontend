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
import { buildTimedBlockExplanation, shouldRestAfterCompletingStep } from "./athleteRunGroupContext";
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

/** Un intervalo dentro de un bloque EMOM continuo (V05). */
export interface AthleteEmomInterval {
    intervalKey: string;
    minuteIndex: number;
    minuteTotal: number;
    roundIndex: number;
    roundTotal: number;
    slots: AthleteRunRoundSlot[];
}

/** Una ronda dentro de un bloque FOR TIME continuo (V05). */
export interface AthleteForTimeRound {
    roundKey: string;
    roundIndex: number;
    roundTotal: number;
    slots: AthleteRunRoundSlot[];
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
    timedMode?: "countdown_block" | "countdown_interval" | "countup";
    minuteIndex?: number;
    minuteTotal?: number;
    /** EMOM — todos los intervalos del bloque en un solo paso UI */
    emomIntervals?: AthleteEmomInterval[];
    /** FOR TIME — todas las rondas del bloque en un solo paso UI */
    forTimeRounds?: AthleteForTimeRound[];
}

const GROUP_INSTRUCTION: Partial<Record<SessionGroupKind, string>> = {
    superset: "Alterna ejercicios sin descanso. Descansa al terminar la ronda.",
    giant_set: "Completa todos los ejercicios en orden. Descansa al terminar la ronda.",
    dropset: "Sin descanso entre drops. Descansa al terminar la secuencia.",
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

function buildTimedBlockStep(
    blockId: number,
    blockName: string,
    group: SessionExerciseGroupView,
    roundIndex: number,
    roundTotal: number | null,
    roundSlots: AthleteRunRoundSlot[],
    timedMode: "countdown_block" | "countdown_interval" | "countup",
    minuteIndex?: number,
    minuteTotal?: number
): AthleteRunStep {
    const first = roundSlots[0];
    const firstSet = group.slots[0]?.sets[roundIndex - 1] ?? group.slots[0]?.sets[0];
    return {
        stepKey: `${group.groupId}-timed-${roundIndex}${minuteIndex ? `-m${minuteIndex}` : ""}`,
        kind: "timed_block",
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
        instruction: buildTimedBlockExplanation({
            groupKind: group.kind,
            timeCapMinutes: group.timeCapMinutes,
            intervalSeconds: group.intervalSeconds,
            slotCount: roundSlots.length,
        }),
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
        timedMode,
        minuteIndex,
        minuteTotal,
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
    const roundSlots: AthleteRunRoundSlot[] = [];
    for (const slot of group.slots) {
        const set = slot.sets[0];
        if (!set) continue;
        roundSlots.push(
            buildRoundSlot({
                blockId,
                blockName,
                group,
                slot,
                set,
                roundIndex: 1,
                roundTotal: 1,
                kind: "timed_block",
                restAfterSeconds: null,
            })
        );
    }
    if (roundSlots.length === 0) return [];
    return [
        buildTimedBlockStep(
            blockId,
            blockName,
            group,
            1,
            group.rounds,
            roundSlots,
            "countdown_block"
        ),
    ];
}

function expandForTimeGroup(
    blockId: number,
    blockName: string,
    group: SessionExerciseGroupView
): AthleteRunStep[] {
    const rounds = effectiveRounds(group);
    const forTimeRounds: AthleteForTimeRound[] = [];

    for (let r = 1; r <= rounds; r += 1) {
        const roundSlots: AthleteRunRoundSlot[] = [];
        for (const slot of group.slots) {
            const set = slot.sets[r - 1];
            if (!set) continue;
            roundSlots.push(
                buildRoundSlot({
                    blockId,
                    blockName,
                    group,
                    slot,
                    set,
                    roundIndex: r,
                    roundTotal: rounds,
                    kind: "timed_block",
                    restAfterSeconds: null,
                })
            );
        }
        if (roundSlots.length === 0) continue;
        forTimeRounds.push({
            roundKey: `${group.groupId}-for-time-r${r}`,
            roundIndex: r,
            roundTotal: rounds,
            slots: roundSlots,
        });
    }

    if (forTimeRounds.length === 0) return [];

    const firstRound = forTimeRounds[0];
    return [
        {
            ...buildTimedBlockStep(
                blockId,
                blockName,
                group,
                1,
                rounds,
                firstRound.slots,
                "countup"
            ),
            stepKey: `${group.groupId}-timed-for-time-block`,
            slots: firstRound.slots,
            forTimeRounds,
        },
    ];
}

function expandEmomGroup(
    blockId: number,
    blockName: string,
    group: SessionExerciseGroupView
): AthleteRunStep[] {
    const rounds = Math.max(1, group.rounds ?? 1);
    const windows = [...new Set(group.slots.map((slot) => slot.slotLabel))];
    const minuteTotal = windows.length * rounds;
    const emomIntervals: AthleteEmomInterval[] = [];

    let minuteIndex = 1;
    for (let r = 1; r <= rounds; r += 1) {
        for (const windowLabel of windows) {
            const intervalSlots: AthleteRunRoundSlot[] = [];
            for (const slot of group.slots) {
                if (slot.slotLabel !== windowLabel) continue;
                const set = slot.sets[0];
                if (!set) continue;
                intervalSlots.push(
                    buildRoundSlot({
                        blockId,
                        blockName,
                        group,
                        slot,
                        set,
                        roundIndex: r,
                        roundTotal: rounds,
                        kind: "timed_block",
                        restAfterSeconds: null,
                    })
                );
            }
            if (intervalSlots.length === 0) continue;
            emomIntervals.push({
                intervalKey: `${group.groupId}-emom-m${minuteIndex}`,
                minuteIndex,
                minuteTotal,
                roundIndex: r,
                roundTotal: rounds,
                slots: intervalSlots,
            });
            minuteIndex += 1;
        }
    }

    if (emomIntervals.length === 0) return [];

    const firstInterval = emomIntervals[0];
    return [
        {
            ...buildTimedBlockStep(
                blockId,
                blockName,
                group,
                1,
                rounds,
                firstInterval.slots,
                "countdown_interval",
                1,
                minuteTotal
            ),
            stepKey: `${group.groupId}-timed-emom-block`,
            slots: firstInterval.slots,
            emomIntervals,
        },
    ];
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
            return expandForTimeGroup(blockId, blockName, group);
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
        if ((step.kind === "group_round" || step.kind === "timed_block") && step.slots?.length) {
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

    if (current.kind === "group_round" || current.kind === "timed_block") {
        const rest = current.restAfterSeconds;
        return rest != null && rest > 0 ? rest : null;
    }

    const flatCurrent = runStepToFlatExercise(current);
    const flatNext = runStepToFlatExercise(next);
    if (!shouldRestAfterCompletingStep(flatCurrent, flatNext)) return null;

    const seconds = flatCurrent.restSeconds;
    return seconds != null && seconds > 0 ? seconds : null;
}
