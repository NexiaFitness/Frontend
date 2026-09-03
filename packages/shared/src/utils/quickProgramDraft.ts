/**
 * quickProgramDraft.ts — Operaciones puras sobre QuickProgramDraft (O6-MF).
 */

import type { TrainingDayValue } from "../types/client";
import type {
    PeriodBlockQualityInput,
    QuickProgramMaterializeCreate,
} from "../types/planningCargas";
import type {
    BlockAuthorStep,
    MaterializationClientRequestId,
    PhaseDraft,
    PhaseLocalId,
    QuickProgramDraft,
} from "../types/quickProgramDraft";
import type { WeeklyStructureWeekCreate } from "../types/weeklyStructure";
import { parseHabitualTrainingDaySet } from "./clientTrainingDays";
import {
    dayAfterLocal,
    deriveBlockEndFromWeekCount,
    recalculatePhaseDates,
    sumPhaseWeekCounts,
} from "./quickProgramDates";

const TRAINING_DAY_TO_ISO: Record<TrainingDayValue, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
};

const DEFAULT_WEEK_COUNT = 4;
const DEFAULT_LOAD = 5;

export function createLocalId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `local-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Genera client_request_id para un intento de materialize (una vez al abrir QP). */
export function createMaterializationClientRequestId(): MaterializationClientRequestId {
    return createLocalId();
}

export function cloneQualities(
    qualities: readonly PeriodBlockQualityInput[],
): PeriodBlockQualityInput[] {
    return qualities.map((q) => ({
        physical_quality_id: q.physical_quality_id,
        percentage: q.percentage,
    }));
}

export function cloneWeeklyStructure(
    structure: readonly WeeklyStructureWeekCreate[],
): WeeklyStructureWeekCreate[] {
    return structure.map((week) => ({
        week_ordinal: week.week_ordinal,
        label: week.label ?? null,
        days: week.days.map((day) => ({
            day_of_week: day.day_of_week,
            patterns: day.patterns.map((pattern) => ({
                movement_pattern_id: pattern.movement_pattern_id,
                sub_pattern: pattern.sub_pattern ?? null,
            })),
        })),
    }));
}

/** Copia profunda de fase editable — sin compartir referencias mutables. */
export function clonePhaseDraft(phase: PhaseDraft): PhaseDraft {
    return {
        ...phase,
        qualities: cloneQualities(phase.qualities),
        weeklyStructure: cloneWeeklyStructure(phase.weeklyStructure),
        weekExceptions: phase.weekExceptions
            ? cloneWeeklyStructure(phase.weekExceptions)
            : undefined,
    };
}

function trainingDaysToIsoWeek1(
    trainingDays?: readonly string[] | null,
): WeeklyStructureWeekCreate[] {
    const set = parseHabitualTrainingDaySet(trainingDays);
    const isoDays = [...set]
        .map((day) => TRAINING_DAY_TO_ISO[day])
        .sort((a, b) => a - b);

    if (isoDays.length === 0) {
        return [];
    }

    return [
        {
            week_ordinal: 1,
            label: null,
            days: isoDays.map((dayOfWeek) => ({
                day_of_week: dayOfWeek,
                patterns: [],
            })),
        },
    ];
}

function getWeek1Structure(
    structure: readonly WeeklyStructureWeekCreate[],
): WeeklyStructureWeekCreate[] {
    const week1 = structure.find((week) => week.week_ordinal === 1);
    if (!week1) return [];
    return cloneWeeklyStructure([week1]);
}

export interface CreateQuickProgramDraftOptions {
    programStartDate: string;
    trainingDays?: readonly string[] | null;
    defaultWeekCount?: number;
    now?: number;
    /** Restaurar intento idempotente (p. ej. sessionStorage); no generar en cada render. */
    clientRequestId?: MaterializationClientRequestId;
    programLocalId?: string;
}

export function createEmptyPhaseDraft(
    sortOrder: number,
    startDate: string,
    weekCount: number,
    trainingDays?: readonly string[] | null,
): PhaseDraft {
    return {
        localId: createLocalId(),
        sortOrder,
        weekCount,
        startDate,
        endDate: deriveBlockEndFromWeekCount(startDate, weekCount),
        qualities: [],
        volumeLevel: DEFAULT_LOAD,
        intensityLevel: DEFAULT_LOAD,
        weeklyStructure: trainingDaysToIsoWeek1(trainingDays),
        maxReachedStep: "qualities" as BlockAuthorStep,
    };
}

/** Crea draft con una fase inicial. Fija clientRequestId una sola vez. */
export function createQuickProgramDraft(
    planId: number,
    options: CreateQuickProgramDraftOptions,
): QuickProgramDraft {
    const weekCount = options.defaultWeekCount ?? DEFAULT_WEEK_COUNT;
    const phase = createEmptyPhaseDraft(
        0,
        options.programStartDate,
        weekCount,
        options.trainingDays,
    );

    return {
        programLocalId: options.programLocalId ?? createLocalId(),
        planId,
        programStartDate: options.programStartDate,
        totalWeeks: weekCount,
        phases: [phase],
        activePhaseId: phase.localId,
        createdAt: options.now ?? Date.now(),
        clientRequestId:
            options.clientRequestId ?? createMaterializationClientRequestId(),
    };
}

/** Aplica fechas derivadas a todas las fases (post cambio weekCount / orden / start). */
export function applyDerivedPhaseDates(
    draft: QuickProgramDraft,
): QuickProgramDraft {
    const sorted = [...draft.phases].sort((a, b) => a.sortOrder - b.sortOrder);
    const ranges = recalculatePhaseDates(draft.programStartDate, sorted);

    const phases = sorted.map((phase, index) => ({
        ...phase,
        startDate: ranges[index].startDate,
        endDate: ranges[index].endDate,
    }));

    return {
        ...draft,
        phases,
        totalWeeks: sumPhaseWeekCounts(phases),
    };
}

export interface AddPhaseOptions {
    trainingDays?: readonly string[] | null;
    weekCount?: number;
}

export function addPhaseToDraft(
    draft: QuickProgramDraft,
    options?: AddPhaseOptions,
): QuickProgramDraft {
    const sorted = [...draft.phases].sort((a, b) => a.sortOrder - b.sortOrder);
    const last = sorted[sorted.length - 1];
    const weekCount = options?.weekCount ?? last.weekCount ?? DEFAULT_WEEK_COUNT;
    const newPhase = createEmptyPhaseDraft(
        sorted.length,
        dayAfterLocal(last.endDate),
        weekCount,
        options?.trainingDays,
    );

    return applyDerivedPhaseDates({
        ...draft,
        phases: [...draft.phases, newPhase],
        activePhaseId: newPhase.localId,
    });
}

export function removePhaseFromDraft(
    draft: QuickProgramDraft,
    phaseLocalId: PhaseLocalId,
): QuickProgramDraft {
    if (draft.phases.length <= 1) {
        return draft;
    }

    const phases = draft.phases
        .filter((phase) => phase.localId !== phaseLocalId)
        .map((phase, index) => ({ ...phase, sortOrder: index }));

    const activePhaseId = phases.some((p) => p.localId === draft.activePhaseId)
        ? draft.activePhaseId
        : phases[0].localId;

    return applyDerivedPhaseDates({
        ...draft,
        phases,
        activePhaseId,
    });
}

export function reorderPhaseInDraft(
    draft: QuickProgramDraft,
    phaseLocalId: PhaseLocalId,
    newSortOrder: number,
): QuickProgramDraft {
    const sorted = [...draft.phases].sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = sorted.findIndex((p) => p.localId === phaseLocalId);
    if (currentIndex < 0) return draft;

    const clamped = Math.max(0, Math.min(sorted.length - 1, newSortOrder));
    const [moved] = sorted.splice(currentIndex, 1);
    sorted.splice(clamped, 0, moved);

    const phases = sorted.map((phase, index) => ({
        ...phase,
        sortOrder: index,
    }));

    return applyDerivedPhaseDates({ ...draft, phases });
}

export function setPhaseWeekCountInDraft(
    draft: QuickProgramDraft,
    phaseLocalId: PhaseLocalId,
    weekCount: number,
): QuickProgramDraft {
    if (weekCount < 1) return draft;

    const phases = draft.phases.map((phase) =>
        phase.localId === phaseLocalId
            ? {
                  ...phase,
                  weekCount,
                  endDate: deriveBlockEndFromWeekCount(phase.startDate, weekCount),
              }
            : phase,
    );

    return applyDerivedPhaseDates({ ...draft, phases });
}

export function setProgramStartDateInDraft(
    draft: QuickProgramDraft,
    programStartDate: string,
): QuickProgramDraft {
    return applyDerivedPhaseDates({
        ...draft,
        programStartDate,
    });
}

export function setActivePhaseInDraft(
    draft: QuickProgramDraft,
    phaseLocalId: PhaseLocalId,
): QuickProgramDraft {
    if (!draft.phases.some((p) => p.localId === phaseLocalId)) {
        return draft;
    }
    return { ...draft, activePhaseId: phaseLocalId };
}

export function updatePhaseInDraft(
    draft: QuickProgramDraft,
    phaseLocalId: PhaseLocalId,
    patch: Partial<Omit<PhaseDraft, "localId" | "sortOrder">>,
): QuickProgramDraft {
    const phases = draft.phases.map((phase) => {
        if (phase.localId !== phaseLocalId) return phase;

        const next: PhaseDraft = { ...phase, ...patch };
        if (patch.qualities !== undefined) {
            next.qualities = cloneQualities(patch.qualities);
        }
        if (patch.weeklyStructure !== undefined) {
            next.weeklyStructure = cloneWeeklyStructure(patch.weeklyStructure);
        }
        if (patch.weekExceptions !== undefined) {
            next.weekExceptions = cloneWeeklyStructure(patch.weekExceptions);
        }
        return next;
    });
    return { ...draft, phases };
}

/** Copia week1 structure de la fase anterior; no copia qualities/vol/int. */
export function copyStructureFromPreviousPhase(
    draft: QuickProgramDraft,
    phaseLocalId: PhaseLocalId,
): QuickProgramDraft {
    const sorted = [...draft.phases].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((p) => p.localId === phaseLocalId);
    if (index <= 0) return draft;

    const source = sorted[index - 1];
    const week1 = getWeek1Structure(source.weeklyStructure);

    const phases = draft.phases.map((phase) =>
        phase.localId === phaseLocalId
            ? {
                  ...phase,
                  weeklyStructure: cloneWeeklyStructure(week1),
                  copiedFromPhaseId: source.localId,
              }
            : phase,
    );

    return { ...draft, phases };
}

/** Convierte borrador local → payload O9 (sin IDs de servidor). */
export function draftToMaterializePayload(
    draft: QuickProgramDraft,
): QuickProgramMaterializeCreate {
    const phases = [...draft.phases]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((phase) => {
            const week1 = getWeek1Structure(phase.weeklyStructure)[0] ?? null;
            return {
                sort_order: phase.sortOrder,
                name: phase.label ?? null,
                start_date: phase.startDate,
                end_date: phase.endDate,
                volume_level: phase.volumeLevel,
                intensity_level: phase.intensityLevel,
                qualities: cloneQualities(phase.qualities),
                template_week: week1,
                apply_template_to_remaining_weeks: true,
            };
        });

    return {
        client_request_id: draft.clientRequestId,
        program_start_date: draft.programStartDate,
        phases,
    };
}

export type PhaseScheduleIssueKind = "gap" | "overlap";

export interface PhaseScheduleIssue {
    kind: PhaseScheduleIssueKind;
    leftPhaseId: PhaseLocalId;
    rightPhaseId: PhaseLocalId;
}

/** Detecta huecos u solapamientos entre fases del draft (orden sortOrder). */
export function detectDraftPhaseScheduleIssues(
    programStartDate: string,
    phases: readonly PhaseDraft[],
): PhaseScheduleIssue[] {
    const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);
    const issues: PhaseScheduleIssue[] = [];

    for (let i = 0; i < sorted.length; i += 1) {
        const current = sorted[i];
        const previous = i > 0 ? sorted[i - 1] : null;

        if (i === 0 && current.startDate !== programStartDate) {
            issues.push({
                kind: "gap",
                leftPhaseId: current.localId,
                rightPhaseId: current.localId,
            });
            continue;
        }

        if (!previous) continue;

        const expectedStart = dayAfterLocal(previous.endDate);
        if (current.startDate > expectedStart) {
            issues.push({
                kind: "gap",
                leftPhaseId: previous.localId,
                rightPhaseId: current.localId,
            });
        } else if (current.startDate < expectedStart) {
            issues.push({
                kind: "overlap",
                leftPhaseId: previous.localId,
                rightPhaseId: current.localId,
            });
        }
    }

    return issues;
}
