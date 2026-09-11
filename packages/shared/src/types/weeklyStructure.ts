/**
 * weeklyStructure.ts — Tipos TypeScript para Estructura Semanal de Bloques de Periodización
 *
 * Contexto:
 * - Contrato con backend: schemas en `backend/app/schemas/weekly_structure.py`
 * - Modelos: `WeeklyStructureWeek`, `WeeklyStructureDay`, `WeeklyStructureDayPattern`
 * - Endpoints bajo `/training-plans/{plan_id}/period-blocks/{block_id}/weekly-structure`
 *
 * @author Frontend Team
 * @since v6.3.0 — Fase 5 SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 */

// ---------------------------------------------------------------------------
// Pattern (patrón de movimiento asignado a un día)
// ---------------------------------------------------------------------------

export interface WeeklyStructureDayPattern {
    id?: number;
    movement_pattern_id: number;
    name_es?: string;
    sub_pattern?: string | null;
}

/** Payload para crear/actualizar un patrón (sin id generado por BD). */
export interface WeeklyStructureDayPatternInput {
    movement_pattern_id: number;
    sub_pattern?: string | null;
}

// ---------------------------------------------------------------------------
// Day (día de la semana dentro de una semana estructural)
// ---------------------------------------------------------------------------

export interface WeeklyStructureDay {
    id?: number;
    day_of_week: number; // 1=lunes … 7=domingo
    patterns: WeeklyStructureDayPattern[];
}

/** Payload para crear/actualizar un día (sin id generado por BD). */
export interface WeeklyStructureDayInput {
    day_of_week: number;
    patterns: WeeklyStructureDayPatternInput[];
}

// ---------------------------------------------------------------------------
// Week (semana dentro de un bloque de periodización)
// ---------------------------------------------------------------------------

export interface WeeklyStructureWeek {
    id?: number;
    week_ordinal: number;
    label?: string | null;
    days: WeeklyStructureDay[];
}

/** Payload para crear/actualizar una semana (sin id generado por BD). */
export interface WeeklyStructureWeekCreate {
    week_ordinal: number;
    label?: string | null;
    days: WeeklyStructureDayInput[];
}

// ---------------------------------------------------------------------------
// Top-level structure (respuesta completa del backend)
// ---------------------------------------------------------------------------

export interface WeeklyStructureOut {
    plan_period_block_id: number;
    weeks: WeeklyStructureWeek[];
}

// ---------------------------------------------------------------------------
// Repeat week (repetición de semanas — Fase 3 backend / Fase 6 frontend)
// ---------------------------------------------------------------------------

export interface WeeklyStructureWeekRepeatIn {
    target_week_ordinals: number[];
    force: boolean;
}

export interface WeeklyStructureWeekRepeatOut {
    copied_week_ordinals: number[];
    sessions_copied: number;
    sessions_skipped: number;
}

// ---------------------------------------------------------------------------
// Apply template (structure-only)
// ---------------------------------------------------------------------------

export interface WeeklyStructureApplyTemplateIn {
    source_week_ordinal?: number;
    target_week_ordinals?: number[] | null;
    respect_exceptions?: boolean;
}

export interface WeeklyStructureApplyTemplateOut {
    applied_week_ordinals: number[];
    skipped_week_ordinals: number[];
}

// ---------------------------------------------------------------------------
// Sync recurring structure from edit (atomic)
// ---------------------------------------------------------------------------

export interface WeeklyStructureSyncRecurringIn {
    template_week: WeeklyStructureWeekCreate;
    personalized_week_updates?: WeeklyStructureWeekCreate[];
}

export interface WeeklyStructureSyncRecurringOut {
    applied_week_ordinals: number[];
    preserved_week_ordinals: number[];
    updated_personalized_ordinals: number[];
}
