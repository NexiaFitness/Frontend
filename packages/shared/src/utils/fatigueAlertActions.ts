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

const FATIGUE_SEVERITY_LABEL_ES: Record<string, string> = {
    critical: "Crítica",
    high: "Alta",
    medium: "Media",
    low: "Baja",
};

const FATIGUE_ENGLISH_BODY_ES: Record<string, string> = {
    "Client wellbeing check indicates relevant fatigue; consider adjusting upcoming sessions.":
        "El check-in de bienestar indica fatiga relevante; valora ajustar las próximas sesiones.",
    "Continue with planned training intensity.": "Continuar con la intensidad planificada.",
    "High fatigue detected. Consider reducing next session intensity or adding recovery day.":
        "Fatiga alta. Valora bajar la intensidad de la próxima sesión o añadir un día de recuperación.",
    "Moderate fatigue. Monitor closely and adjust if needed.":
        "Fatiga moderada. Vigila de cerca y ajusta si hace falta.",
    "Low energy levels. Strongly recommend recovery or light session.":
        "Energía baja. Conviene recuperación o una sesión suave.",
    "Significant fatigue increase. Reduce next session intensity.":
        "Subida importante de fatiga. Baja la intensidad de la próxima sesión.",
    "Continue with planned training.": "Continuar con lo planificado.",
    "Reduce intensity by 30-40%. Focus on technique and recovery.":
        "Baja la intensidad un 30–40 %. Prioriza técnica y recuperación.",
    "Reduce intensity by 15-20%. Monitor fatigue closely.":
        "Baja la intensidad un 15–20 %. Vigila la fatiga de cerca.",
    "Can increase intensity if feeling good. Maintain good form.":
        "Si se encuentra bien, puede subir la intensidad. Mantén buena técnica.",
    "Continue with planned intensity. Monitor for any signs of fatigue.":
        "Continuar con la intensidad planificada. Vigila señales de fatiga.",
};

export function labelFatigueAlertSeverity(severity: string): string {
    return FATIGUE_SEVERITY_LABEL_ES[severity] ?? severity;
}

/** Títulos persistidos en inglés (alertas antiguas) → ES. */
export function labelFatigueAlertTitle(title: string): string {
    const high = /^High fatigue for (.+)$/i.exec(title);
    if (high?.[1]) return `Fatiga alta: ${high[1]}`;
    const moderate = /^Moderate fatigue for (.+)$/i.exec(title);
    if (moderate?.[1]) return `Fatiga moderada: ${moderate[1]}`;
    return title;
}

export function labelFatigueAlertBody(text: string): string {
    const mapped = FATIGUE_ENGLISH_BODY_ES[text];
    if (mapped) return mapped;
    const collapsed = text.replace(/\s+/g, " ").trim();
    return FATIGUE_ENGLISH_BODY_ES[collapsed] ?? text;
}
