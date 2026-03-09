/**
 * qualityUtils.ts — Utilidades para qualities (planificación Fase 5b)
 *
 * Extraído de PlanningTab.tsx / ClientPlanningTab: parseQualities y qualitiesToDisplayString.
 * Estructura anidada: slug -> { pct, volume_pct?, intensity_pct? }. Compatible con legacy flat (nombre -> número).
 *
 * @author Frontend Team
 * @since Fase 5b U10
 */

import type { NestedQualitiesConfig, QualityConfig, QualityValue } from "../types/planningCargas";

/**
 * Parsea texto de cualidades al formato anidado.
 * Lógica reflejada de PlanningTab: pares separados por coma o punto y coma; cada par "clave: valor" o "clave: v1, v2, v3".
 * - Un número: { pct } (valor en 0–1).
 * - Tres números: { pct, volume_pct, intensity_pct } (todos en 0–1).
 */
export function parseQualities(text: string): NestedQualitiesConfig | null {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const out: NestedQualitiesConfig = {};
    const pairs = trimmed.split(/[,;]/).map((s) => s.trim());
    for (const p of pairs) {
        const idx = p.lastIndexOf(":");
        if (idx === -1) continue;
        const name = p.slice(0, idx).trim();
        const rest = p.slice(idx + 1).trim();
        const numbers = rest
            .split(",")
            .map((s) => parseFloat(s.trim()))
            .filter((n) => !Number.isNaN(n));
        if (!name || numbers.length === 0) continue;
        const pct = numbers[0] / 100;
        const entry: QualityValue = { pct };
        if (numbers.length >= 3) {
            entry.volume_pct = numbers[1] / 100;
            entry.intensity_pct = numbers[2] / 100;
        } else if (numbers.length >= 2) {
            entry.intensity_pct = numbers[1] / 100;
        }
        out[name] = entry;
    }
    return Object.keys(out).length ? out : null;
}

/**
 * Convierte qualities a string para mostrar en UI.
 * Acepta legacy (QualityConfig: clave -> número) y anidado (NestedQualitiesConfig: clave -> QualityValue).
 * Lógica reflejada de PlanningTab: "—" si vacío; sino "clave: pct%" y opcionalmente "(vol X%, int Y%)".
 */
export function qualitiesToDisplayString(
    qualities: NestedQualitiesConfig | QualityConfig | null
): string {
    if (!qualities || Object.keys(qualities).length === 0) return "—";
    return Object.entries(qualities)
        .map(([k, v]) => {
            if (typeof v === "number") {
                return `${k}: ${Math.round(v * 100)}%`;
            }
            const q = v as QualityValue;
            const pctStr = `${k}: ${Math.round(q.pct * 100)}%`;
            if (q.volume_pct != null || q.intensity_pct != null) {
                const parts: string[] = [];
                if (q.volume_pct != null) parts.push(`vol ${Math.round(q.volume_pct * 100)}%`);
                if (q.intensity_pct != null) parts.push(`int ${Math.round(q.intensity_pct * 100)}%`);
                return parts.length > 0 ? `${pctStr} (${parts.join(", ")})` : pctStr;
            }
            return pctStr;
        })
        .join(", ");
}
