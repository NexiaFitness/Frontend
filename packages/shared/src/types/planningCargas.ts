/**
 * planningCargas.ts — Tipos para planificación de cargas (period-based)
 *
 * Contrato con backend: monthly_plans, weekly_overrides, daily_overrides,
 * y resultado de resolve_day_plan (ResolvedDayPlan).
 * Plan de cargas Fase 0; schema alineado con DECISIONES_PLANIFICACION_CARGAS.md.
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 0
 */

// ---------------------------------------------------------------------------
// Calidad física: distribución (ej. Fuerza 40%, Resistencia 60%)
// ---------------------------------------------------------------------------

export interface QualityConfig {
  [qualityName: string]: number; // e.g. { "Fuerza": 0.4, "Resistencia": 0.6 }
}

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
  qualities?: QualityConfig | null;
}

export interface MonthlyPlanUpdate {
  qualities?: QualityConfig | null;
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
}

export interface WeeklyOverrideCreate {
  monthly_plan_id: number;
  week_id: string;
  qualities?: QualityConfig | null;
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
}

export interface DailyOverrideCreate {
  client_id: number;
  date: string;
  qualities?: QualityConfig | null;
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
