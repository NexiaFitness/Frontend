/**
 * athleteSessionLogSave.ts — Registro al final FE-3: payloads de guardado y validación del borrador.
 *
 * Contexto: extraído de athleteSessionLogUtils.ts (agent.md §7.1: el archivo supera
 * 600 líneas y no puede crecer). athleteSessionLogUtils.ts lo reexporta para que
 * los consumidores sigan importando desde la misma ruta.
 *
 * Notas de mantenimiento: funciones puras; validateBlockDraft se ejecuta antes que
 * buildBlockSavePayloads (useAthleteSessionLog). D-LOG-TOUCH-01: un hueco al que le
 * falta un dato según su input_mode bloquea el guardado con aviso; nunca se
 * descarta en silencio (F4).
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import type {
    AthleteRunExecutionCreate,
    AthleteRunTimedResultCreate,
} from "../../types/athleteRunReference";
import type { AthleteRunNotPerformedCreate } from "../../types/athleteRunProgress";
import { runStepToFlatExercise, type AthleteRunStep } from "./buildAthleteRunSteps";
import {
    buildExerciseNoteUpsertPayload,
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
import { isRunLoggerSlotConfirmValid } from "./runLoggerHydrationPolicy";
import { formatAthleteLogExerciseSetHeading } from "./athleteRunLabelPresentation";
import type {
    AthleteSessionLogBlockDraft,
    AthleteSessionLogBlockModel,
    AthleteSessionLogRoundDraft,
} from "./athleteSessionLogUtils";
import type { AthleteRunProgressStep } from "../../types/athleteRunProgress";

/**
 * Peso inicial / efectivo en registro al final: prioriza guardado BE-1, luego actualWeight
 * (defaultWeight), luego carga programada (plannedWeight). Sin esto el sheet muestra «50 kg»
 * en preview pero el borrador enviaba weight_kg=0 al guardar sin tocar el input.
 */
export function resolveLogDraftSetWeight(
    step: Pick<AthleteRunStep, "defaultWeight" | "plannedWeight">,
    saved?: AthleteRunProgressStep
): number | null {
    if (saved?.weight_kg != null) return saved.weight_kg;
    if (step.defaultWeight != null && step.defaultWeight > 0) return step.defaultWeight;
    if (step.plannedWeight != null && step.plannedWeight > 0) return step.plannedWeight;
    return null;
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
        // Lo guardado es lo visible (D-LOG-TOUCH-01): el borrador ya parte de la
        // prescripción o del guardado; un 0 tecleado nunca se sustituye (F3).
        executions.push(
            buildAthleteRunExecutionPayload(sessionId, flat, {
                weight: setDraft.weight,
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

type MissingField = "el peso" | "las repeticiones" | "la duración" | "los datos";

function missingFieldFor(
    log: { weight: number | null; reps: number; durationSeconds?: number } | undefined,
    inputMode: string
): MissingField | null {
    if (!log) return "los datos";
    const shape = {
        weight: log.weight,
        reps: log.reps,
        durationSeconds: log.durationSeconds ?? log.reps,
    };
    if (isRunLoggerSlotConfirmValid(shape, inputMode)) return null;
    if (inputMode === "duration") return "la duración";
    if (log.reps <= 0) return "las repeticiones";
    return "el peso";
}

function missingDataMessage(
    missing: MissingField,
    exerciseName: string,
    skipLabel: string
): string {
    const howTo = missing === "el peso" ? "Escríbelo (0 si fue sin carga)" : "Complétalo";
    return `Falta ${missing} en ${exerciseName}. ${howTo} o marca ${skipLabel}.`;
}

/** F4: first incomplete slot of a non-skipped round, as a user-facing message. */
function findIncompleteRoundSlot(
    block: AthleteSessionLogBlockModel,
    rounds: readonly AthleteSessionLogRoundDraft[]
): string | null {
    for (const round of rounds) {
        if (round.skipped) continue;
        const step = block.steps.find((s) => s.stepKey === round.stepKey);
        for (const slot of step?.slots ?? []) {
            const missing = missingFieldFor(
                round.slotLogs[slot.stepKey],
                slot.inputMode ?? "weight_reps"
            );
            if (missing) {
                return missingDataMessage(
                    missing,
                    slot.exerciseName || "un ejercicio",
                    "«No lo hice (ronda)»"
                );
            }
        }
    }
    return null;
}

/** F1: first incomplete non-skipped single set, as a user-facing message. */
function findIncompleteSingleSet(
    block: AthleteSessionLogBlockModel,
    sets: AthleteSessionLogBlockDraft["singleSets"]
): string | null {
    for (const set of sets) {
        if (set.skipped) continue;
        const step = block.steps.find((s) => s.stepKey === set.stepKey);
        if (!step) continue;
        const missing = missingFieldFor(set, step.inputMode ?? "weight_reps");
        if (missing) {
            return missingDataMessage(
                missing,
                formatAthleteLogExerciseSetHeading(step.exerciseName || "Ejercicio", step.setLabel),
                "«No lo hice»"
            );
        }
    }
    return null;
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

    const incompleteSingle = findIncompleteSingleSet(block, draft.singleSets);
    if (incompleteSingle) return incompleteSingle;

    const incompleteRound = findIncompleteRoundSlot(block, [
        ...draft.groupRounds,
        ...draft.dropsetRounds,
    ]);
    if (incompleteRound) return incompleteRound;

    const hasSingle = draft.singleSets.some(
        (s) => !s.skipped && ((s.weight != null && s.weight > 0) || s.reps > 0)
    );
    const hasRound = [...draft.groupRounds, ...draft.dropsetRounds].some(
        (r) =>
            !r.skipped &&
            Object.values(r.slotLogs).some(
                (l) => l.reps > 0 || (l.weight != null && l.weight > 0)
            )
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
