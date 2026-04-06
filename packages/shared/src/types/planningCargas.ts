/**
 * planningCargas.ts — Tipos para planificación por bloques de periodización
 *
 * Contrato con backend: period blocks, catálogo de cualidades físicas.
 * Legacy monthly/weekly/daily eliminado en Fase 9.
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 0
 * @updated v9.0.0 — Eliminados tipos legacy (MonthlyPlan, WeeklyOverride, DailyOverride, ResolvedDayPlan)
 */

// ---------------------------------------------------------------------------
// Catálogo de cualidades físicas (GET /catalogs/physical-qualities)
// ---------------------------------------------------------------------------

export interface PhysicalQuality {
  id: number;
  name: string;
  slug: string;
  modality: string;
  has_volume: boolean;
  display_order: number;
}

// ---------------------------------------------------------------------------
// Calidad física: valor anidado (Fase 5b) y legacy flat
// ---------------------------------------------------------------------------

/** Valor de una cualidad en estructura anidada (clave = slug). */
export interface QualityValue {
  pct: number;
  volume_pct?: number;
  intensity_pct?: number;
}

/** Estructura anidada: slug -> { pct, volume_pct?, intensity_pct? }. */
export type NestedQualitiesConfig = Record<string, QualityValue>;

/** Legacy: nombre -> pct (0–1). Mantener para compatibilidad con respuestas antiguas. */
export interface QualityConfig {
  [qualityName: string]: number; // e.g. { "Fuerza": 0.4, "Resistencia": 0.6 }
}

/** Payload para create/update: backend acepta anidado (Fase 5b) o legacy flat. */
export type QualitiesPayload = QualityConfig | NestedQualitiesConfig;

// ---------------------------------------------------------------------------
// Period blocks — periodización por rangos (mesociclos / fases)
// Contrato: SPEC_BACKEND_TrainingBlocks.md
// ---------------------------------------------------------------------------

export interface PeriodBlockQuality {
  id: number;
  physical_quality_id: number;
  percentage: number;
  physical_quality_name: string | null;
  physical_quality_slug: string | null;
}

export interface PlanPeriodBlock {
  id: number;
  training_plan_id: number;
  name: string | null;
  goal: string | null;
  start_date: string;
  end_date: string;
  volume_level: number;
  intensity_level: number;
  sort_order: number | null;
  qualities: PeriodBlockQuality[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface PeriodBlockQualityInput {
  physical_quality_id: number;
  percentage: number;
}

export interface PlanPeriodBlockCreate {
  name?: string | null;
  goal?: string | null;
  start_date: string;
  end_date: string;
  volume_level: number;
  intensity_level: number;
  sort_order?: number | null;
  qualities: PeriodBlockQualityInput[];
}

export interface PlanPeriodBlockUpdate {
  name?: string | null;
  goal?: string | null;
  start_date?: string;
  end_date?: string;
  volume_level?: number;
  intensity_level?: number;
  sort_order?: number | null;
  qualities?: PeriodBlockQualityInput[];
}
