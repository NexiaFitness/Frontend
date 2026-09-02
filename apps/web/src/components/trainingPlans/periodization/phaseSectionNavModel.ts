/**
 * phaseSectionNavModel.ts — Identidades y mapeos del nav por sección de fase (F2 D-SAF).
 *
 * Contexto: traduce anclas UX (Cualidades, Carga, Semana tipo, Semanas, Resumen) al
 * paso legacy del constructor y al modo del editor de estructura semanal.
 * Colabora con PhaseSectionNav (UI) y PlanPeriodizationSection (orquestación).
 *
 * Notas de mantenimiento: weekType y weeks comparten constructor step pero no modo
 * de estructura; no mezclar helpers aquí con tokens visuales (phaseConstructorPresentation).
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import type { PeriodBlockConstructorStep } from "./periodBlockConstructor";

export type PhaseSectionId =
    | "qualities"
    | "load"
    | "weekType"
    | "weeks"
    | "summary";

export const PHASE_SECTION_ORDER: PhaseSectionId[] = [
    "qualities",
    "load",
    "weekType",
    "weeks",
    "summary",
];

export const PHASE_SECTION_LABELS: Record<PhaseSectionId, string> = {
    qualities: "Cualidades",
    load: "Carga",
    weekType: "Semana tipo",
    weeks: "Semanas",
    summary: "Resumen",
};

/** Map legacy constructor steps to section nav ids. */
export function constructorStepToSection(
    step: PeriodBlockConstructorStep,
): PhaseSectionId {
    switch (step) {
        case "qualities":
            return "qualities";
        case "volumeIntensity":
            return "load";
        case "weeklyStructure":
            return "weekType";
        case "summary":
            return "summary";
        case "range":
            return "qualities";
        default:
            return "qualities";
    }
}

export function sectionToConstructorStep(
    section: PhaseSectionId,
): PeriodBlockConstructorStep {
    switch (section) {
        case "qualities":
            return "qualities";
        case "load":
            return "volumeIntensity";
        case "weekType":
            return "weeklyStructure";
        case "weeks":
            return "weeklyStructure";
        case "summary":
            return "summary";
        default:
            return "qualities";
    }
}

/** Vista de estructura semanal según ancla de navegación. */
export type WeeklyStructureNavMode = "template" | "all";

export function sectionToWeeklyStructureMode(
    section: PhaseSectionId,
): WeeklyStructureNavMode {
    return section === "weeks" ? "all" : "template";
}
