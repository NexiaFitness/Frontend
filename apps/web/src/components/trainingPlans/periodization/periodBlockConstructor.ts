/**
 * periodBlockConstructor.ts — Pasos del constructor de bloque en ClientPlanningTab.
 *
 * Flujo: rango (calendario) → cualidades → estructura semanal → volumen/intensidad.
 * La columna derecha muestra un solo paso; la card bajo el calendario acumula lo completado.
 */

export type PeriodBlockConstructorStep =
    | "range"
    | "qualities"
    | "weeklyStructure"
    | "volumeIntensity";

export const CONSTRUCTOR_STEP_ORDER: PeriodBlockConstructorStep[] = [
    "range",
    "qualities",
    "weeklyStructure",
    "volumeIntensity",
];

export const CONSTRUCTOR_STEP_LABELS: Record<PeriodBlockConstructorStep, string> = {
    range: "Rango",
    qualities: "Cualidades físicas",
    weeklyStructure: "Estructura semanal",
    volumeIntensity: "Volumen e intensidad",
};

export function nextConstructorStep(
    current: PeriodBlockConstructorStep,
): PeriodBlockConstructorStep | null {
    const i = CONSTRUCTOR_STEP_ORDER.indexOf(current);
    if (i < 0 || i >= CONSTRUCTOR_STEP_ORDER.length - 1) return null;
    return CONSTRUCTOR_STEP_ORDER[i + 1];
}

export function stepIndex(step: PeriodBlockConstructorStep): number {
    return CONSTRUCTOR_STEP_ORDER.indexOf(step);
}
