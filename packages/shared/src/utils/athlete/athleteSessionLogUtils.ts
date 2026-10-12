/**
 * athleteSessionLogUtils.ts — Registro al final FE-3 (bloques, step_key, resúmenes).
 * Contexto: misma función buildAthleteRunSteps que el guiado; estado desde BE-1.
 * Longitud (> 400, agent.md §7.1): bajó de 715 al extraer el guardado a
 * athleteSessionLogSave.ts; resúmenes, borrador inicial y F5 comparten el modelo de
 * bloque. Siguiente extracción natural: resúmenes de progreso.
 * @author Frontend Team
 * @since v8.3.0
 */

import type {
    AthleteRunBlockStatus,
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
import { resolveSeriesWeightAutofillKey } from "./athleteLoggingUtils";
import { exerciseNotesMapFromProgress } from "./athleteExerciseNoteUtils";
import { resolveLogDraftSetWeight } from "./athleteSessionLogSave";
import { resolveInitialSlotWeight } from "./runLoggerHydrationPolicy";
import {
    amrapPartialRepsFromDetail,
    amrapPartialTotalFromDetail,
} from "../../types/timedBlockResultDetail";

export interface AthleteSessionLogSlotValues {
    weight: number | null;
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
    /** null = sin peso (ni prescrito ni tecleado); 0 = 0 kg explícito (D-LOG-TOUCH-01). */
    weight: number | null;
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
    progress?: AthleteRunProgress | null,
    options?: { allowPendingHighlight?: boolean }
): AthleteSessionLogBlockModel[] {
    const allowPendingHighlight = options?.allowPendingHighlight !== false;
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
            isPendingHighlight:
                allowPendingHighlight && status === "pending" && hasRegisterableSteps,
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
            weight: slotSaved?.weight_kg ?? resolveInitialSlotWeight(slot.defaultWeight),
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

/**
 * F5 — Cambio de peso en una serie simple del borrador. El valor tecleado (> 0) se
 * copia a las series posteriores de la misma serie que siguen sin peso, sin tocar y
 * sin marcar «No lo hice»: lo que se ve en ellas es lo que se guarda (D-LOG-TOUCH-01).
 */
export function applyLogSetWeightChange(input: {
    sets: readonly AthleteSessionLogSetDraft[];
    steps: readonly AthleteRunStep[];
    stepKey: string;
    weight: number | null;
    touchedStepKeys: ReadonlySet<string>;
}): AthleteSessionLogSetDraft[] {
    const { sets, steps, stepKey, weight, touchedStepKeys } = input;
    const changed = steps.find((s) => s.stepKey === stepKey);
    const seriesKey = changed
        ? resolveSeriesWeightAutofillKey(runStepToFlatExercise(changed))
        : null;
    const propagate = changed != null && weight != null && weight > 0;
    return sets.map((set) => {
        if (set.stepKey === stepKey) return { ...set, weight };
        if (!propagate || set.weight != null || set.skipped) return set;
        if (touchedStepKeys.has(set.stepKey)) return set;
        const step = steps.find((s) => s.stepKey === set.stepKey);
        if (!step || step.setIndex <= changed.setIndex) return set;
        if (resolveSeriesWeightAutofillKey(runStepToFlatExercise(step)) !== seriesKey) {
            return set;
        }
        return { ...set, weight };
    });
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

export {
    buildAthleteRunNotPerformedStepPayload,
    buildBlockSavePayloads,
    resolveLogDraftSetWeight,
    validateBlockDraft,
    type BlockSavePayloads,
} from "./athleteSessionLogSave";

export { END_LOG_SOURCE };
