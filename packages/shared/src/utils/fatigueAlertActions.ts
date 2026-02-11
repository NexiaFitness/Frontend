/**
 * fatigueAlertActions.ts — Regla de producto: acción contextual por tipo de alerta
 *
 * Propósito: Centralizar la decisión "qué acción sugerir al trainer" según alert_type.
 * La UI solo navega; no decide etiquetas ni destinos.
 * Alineado con agent.md: lógica en shared, UI delega.
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import type { FatigueAlertType } from "../types/training";

export interface FatigueAlertContextualAction {
    /** Etiqueta para el enlace (ej. "Ajustar sesión", "Ver plan") */
    label: string;
    /** Si existe, la UI debe navegar al cliente con ?tab=valor; si no, a overview del cliente */
    tab?: string;
}

/**
 * Devuelve la acción contextual recomendada para un tipo de alerta.
 * Regla de producto: session_adjustment → sesiones; resto → plan (overview).
 */
export function getFatigueAlertContextualAction(
    alertType: FatigueAlertType
): FatigueAlertContextualAction {
    if (alertType === "session_adjustment") {
        return { label: "Ajustar sesión", tab: "sessions" };
    }
    return { label: "Ver plan", tab: undefined };
}
