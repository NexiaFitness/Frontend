/**
 * Etiquetas ES y chips de categoría para planes y plantillas.
 * El color viene de `goal` (canónico del backend); tags solo aportan etiquetas de display.
 */

import {
    TRAINING_PLAN_GOAL,
    type TrainingPlan,
    type TrainingPlanTemplate,
} from "@nexia/shared/types/training";

export const GOAL_LABEL_ES: Record<string, string> = {
    "Muscle Gain": "Hipertrofia",
    Strength: "Fuerza",
    "Weight Loss": "Pérdida de peso",
    Endurance: "Resistencia",
    "General Fitness": "Fitness general",
    Rehabilitation: "Rehabilitación",
    Performance: "Rendimiento",
};

const CHIP_NEUTRAL = "bg-muted/50 text-muted-foreground";

/**
 * Paleta semántica: color según el significado del objetivo.
 * primary=cyan, success=verde, warning=ámbar.
 */
const GOAL_CHIP_TONE: Record<string, string> = {
    [TRAINING_PLAN_GOAL.MUSCLE_GAIN]: "bg-primary/15 text-primary", // Hipertrofia: crecimiento, construcción
    [TRAINING_PLAN_GOAL.WEIGHT_LOSS]: "bg-warning/10 text-warning", // Pérdida de peso: quemar, déficit
    [TRAINING_PLAN_GOAL.STRENGTH]: "bg-red-600/20 text-red-400", // Fuerza: rojo
    [TRAINING_PLAN_GOAL.ENDURANCE]: "bg-primary/10 text-primary", // Resistencia: aliento, esfuerzo sostenido
    [TRAINING_PLAN_GOAL.GENERAL_FITNESS]: "bg-success/12 text-success", // Mantenimiento: verde
    [TRAINING_PLAN_GOAL.REHABILITATION]: "bg-orange-700/25 text-orange-400", // Rehabilitación: naranja oscuro
    [TRAINING_PLAN_GOAL.PERFORMANCE]: "bg-violet-600/20 text-violet-400", // Rendimiento: granate morado
};

const GOAL_TO_CANONICAL: Record<string, string> = {
    hipertrofia: TRAINING_PLAN_GOAL.MUSCLE_GAIN,
    Hipertrofia: TRAINING_PLAN_GOAL.MUSCLE_GAIN,
    "Aumentar masa muscular": TRAINING_PLAN_GOAL.MUSCLE_GAIN,
    Mantenimiento: TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    Mantenimento: TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    mantenimiento: TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    mantenimento: TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    "Pérdida de peso": TRAINING_PLAN_GOAL.WEIGHT_LOSS,
    "Perdida de peso": TRAINING_PLAN_GOAL.WEIGHT_LOSS,
    Rendimiento: TRAINING_PLAN_GOAL.PERFORMANCE,
    "Rendimiento deportivo": TRAINING_PLAN_GOAL.PERFORMANCE,
    Fuerza: TRAINING_PLAN_GOAL.STRENGTH,
    Resistencia: TRAINING_PLAN_GOAL.ENDURANCE,
    "Fitness general": TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    Rehabilitación: TRAINING_PLAN_GOAL.REHABILITATION,
    [TRAINING_PLAN_GOAL.MUSCLE_GAIN]: TRAINING_PLAN_GOAL.MUSCLE_GAIN,
    [TRAINING_PLAN_GOAL.WEIGHT_LOSS]: TRAINING_PLAN_GOAL.WEIGHT_LOSS,
    [TRAINING_PLAN_GOAL.STRENGTH]: TRAINING_PLAN_GOAL.STRENGTH,
    [TRAINING_PLAN_GOAL.ENDURANCE]: TRAINING_PLAN_GOAL.ENDURANCE,
    [TRAINING_PLAN_GOAL.GENERAL_FITNESS]: TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    [TRAINING_PLAN_GOAL.REHABILITATION]: TRAINING_PLAN_GOAL.REHABILITATION,
    [TRAINING_PLAN_GOAL.PERFORMANCE]: TRAINING_PLAN_GOAL.PERFORMANCE,
};

function canonicalGoal(goal: string | null | undefined): string {
    const g = goal?.trim() ?? "";
    return GOAL_TO_CANONICAL[g] ?? g;
}

function toneFromGoal(goal: string | null | undefined): string {
    const canonical = canonicalGoal(goal);
    return (canonical && GOAL_CHIP_TONE[canonical]) ?? CHIP_NEUTRAL;
}

export interface TrainingCategoryChip {
    label: string;
    toneClass: string;
}

function chipsFromTagsWithGoal(
    raw: (string | null | undefined)[],
    _goal: string | null | undefined
): TrainingCategoryChip[] {
    const labels = raw
        .map((t) => String(t).trim())
        .filter(Boolean);
    const unique = Array.from(new Set(labels)).slice(0, 6);
    return unique.map((label) => ({ label, toneClass: toneFromGoal(label) }));
}

/** Un chip desde goal: etiqueta traducida, color por objetivo. */
function chipFromGoal(goal: string | null | undefined): TrainingCategoryChip[] {
    const g = goal?.trim() ?? "";
    if (!g) return [];
    const label = GOAL_LABEL_ES[g] ?? g;
    const toneClass = toneFromGoal(goal);
    return [{ label, toneClass }];
}

export function categoryChipsFromTrainingPlan(plan: TrainingPlan): TrainingCategoryChip[] {
    const tags = plan.tags ?? [];
    if (tags.length > 0) {
        return chipsFromTagsWithGoal(tags, plan.goal);
    }
    return chipFromGoal(plan.goal);
}

export function categoryChipsFromTemplate(
    template: TrainingPlanTemplate
): TrainingCategoryChip[] {
    const tags = template.tags ?? [];
    if (tags.length > 0) {
        return chipsFromTagsWithGoal(tags, template.goal);
    }
    return chipFromGoal(template.goal);
}

/**
 * Título en cards/listados: el API a veces añade "(Plantilla)" al nombre.
 */
export function displayTrainingPlanTemplateTitle(name: string): string {
    return name.replace(/\s*\(Plantilla\)/gi, " ").replace(/\s+/g, " ").trim();
}
