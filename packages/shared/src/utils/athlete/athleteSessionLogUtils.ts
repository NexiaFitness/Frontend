/**
 * athleteSessionLogUtils.ts — Registro al final FE-3 (bloques, step_key, resúmenes).
 * Contexto: misma función buildAthleteRunSteps que el guiado; estado desde BE-1.
 * @author Frontend Team
 * @since v8.3.0
 */

import type {
    AthleteRunExecutionCreate,
    AthleteRunTimedResultCreate,
} from "../../types/athleteRunReference";
import type {
    AthleteRunBlockStatus,
    AthleteRunNotPerformedCreate,
    AthleteRunProgress,
    AthleteRunProgressStep,
} from "../../types/athleteRunProgress";
import type { SessionStructureView } from "../../sessionProgramming/sessionBlockView";
import { getBlockDisplayName } from "../../sessionProgramming/sessionBlockView";
import {
    buildAthleteRunSteps,
    runStepToFlatExercise,
    type AthleteRunStep,
} from "./buildAthleteRunSteps";
import {
    buildExerciseNoteUpsertPayload,
    exerciseNotesMapFromProgress,
    type AthleteExerciseNoteUpsert,
} from "./athleteExerciseNoteUtils";
import {
    buildAthleteRunExecutionPayload,
    buildAthleteRunExecutionPayloadFromSlot,
} from "./runReferenceUtils";
import {
    buildAmrapTimedResultPayload,
    buildEmomTimedResultPayload,
    buildForTimeTimedResultPayload,
} from "./timedBlockRunUtils";
import { buildAmrapSavePayloads } from "./amrapResult";
import { buildForTimeSavePayloads } from "./forTimeResult";
import { buildEmomSavePayloads, getEmomTemplateSlots, resolveEmomFailureState } from "./emomResult";
import {
    amrapPartialRepsFromDetail,
    amrapPartialTotalFromDetail,
} from "../../types/timedBlockResultDetail";

export interface AthleteSessionLogSlotValues {
    weight: number;
    reps: number;
    durationSeconds?: number;
}

export interface AthleteSessionLogBlockModel {
    sessionBlockId: number;
    blockTypeName: string;
    setType: string | null;
    status: AthleteRunBlockStatus;
    expectedStepKeys: string[];
    steps: AthleteRunStep[];
    summaryLine: string | null;
    isPendingHighlight: boolean;
    hasRegisterableSteps: boolean;
}

export interface AthleteSessionLogSetDraft {
    stepKey: string;
    weight: number;
    reps: number;
    rpe?: number | null;
    skipped: boolean;
}

export interface AthleteSessionLogRoundDraft {
    stepKey: string;
    slotLogs: Record<string, AthleteSessionLogSlotValues>;
    skipped: boolean;
    roundRpe?: number | null;
}

export interface AthleteSessionLogTimedDraft {
    stepKey: string;
    groupKind: string;
    amrapRounds: number;
    amrapPartialReps: Record<string, number>;
    emomAsPlanned: boolean | null;
    emomAthleteNote: string;
    roundRpe: number | null;
    forTimeTotalSeconds: number;
    skipped: boolean;
}

export interface AthleteSessionLogBlockDraft {
    sessionBlockId: number;
    singleSets: AthleteSessionLogSetDraft[];
    groupRounds: AthleteSessionLogRoundDraft[];
    dropsetRounds: AthleteSessionLogRoundDraft[];
    timed: AthleteSessionLogTimedDraft | null;
    mobilityDone: boolean | null;
    /** D6 — nota por block_exercise_id (compartida entre series del mismo slot). */
    exerciseNotes: Record<number, string>;
}

const END_LOG_SOURCE = "run_live" as const;

function progressStepMap(progress?: AthleteRunProgress | null): Map<string, AthleteRunProgressStep> {
    const map = new Map<string, AthleteRunProgressStep>();
    for (const step of progress?.steps ?? []) {
        map.set(step.step_key, step);
    }
    return map;
}

/** RPE en progress puede vivir en el step agregado (ronda/timed) o en ejecuciones por slot. */
function resolveProgressStepRpe(
    byKey: Map<string, AthleteRunProgressStep>,
    ...stepKeys: string[]
): number | null {
    for (const key of stepKeys) {
        if (!key) continue;
        const saved = byKey.get(key);
        if (saved?.rpe != null && Number.isFinite(saved.rpe)) return saved.rpe;
    }
    return null;
}

function formatExecutionSummary(step: AthleteRunProgressStep, name?: string): string {
    const label = name ? `${name} ` : "";
    if (step.status === "not_performed") {
        return `${label}(no realizado)`.trim();
    }
    if (step.weight_kg != null && step.weight_kg > 0 && step.reps != null) {
        return `${label}${step.weight_kg} kg × ${step.reps}`.trim();
    }
    if (step.reps != null && step.reps > 0) {
        return `${label}${step.reps} reps`.trim();
    }
    if (step.duration_seconds != null && step.duration_seconds > 0) {
        return `${label}${step.duration_seconds} s`.trim();
    }
    return label.trim() || "Registrado";
}

function formatTimedSummary(step: AthleteRunProgressStep): string {
    if (step.status === "not_performed") return "No realizado";
    if (step.timed_mode === "amrap" && step.rounds_completed != null) {
        const partialTotal = amrapPartialTotalFromDetail(step.detail);
        if (partialTotal > 0) {
            return `AMRAP ${step.rounds_completed} rondas + ${partialTotal} reps`;
        }
        return `AMRAP ${step.rounds_completed} rondas`;
    }
    if (step.timed_mode === "for_time" && step.total_seconds != null) {
        const m = Math.floor(step.total_seconds / 60);
        const s = step.total_seconds % 60;
        return `For Time ${m}:${String(s).padStart(2, "0")}`;
    }
    if (step.timed_mode === "emom") {
        if (step.detail?.kind === "emom") {
            return step.detail.as_planned ? "EMOM completado" : "EMOM no completado";
        }
        return "EMOM registrado";
    }
    return "Bloque registrado";
}

export function buildBlockSummaryLine(
    steps: AthleteRunStep[],
    progress?: AthleteRunProgress | null
): string | null {
    const byKey = progressStepMap(progress);
    const parts: string[] = [];
    for (const step of steps) {
        const saved = byKey.get(step.stepKey);
        if (!saved) continue;
        if (step.kind === "timed_block") {
            parts.push(formatTimedSummary(saved));
            break;
        }
        if (step.kind === "group_round") {
            parts.push(step.exerciseName ?? step.slotLabel ?? "Ronda");
            break;
        }
        parts.push(formatExecutionSummary(saved, step.exerciseName));
    }
    if (parts.length === 0) return null;
    return parts.slice(0, 2).join(" · ");
}

export function buildSessionLogBlocks(
    view: SessionStructureView,
    progress?: AthleteRunProgress | null
): AthleteSessionLogBlockModel[] {
    const runSteps = buildAthleteRunSteps(view);
    const blockProgress = new Map(
        (progress?.blocks ?? []).map((b) => [b.session_block_id, b])
    );

    return view.blocks.map((block) => {
        const steps = runSteps.filter((s) => s.blockId === block.blockId);
        const prog = blockProgress.get(block.blockId);
        const status: AthleteRunBlockStatus = prog?.status ?? "pending";
        const expectedStepKeys = prog?.expected_step_keys ?? steps.map((s) => s.stepKey);
        const hasRegisterableSteps = expectedStepKeys.length > 0;

        return {
            sessionBlockId: block.blockId,
            blockTypeName: getBlockDisplayName(block.blockTypeName),
            setType: block.groups[0]?.kind ?? null,
            status,
            expectedStepKeys,
            steps,
            summaryLine: buildBlockSummaryLine(steps, progress),
            isPendingHighlight: status === "pending" && hasRegisterableSteps,
            hasRegisterableSteps,
        };
    });
}

export function countPendingLogBlocks(blocks: AthleteSessionLogBlockModel[]): number {
    return blocks.filter((b) => b.hasRegisterableSteps && b.status === "pending").length;
}

export function countPendingLogSteps(progress?: AthleteRunProgress | null): number {
    return progress?.pending_count ?? 0;
}

/** Bloques registrables aún en pending (desde BE-1, sin estructura de sesión). */
export function countPendingProgressBlocks(progress?: AthleteRunProgress | null): number {
    if (!progress) return 0;
    return progress.blocks.filter(
        (b) => b.expected_step_keys.length > 0 && b.status === "pending"
    ).length;
}

/** Hay al menos un bloque/step guardado y quedan pendientes (Home «Completar registro»). */
function blockHasResolvedSteps(block: AthleteRunProgress["blocks"][number]): boolean {
    if (block.status === "registered" || block.status === "not_performed") {
        return true;
    }
    return (
        block.registered_step_keys.length > 0 || block.not_performed_step_keys.length > 0
    );
}

export function hasPartialSessionLogProgress(progress?: AthleteRunProgress | null): boolean {
    if (!progress) return false;
    const registerable = progress.blocks.filter((b) => b.expected_step_keys.length > 0);
    if (registerable.length === 0) return false;
    const anySaved = registerable.some(blockHasResolvedSteps);
    const anyPending = registerable.some((b) => b.status === "pending");
    return anySaved && anyPending;
}

/** Todos los bloques registrables resueltos pero la sesión sigue abierta. */
export function isSessionLogReadyToComplete(progress?: AthleteRunProgress | null): boolean {
    if (!progress) return false;
    const registerable = progress.blocks.filter((b) => b.expected_step_keys.length > 0);
    if (registerable.length === 0) return false;
    return registerable.every(
        (b) => b.status === "registered" || b.status === "not_performed"
    );
}

/**
 * Peso inicial / efectivo en registro al final: prioriza guardado BE-1, luego actualWeight
 * (defaultWeight), luego carga programada (plannedWeight). Sin esto el sheet muestra «50 kg»
 * en preview pero el borrador enviaba weight_kg=0 al guardar sin tocar el input.
 */
export function resolveLogDraftSetWeight(
    step: Pick<AthleteRunStep, "defaultWeight" | "plannedWeight">,
    saved?: AthleteRunProgressStep
): number {
    if (saved?.weight_kg != null) return saved.weight_kg;
    if (step.defaultWeight != null && step.defaultWeight > 0) return step.defaultWeight;
    if (step.plannedWeight != null && step.plannedWeight > 0) return step.plannedWeight;
    return 0;
}

function defaultSetDraft(step: AthleteRunStep, saved?: AthleteRunProgressStep): AthleteSessionLogSetDraft {
    return {
        stepKey: step.stepKey,
        weight: resolveLogDraftSetWeight(step, saved),
        reps: saved?.reps ?? step.defaultReps ?? 8,
        rpe: saved?.rpe ?? null,
        skipped: saved?.status === "not_performed",
    };
}

function defaultRoundDraft(
    step: AthleteRunStep,
    saved: AthleteRunProgressStep | undefined,
    progressByKey: Map<string, AthleteRunProgressStep>
): AthleteSessionLogRoundDraft {
    const slotLogs: Record<string, AthleteSessionLogSlotValues> = {};
    for (const slot of step.slots ?? []) {
        const slotSaved = progressByKey?.get(slot.stepKey);
        slotLogs[slot.stepKey] = {
            weight: slotSaved?.weight_kg ?? slot.defaultWeight,
            reps: slotSaved?.reps ?? slot.defaultReps,
            durationSeconds: slotSaved?.duration_seconds ?? slot.defaultReps,
        };
    }
    const slotKeys = (step.slots ?? []).map((slot) => slot.stepKey);
    return {
        stepKey: step.stepKey,
        slotLogs,
        skipped: saved?.status === "not_performed",
        roundRpe: resolveProgressStepRpe(progressByKey, step.stepKey, ...slotKeys),
    };
}

function defaultTimedDraft(
    step: AthleteRunStep,
    saved: AthleteRunProgressStep | undefined,
    progressByKey: Map<string, AthleteRunProgressStep>
): AthleteSessionLogTimedDraft {
    let emomAsPlanned: boolean | null = null;
    let emomAthleteNote = "";
    if (saved?.detail?.kind === "emom" && step.groupKind === "emom") {
        emomAsPlanned = saved.detail.as_planned;
        emomAthleteNote = saved.detail.athlete_note ?? "";
    }
    const slotKeys = (step.slots ?? []).map((slot) => slot.stepKey);
    const amrapPartialReps = amrapPartialRepsFromDetail(saved?.detail, slotKeys);

    return {
        stepKey: step.stepKey,
        groupKind: step.groupKind ?? "amrap",
        amrapRounds: saved?.rounds_completed ?? 0,
        amrapPartialReps,
        emomAsPlanned,
        emomAthleteNote,
        roundRpe: resolveProgressStepRpe(
            progressByKey,
            step.stepKey,
            ...(step.slots ?? []).map((slot) => slot.stepKey)
        ),
        forTimeTotalSeconds: saved?.total_seconds ?? 0,
        skipped: saved?.status === "not_performed",
    };
}

/** Borrador inicial del sheet a partir de steps del bloque + progress BE-1. */
export function buildInitialBlockDraft(
    block: AthleteSessionLogBlockModel,
    progress?: AthleteRunProgress | null
): AthleteSessionLogBlockDraft {
    const byKey = progressStepMap(progress);
    const singleSets: AthleteSessionLogSetDraft[] = [];
    const groupRounds: AthleteSessionLogRoundDraft[] = [];
    const dropsetRounds: AthleteSessionLogRoundDraft[] = [];
    let timed: AthleteSessionLogTimedDraft | null = null;

    for (const step of block.steps) {
        const saved = byKey.get(step.stepKey);
        if (step.kind === "timed_block") {
            timed = defaultTimedDraft(step, saved, byKey);
            continue;
        }
        if (step.kind === "group_round") {
            if (step.groupKind === "dropset") {
                dropsetRounds.push(defaultRoundDraft(step, saved ?? undefined, byKey));
            } else {
                groupRounds.push(defaultRoundDraft(step, saved ?? undefined, byKey));
            }
            continue;
        }
        singleSets.push(defaultSetDraft(step, saved));
    }

    const noteMap = exerciseNotesMapFromProgress(progress);
    const exerciseNotes: Record<number, string> = {};
    for (const step of block.steps) {
        if (step.groupKind === "emom") continue;
        const ids = new Set<number>();
        if (step.blockExerciseId) ids.add(step.blockExerciseId);
        for (const slot of step.slots ?? []) {
            if (slot.blockExerciseId) ids.add(slot.blockExerciseId);
        }
        for (const id of ids) {
            const saved = noteMap.get(id);
            if (saved) exerciseNotes[id] = saved;
        }
    }

    return {
        sessionBlockId: block.sessionBlockId,
        singleSets,
        groupRounds,
        dropsetRounds,
        timed,
        mobilityDone:
            !block.hasRegisterableSteps && block.status === "registered" ? true : null,
        exerciseNotes,
    };
}

export interface BlockSavePayloads {
    executions: AthleteRunExecutionCreate[];
    timed: AthleteRunTimedResultCreate | null;
    exerciseNotes: AthleteExerciseNoteUpsert[];
    notPerformedSteps: AthleteRunNotPerformedCreate[];
}

export function buildAthleteRunNotPerformedStepPayload(
    sessionId: number,
    block: AthleteSessionLogBlockModel,
    stepKey: string
): AthleteRunNotPerformedCreate {
    const step = block.steps.find((s) => s.stepKey === stepKey);
    if (!step) {
        throw new Error(`step_key ${stepKey} not in block ${block.sessionBlockId}`);
    }
    if (step.kind === "timed_block") {
        return {
            training_session_id: sessionId,
            scope: "step",
            step_key: stepKey,
            session_block_id: block.sessionBlockId,
            group_id: step.groupId,
            timed_mode: step.groupKind ?? undefined,
            block_exercise_id: step.blockExerciseId ?? undefined,
            exercise_id: step.exerciseId,
        };
    }
    const flat = runStepToFlatExercise(step);
    return {
        training_session_id: sessionId,
        scope: "step",
        step_key: stepKey,
        session_block_id: block.sessionBlockId,
        exercise_id: flat.exerciseId,
        block_exercise_id: flat.blockExerciseId,
        group_kind: flat.groupKind ?? undefined,
        round_index: flat.roundIndex ?? undefined,
        set_index: flat.setIndex,
        slot_label: flat.slotLabel ?? undefined,
        set_label: flat.setLabel,
    };
}

export function buildBlockSavePayloads(
    sessionId: number,
    block: AthleteSessionLogBlockModel,
    draft: AthleteSessionLogBlockDraft
): BlockSavePayloads {
    const executions: AthleteRunExecutionCreate[] = [];
    const notPerformedSteps: AthleteRunNotPerformedCreate[] = [];

    const markNotPerformed = (stepKey: string) => {
        notPerformedSteps.push(
            buildAthleteRunNotPerformedStepPayload(sessionId, block, stepKey)
        );
    };

    if (!block.hasRegisterableSteps) {
        return {
            executions,
            timed: null,
            exerciseNotes: [],
            notPerformedSteps,
        };
    }

    for (const setDraft of draft.singleSets) {
        const step = block.steps.find((s) => s.stepKey === setDraft.stepKey);
        if (!step) continue;
        if (setDraft.skipped) {
            markNotPerformed(setDraft.stepKey);
            continue;
        }
        const flat = runStepToFlatExercise(step);
        const weight =
            setDraft.weight > 0 ? setDraft.weight : resolveLogDraftSetWeight(step);
        executions.push(
            buildAthleteRunExecutionPayload(sessionId, flat, {
                weight,
                reps: setDraft.reps,
                rpe: setDraft.rpe ?? null,
                durationSeconds: setDraft.reps,
            })
        );
    }

    const pushRound = (round: AthleteSessionLogRoundDraft, step: AthleteRunStep) => {
        if (round.skipped) {
            markNotPerformed(round.stepKey);
            return;
        }
        for (const slot of step.slots ?? []) {
            const log = round.slotLogs[slot.stepKey];
            if (!log) continue;
            executions.push(
                buildAthleteRunExecutionPayloadFromSlot(sessionId, step, slot, {
                    weight: log.weight,
                    reps: log.reps,
                    rpe: round.roundRpe ?? null,
                    durationSeconds: log.durationSeconds ?? log.reps,
                })
            );
        }
    };

    for (const round of draft.groupRounds) {
        const step = block.steps.find((s) => s.stepKey === round.stepKey);
        if (step) pushRound(round, step);
    }
    for (const round of draft.dropsetRounds) {
        const step = block.steps.find((s) => s.stepKey === round.stepKey);
        if (step) pushRound(round, step);
    }

    let timed: AthleteRunTimedResultCreate | null = null;
    if (draft.timed) {
        const step = block.steps.find((s) => s.stepKey === draft.timed?.stepKey);
        if (draft.timed.skipped) {
            markNotPerformed(draft.timed.stepKey);
        } else if (step) {
            if (step.groupKind === "amrap") {
                const slots = step.slots ?? [];
                timed = buildAmrapTimedResultPayload({
                    sessionId,
                    runStep: step,
                    fullRounds: draft.timed.amrapRounds,
                    slots,
                    partialReps: draft.timed.amrapPartialReps,
                });

                const amrapPlans = buildAmrapSavePayloads({
                    fullRounds: draft.timed.amrapRounds,
                    slots: slots.map((slot) => ({
                        stepKey: slot.stepKey,
                        blockExerciseId: slot.blockExerciseId,
                        plannedRepsPerRound: slot.defaultReps,
                        defaultWeight: slot.defaultWeight,
                        loggedSets: slot.loggedSets,
                    })),
                    partialReps: draft.timed.amrapPartialReps,
                    roundRpe: draft.timed.roundRpe,
                    getNextActualSets: (_blockExerciseId, loggedSets) =>
                        Math.max(0, loggedSets) + 1,
                });
                for (const plan of amrapPlans) {
                    const slot = slots.find(
                        (item) => item.blockExerciseId === plan.blockExerciseId
                    );
                    if (!slot) continue;
                    executions.push(
                        buildAthleteRunExecutionPayloadFromSlot(sessionId, step, slot, {
                            weight: plan.data.actual_weight,
                            reps: Number.parseInt(plan.data.actual_reps, 10) || 0,
                            rpe: plan.data.actual_effort_value ?? draft.timed.roundRpe,
                        })
                    );
                }
            } else if (step.groupKind === "emom") {
                const asPlanned = draft.timed.emomAsPlanned === true;
                const intervals = step.emomIntervals ?? [];
                const templateSlots = getEmomTemplateSlots(intervals);
                const { failedCount } = resolveEmomFailureState({
                    intervals,
                    templateSlots,
                    asPlanned,
                });
                timed = buildEmomTimedResultPayload({
                    sessionId,
                    runStep: step,
                    intervals: step.emomIntervals ?? [],
                    asPlanned,
                    failedCount,
                    athleteNote: draft.timed.emomAthleteNote,
                });

                const emomPlans = buildEmomSavePayloads({
                    intervals,
                    asPlanned,
                    failedCount,
                    failureEntries: [],
                    templateSlots,
                    roundRpe: draft.timed.roundRpe,
                });
                for (const plan of emomPlans) {
                    const interval = intervals.find((item) => item.intervalKey === plan.intervalKey);
                    const slot =
                        interval?.slots.find(
                            (item) => item.blockExerciseId === plan.blockExerciseId
                        ) ?? null;
                    if (!slot) continue;
                    executions.push(
                        buildAthleteRunExecutionPayloadFromSlot(sessionId, step, slot, {
                            weight: plan.data.actual_weight,
                            reps: Number.parseInt(plan.data.actual_reps, 10) || 0,
                            rpe: plan.data.actual_effort_value ?? draft.timed.roundRpe,
                        })
                    );
                }
            } else if (step.groupKind === "for_time") {
                const forTimeRounds = step.forTimeRounds ?? [];
                timed = buildForTimeTimedResultPayload({
                    sessionId,
                    runStep: step,
                    totalSeconds: draft.timed.forTimeTotalSeconds,
                    cumulativeSplits: [],
                });

                if (forTimeRounds.length > 0 && draft.timed.forTimeTotalSeconds > 0) {
                    const forTimePlans = buildForTimeSavePayloads({
                        rounds: forTimeRounds,
                        cumulativeSplits: [],
                        totalSeconds: draft.timed.forTimeTotalSeconds,
                        roundRpe: draft.timed.roundRpe,
                        getNextActualSets: (_blockExerciseId, loggedSets = 0) =>
                            Math.max(0, loggedSets) + 1,
                    });
                    for (const plan of forTimePlans) {
                        const round = forTimeRounds.find(
                            (item) => item.roundKey === plan.roundKey
                        );
                        const slot =
                            round?.slots.find(
                                (item) => item.blockExerciseId === plan.blockExerciseId
                            ) ?? null;
                        if (!slot) continue;
                        const executionValues = {
                            weight: plan.data.actual_weight,
                            reps: Number.parseInt(plan.data.actual_reps, 10) || 0,
                            rpe: plan.data.actual_effort_value ?? draft.timed.roundRpe,
                            ...(plan.data.actual_duration != null
                                ? { durationSeconds: plan.data.actual_duration }
                                : {}),
                        };
                        executions.push({
                            ...buildAthleteRunExecutionPayloadFromSlot(
                                sessionId,
                                step,
                                slot,
                                executionValues
                            ),
                            input_mode: "duration",
                        });
                    }
                }
            }
        }
    }

    const exerciseNotes: AthleteExerciseNoteUpsert[] = [];
    for (const [blockExerciseIdRaw, text] of Object.entries(draft.exerciseNotes ?? {})) {
        const blockExerciseId = Number(blockExerciseIdRaw);
        if (!Number.isFinite(blockExerciseId)) continue;
        exerciseNotes.push(
            buildExerciseNoteUpsertPayload(sessionId, blockExerciseId, text ?? null)
        );
    }

    return { executions, timed, exerciseNotes, notPerformedSteps };
}

export function validateBlockDraft(
    block: AthleteSessionLogBlockModel,
    draft: AthleteSessionLogBlockDraft
): string | null {
    if (!block.hasRegisterableSteps) {
        if (draft.mobilityDone == null) {
            return "Indica si completaste este bloque.";
        }
        return null;
    }

    if (draft.timed && !draft.timed.skipped) {
        if (draft.timed.groupKind === "emom" && draft.timed.emomAsPlanned == null) {
            return "Indica si completaste el EMOM.";
        }
        if (draft.timed.groupKind === "for_time" && draft.timed.forTimeTotalSeconds <= 0) {
            return "Introduce un tiempo total válido.";
        }
        if (
            draft.timed.groupKind === "amrap" &&
            draft.timed.amrapRounds <= 0 &&
            Object.values(draft.timed.amrapPartialReps).every((v) => v <= 0)
        ) {
            return "Registra al menos una ronda o repeticiones parciales.";
        }
    }

    const hasSingle = draft.singleSets.some(
        (s) => !s.skipped && (s.weight > 0 || s.reps > 0)
    );
    const hasRound = [...draft.groupRounds, ...draft.dropsetRounds].some(
        (r) => !r.skipped && Object.values(r.slotLogs).some((l) => l.reps > 0 || l.weight > 0)
    );
    const hasTimed =
        draft.timed &&
        !draft.timed.skipped &&
        (draft.timed.groupKind !== "for_time" || draft.timed.forTimeTotalSeconds > 0);

    if (!hasSingle && !hasRound && !hasTimed) {
        const anySkipped =
            draft.singleSets.some((s) => s.skipped) ||
            draft.groupRounds.some((r) => r.skipped) ||
            draft.dropsetRounds.some((r) => r.skipped) ||
            draft.timed?.skipped;
        if (!anySkipped) {
            return "Registra al menos un dato o marca «No lo hice».";
        }
    }

    return null;
}

export { END_LOG_SOURCE };
