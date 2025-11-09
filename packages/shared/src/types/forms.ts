/**
 * forms.ts — Tipos unificados para formularios compartidos (cliente + progreso)
 *
 * Contexto:
 * - Unifica ClientFormData (onboarding/cliente) y UpdateClientProgressData (progreso físico)
 * - Soluciona incompatibilidades de tipos entre formularios y modales
 * - Compatible con ClientMetricsFields, EditProgressModal y ProgressForm
 *
 * Propósito:
 * - Evitar errores TS2345 de incompatibilidad de tipo "string" al pasar updateField()
 * - Centralizar tipos de formularios para futuras integraciones
 *
 * @author
 * Frontend Team — NEXIA Fitness
 * @since v4.4.2
 */

import type { ClientFormData } from "./client";
import type { UpdateClientProgressData } from "./progress";

/**
 * UniversalMetricsFormData
 * 
 * Tipo universal para formularios de métricas físicas y progreso.
 * 
 * Acepta todos los campos de:
 * - ClientFormData (onboarding)
 * - UpdateClientProgressData (progreso físico)
 * 
 * Incluye además campos extendidos usados por formularios mixtos
 * (fecha_registro, unidad, notas).
 */
export type UniversalMetricsFormData = Partial<
  ClientFormData &
  UpdateClientProgressData & {
    fecha_registro?: string;
    notas?: string | null;
    unidad?: "metric" | "imperial";
  }
>;

