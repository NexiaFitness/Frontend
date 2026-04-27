/**
 * sessionValidation.ts — Tipos para validación automática de sesiones
 *
 * Contexto:
 * - Fase 7 de SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 * - Contrato con backend: `backend/app/schemas/session_validation.py`
 * - Endpoint: POST /session-validation/validate-session
 *
 * Nota:
 * - qualities e intensity son null en V1 (reservados para V2 futura).
 * - version siempre "v1" en respuestas actuales.
 *
 * @author Frontend Team
 * @since v6.3.0 — Fase 7 SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 */

export type ValidationStatus = "aligned" | "slight_deviation" | "misaligned";

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

export interface PatternsValidation {
    status: ValidationStatus;
    expected: string[];
    actual: string[];
    missing: string[];
    extra: string[];
    coverage_note?: string | null;
}

// ---------------------------------------------------------------------------
// Volume
// ---------------------------------------------------------------------------

export interface VolumeMuscleValidation {
    muscle_group_id: number;
    name_es: string;
    weekly_target: number;
    daily_expected: number;
    actual_sets: number;
    deviation_percent: number;
}

export interface VolumeValidation {
    status: ValidationStatus;
    muscle_groups: VolumeMuscleValidation[];
}

// ---------------------------------------------------------------------------
// Qualities / Intensity (V2 placeholders)
// ---------------------------------------------------------------------------

export interface QualityValidation {
    status: ValidationStatus;
    planned_percentages: { physical_quality_id: number; name: string; percentage: number }[];
    actual_percentages: { physical_quality_id: number; name: string; percentage: number }[];
    deviation_percent: number;
}

export interface IntensityValidation {
    status: ValidationStatus;
    block_intensity_level: number;
    session_planned_intensity: number;
    deviation_percent: number;
}

// ---------------------------------------------------------------------------
// Top-level response
// ---------------------------------------------------------------------------

export interface SessionValidationOut {
    training_session_id: number;
    period_block_id: number;
    overall_status: ValidationStatus | "partially_aligned";
    version: string;
    disclaimers: string[];
    patterns: PatternsValidation | null;
    volume: VolumeValidation | null;
    qualities: QualityValidation | null;
    intensity: IntensityValidation | null;
}
