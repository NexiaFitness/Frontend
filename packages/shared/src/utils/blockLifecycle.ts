/**
 * blockLifecycle.ts — Reglas puras del ciclo de vida del bloque en el frontend (Hito 2).
 *
 * Contexto: D-BLQ-2 (decisión de Nelson). A partir de la previsualización del
 * backend se decide qué confirmación mostrar; y una fase archivada se etiqueta
 * como tal en el detalle de sesión.
 * Ver docs/planificacion/auditoria-propagacion-bloque-sesiones-2026-10/05_PLAN_IMPLEMENTACION_HITO_2.md.
 *
 * Notas de mantenimiento: funciones puras; el backend vuelve a validar (409).
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import type { BlockDeletionPreview } from "../types/planningCargas";

/**
 * - `delete-empty`: bloque sin sesiones.
 * - `delete-planned`: solo sesiones planificadas sin registro (se borran con el bloque).
 * - `archive`: hay sesiones entrenadas; no se puede borrar, se archiva.
 */
export type BlockRemovalVariant = "delete-empty" | "delete-planned" | "archive";

export function resolveBlockRemovalVariant(
    preview: Pick<BlockDeletionPreview, "action" | "planned_sessions">,
): BlockRemovalVariant {
    if (preview.action === "archive") return "archive";
    return preview.planned_sessions > 0 ? "delete-planned" : "delete-empty";
}

/** Nombre de fase con sufijo «(archivada)» cuando el bloque está inactivo. */
export function formatPhaseNameWithStatus(name: string, isActive: boolean): string {
    return isActive ? name : `${name} (archivada)`;
}
