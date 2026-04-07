/**
 * trainingPlanEditor.ts — Validación y utilidades puras para el editor unificado
 * de planes (crear / editar). Sin DOM, sin RTK.
 *
 * Contexto: contrato alineado con `TrainingPlanCreate`, `TrainingPlanUpdate` y
 * listados de `TrainingPlanInstance` del backend (`backend/app/schemas/planning.py`).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import {
    TRAINING_PLAN_GOAL,
    type TrainingPlanCreate,
    type TrainingPlanUpdate,
} from "../types/training";

/** Valores del formulario compartidos entre create y edit (capa UI). */
export interface TrainingPlanEditorDraft {
    name: string;
    start_date: string;
    end_date: string;
    goal: string;
    description: string;
    status: string;
    tagsInput: string;
}

export interface TrainingPlanEditorValidationErrors {
    name?: string;
    start_date?: string;
    end_date?: string;
    goal?: string;
}

/** Instancia mínima para comprobar solapes (evita dependencia circular con tipos ricos). */
export interface TrainingPlanInstanceOverlapRow {
    name: string;
    start_date?: string | null;
    end_date?: string | null;
    source_plan_id?: number | null;
}

export function createEmptyTrainingPlanEditorDraft(
    defaults?: Partial<Pick<TrainingPlanEditorDraft, "start_date">>
): TrainingPlanEditorDraft {
    const today = new Date().toISOString().split("T")[0];
    return {
        name: "",
        start_date: defaults?.start_date ?? today,
        end_date: "",
        goal: "",
        description: "",
        status: "active",
        tagsInput: "",
    };
}

/** Normaliza tags desde input tipo "foo, bar" → lista para API. */
export function parseTagsInput(tagsInput: string): string[] | null {
    const parts = tagsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return parts.length > 0 ? parts : null;
}

export function mapTrainingPlanToEditorDraft(plan: {
    name: string;
    start_date: string;
    end_date: string;
    goal: string;
    description: string | null;
    status: string;
    tags?: string[] | null;
}): TrainingPlanEditorDraft {
    return {
        name: plan.name,
        start_date: plan.start_date.slice(0, 10),
        end_date: plan.end_date.slice(0, 10),
        goal: plan.goal,
        description: plan.description ?? "",
        status: plan.status ?? "active",
        tagsInput: (plan.tags ?? []).join(", "),
    };
}

export function validateTrainingPlanEditorDraft(
    draft: TrainingPlanEditorDraft
): TrainingPlanEditorValidationErrors {
    const errors: TrainingPlanEditorValidationErrors = {};

    if (!draft.name?.trim()) {
        errors.name = "El nombre es obligatorio";
    }
    if (!draft.start_date) {
        errors.start_date = "La fecha de inicio es obligatoria";
    }
    if (!draft.end_date) {
        errors.end_date = "La fecha de fin es obligatoria";
    }
    if (draft.start_date && draft.end_date) {
        const start = new Date(draft.start_date);
        const end = new Date(draft.end_date);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start >= end) {
            errors.end_date = "Debe ser posterior a la fecha de inicio";
        }
    }
    if (!draft.goal?.trim()) {
        errors.goal = "El objetivo es obligatorio";
    }

    return errors;
}

export function isTrainingPlanEditorDraftValid(draft: TrainingPlanEditorDraft): boolean {
    return Object.keys(validateTrainingPlanEditorDraft(draft)).length === 0;
}

/** Dos rangos [inicio, fin] en ISO YYYY-MM-DD se solapan (intervalos inclusivos por día). */
export function planDateRangesOverlap(
    dateFrom: string,
    dateTo: string,
    plan: { start_date?: string | null; end_date?: string | null }
): boolean {
    const start = plan.start_date?.slice(0, 10) ?? "";
    const end = plan.end_date?.slice(0, 10) ?? "";
    if (dateFrom && end < dateFrom) return false;
    if (dateTo && start > dateTo) return false;
    return true;
}

/**
 * Primera instancia competidora que solapa con [rangeStart, rangeEnd].
 * Excluye filas cuyo `source_plan_id` coincide con `excludeSourcePlanId` (modo edit).
 */
export function findOverlappingTrainingPlanInstance(
    instances: TrainingPlanInstanceOverlapRow[],
    rangeStart: string,
    rangeEnd: string,
    excludeSourcePlanId: number | null
): TrainingPlanInstanceOverlapRow | undefined {
    return instances.find((inst) => {
        if (
            excludeSourcePlanId != null &&
            inst.source_plan_id != null &&
            inst.source_plan_id === excludeSourcePlanId
        ) {
            return false;
        }
        return planDateRangesOverlap(rangeStart, rangeEnd, inst);
    });
}

export function buildTrainingPlanCreatePayload(
    trainerId: number,
    clientId: number | null,
    draft: TrainingPlanEditorDraft
): TrainingPlanCreate {
    const desc = draft.description.trim();
    return {
        trainer_id: trainerId,
        client_id: clientId,
        name: draft.name.trim(),
        goal: draft.goal.trim(),
        start_date: draft.start_date,
        end_date: draft.end_date,
        status: "active",
        description: desc.length > 0 ? desc : null,
        tags: parseTagsInput(draft.tagsInput),
    };
}

/** PUT serializable: envía campos editables acorde al formulario completo en edit. */
export function buildTrainingPlanUpdatePayload(draft: TrainingPlanEditorDraft): TrainingPlanUpdate {
    const desc = draft.description.trim();
    return {
        name: draft.name.trim(),
        goal: draft.goal.trim(),
        start_date: draft.start_date,
        end_date: draft.end_date,
        status: draft.status,
        description: desc.length > 0 ? desc : null,
        tags: parseTagsInput(draft.tagsInput),
    };
}

/**
 * Mapea texto de objetivo del perfil cliente a valor `goal` del plan (snake_case API).
 */
export function mapClientProfileObjectiveToPlanGoal(objective: string | null | undefined): string {
    if (!objective) return "";
    const obj = objective.toLowerCase();

    if (
        obj.includes("hipertrofia") ||
        obj.includes("masa") ||
        obj.includes("músculo") ||
        obj.includes("musculo") ||
        obj.includes("volumen")
    ) {
        return TRAINING_PLAN_GOAL.HYPERTROPHY;
    }
    if (
        obj.includes("peso") ||
        obj.includes("grasa") ||
        obj.includes("adelgazar") ||
        obj.includes("definición") ||
        obj.includes("definicion") ||
        obj.includes("cutting")
    ) {
        return TRAINING_PLAN_GOAL.WEIGHT_LOSS;
    }
    if (obj.includes("potencia") || obj.includes("power")) {
        return TRAINING_PLAN_GOAL.POWER;
    }
    if (obj.includes("fuerza") || obj.includes("powerlifting")) {
        return TRAINING_PLAN_GOAL.STRENGTH;
    }
    if (
        obj.includes("resistencia") ||
        obj.includes("cardio") ||
        obj.includes("aerobic") ||
        obj.includes("maraton")
    ) {
        return TRAINING_PLAN_GOAL.ENDURANCE;
    }
    if (
        obj.includes("rendimiento") ||
        obj.includes("deporte") ||
        obj.includes("competicion") ||
        obj.includes("competición") ||
        obj.includes("atleta")
    ) {
        return TRAINING_PLAN_GOAL.SPORT_PERFORMANCE;
    }
    if (
        obj.includes("rehabilita") ||
        obj.includes("lesión") ||
        obj.includes("lesion") ||
        obj.includes("recuperación") ||
        obj.includes("recuperacion") ||
        obj.includes("fisioterapia")
    ) {
        return TRAINING_PLAN_GOAL.REHABILITATION;
    }
    if (
        obj.includes("salud") ||
        obj.includes("bienestar") ||
        obj.includes("tono") ||
        obj.includes("forma")
    ) {
        return TRAINING_PLAN_GOAL.GENERAL_FITNESS;
    }
    return "";
}
