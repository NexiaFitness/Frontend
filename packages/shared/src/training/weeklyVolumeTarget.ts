/**
 * Traducción del slider de volumen (1–10) a series por grupo muscular por semana (objetivo nominal).
 *
 * Contrato numérico cerrado: docs/specs/SPEC_TRADUCCION_VOLUMEN_SLIDER_A_SERIES_SEMANALES.md §6.1
 * Sin React ni efectos secundarios; entradas inválidas → null (no enmascarar datos rotos con piso 1).
 */

/**
 * Calcula el objetivo semanal en series (entero ≥ 1) a partir del techo `max_sets` y el nivel de volumen.
 *
 * @param maxSets Entero ≥ 1 (p. ej. `recommendations.volume.max_sets` con recomendaciones complete).
 * @param volumeLevel Entero en [1, 10] (p. ej. `PlanPeriodBlock.volume_level`).
 * @returns Entero mostrable, o `null` si alguna entrada no cumple precondiciones §6.1.
 *
 * Nota de arquitectura: en flujos donde el backend ya expone `weekly_target`
 * (p. ej. `POST /session-load/validate-draft`), el frontend debe consumir ese
 * valor directamente y NO recalcularlo con esta funcion. Esta funcion queda
 * como fuente de verdad para contextos sin borrador (GET semanal, etc.).
 */
export function computeTargetWeeklySets(maxSets: number, volumeLevel: number): number | null {
    if (!Number.isFinite(maxSets) || !Number.isFinite(volumeLevel)) {
        return null;
    }
    if (!Number.isInteger(maxSets) || maxSets < 1) {
        return null;
    }
    if (!Number.isInteger(volumeLevel) || volumeLevel < 1 || volumeLevel > 10) {
        return null;
    }

    const rounded = Math.round((maxSets * volumeLevel) / 10);
    return Math.max(1, rounded);
}
