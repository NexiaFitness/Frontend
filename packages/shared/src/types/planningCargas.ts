/**
 * planningCargas.ts — Tipos para planificación de cargas (period-based)
 *
 * Contrato con backend: monthly_plans, weekly_overrides, daily_overrides,
 * y resultado de resolve_day_plan (ResolvedDayPlan).
 * Plan de cargas Fase 0; schema alineado con DECISIONES_PLANIFICACION_CARGAS.md.
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 0
 * @updated Fase 5b — PhysicalQuality catalog, QualityValue (nested qualities)
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
// Baseline mensual (monthly_plan)
// month: "YYYY-MM".
// training_plan_id: opcional (client-only mode); si null, client_id requerido.
// client_id: opcional cuando hay plan; requerido cuando training_plan_id es null.
// ---------------------------------------------------------------------------

export interface MonthlyPlan {
  id: number;
  training_plan_id: number | null;
  client_id: number | null;
  month: string; // "YYYY-MM"
  qualities: QualityConfig | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface MonthlyPlanCreate {
  training_plan_id?: number | null;
  client_id?: number | null;
  month: string;
  qualities?: QualitiesPayload | null;
}

export interface MonthlyPlanUpdate {
  qualities?: QualitiesPayload | null;
}

// ---------------------------------------------------------------------------
// Override semanal (weekly_override)
// week_id: e.g. "2026-02-W1" (año-mes-semana)
// ---------------------------------------------------------------------------

export interface WeeklyOverride {
  id: number;
  monthly_plan_id: number;
  week_id: string;
  qualities: QualityConfig | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  /** Aviso informativo si la media semanal se desvía del baseline (Fase 3). */
  weekly_average_warning?: string | null;
}

export interface WeeklyOverrideCreate {
  monthly_plan_id: number;
  week_id: string;
  qualities?: QualitiesPayload | null;
}

// ---------------------------------------------------------------------------
// Override diario (daily_override)
// client_id + date únicos.
// ---------------------------------------------------------------------------

export interface DailyOverride {
  id: number;
  client_id: number;
  date: string; // ISO date "YYYY-MM-DD"
  qualities: QualityConfig | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  /** Aviso informativo si la media semanal se desvía del baseline (Fase 3). */
  weekly_average_warning?: string | null;
}

export interface DailyOverrideCreate {
  client_id: number;
  date: string;
  qualities?: QualitiesPayload | null;
}

// ---------------------------------------------------------------------------
// Plan del día resuelto (resolve_day_plan)
// Origen: month | week | day según herencia.
// ---------------------------------------------------------------------------

export type ResolvedDayPlanSource = "month" | "week" | "day";

export interface ResolvedDayPlan {
  date: string; // ISO "YYYY-MM-DD"
  is_trainable: boolean;
  qualities: QualityConfig | null;
  resolved_volume: number | null; // e.g. 0.8 = 80%
  resolved_intensity: number | null;
  source: ResolvedDayPlanSource | null;
}
