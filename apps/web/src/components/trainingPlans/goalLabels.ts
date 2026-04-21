/**
 * Etiquetas ES y chips de categoría para planes y plantillas.
 * El color viene de `goal` (canónico del backend snake_case); tags solo aportan etiquetas de display.
 * 
 * @updated v7.0.0 - Actualizado a snake_case (8 valores) para alinearse con TrainingGoalEnum
 */

import {
    TRAINING_PLAN_GOAL,
    type TrainingPlan,
    type TrainingPlanTemplate,
} from "@nexia/shared/types/training";

/**
 * Labels en español para cada valor de goal (snake_case)
 */
export const GOAL_LABEL_ES: Record<string, string> = {
    // snake_case keys (nuevo estándar backend)
    hypertrophy: "Hipertrofia",
    strength: "Fuerza",
    power: "Potencia",
    endurance: "Resistencia",
    weight_loss: "Pérdida de peso",
    general_fitness: "Fitness general",
    rehabilitation: "Rehabilitación",
    sport_performance: "Rendimiento deportivo",
    // Legacy keys (para compatibilidad)
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
    [TRAINING_PLAN_GOAL.HYPERTROPHY]: "bg-primary/15 text-primary", // Hipertrofia: crecimiento, construcción
    [TRAINING_PLAN_GOAL.WEIGHT_LOSS]: "bg-warning/10 text-warning", // Pérdida de peso: quemar, déficit
    [TRAINING_PLAN_GOAL.STRENGTH]: "bg-red-600/20 text-red-400", // Fuerza: rojo
    [TRAINING_PLAN_GOAL.POWER]: "bg-purple-600/20 text-purple-400", // Potencia: púrpura
    [TRAINING_PLAN_GOAL.ENDURANCE]: "bg-primary/10 text-primary", // Resistencia: aliento, esfuerzo sostenido
    [TRAINING_PLAN_GOAL.GENERAL_FITNESS]: "bg-success/12 text-success", // Mantenimiento: verde
    [TRAINING_PLAN_GOAL.REHABILITATION]: "bg-orange-700/25 text-orange-400", // Rehabilitación: naranja oscuro
    [TRAINING_PLAN_GOAL.SPORT_PERFORMANCE]: "bg-violet-600/20 text-violet-400", // Rendimiento: granate morado
};

/**
 * Mapeo de variantes de texto a goal canónico snake_case
 */
const GOAL_TO_CANONICAL: Record<string, string> = {
    // snake_case (ya canónicos)
    hypertrophy: TRAINING_PLAN_GOAL.HYPERTROPHY,
    strength: TRAINING_PLAN_GOAL.STRENGTH,
    power: TRAINING_PLAN_GOAL.POWER,
    endurance: TRAINING_PLAN_GOAL.ENDURANCE,
    weight_loss: TRAINING_PLAN_GOAL.WEIGHT_LOSS,
    rehabilitation: TRAINING_PLAN_GOAL.REHABILITATION,
    general_fitness: TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    sport_performance: TRAINING_PLAN_GOAL.SPORT_PERFORMANCE,
    // Variantes en español
    hipertrofia: TRAINING_PLAN_GOAL.HYPERTROPHY,
    Hipertrofia: TRAINING_PLAN_GOAL.HYPERTROPHY,
    "Aumentar masa muscular": TRAINING_PLAN_GOAL.HYPERTROPHY,
    fuerza: TRAINING_PLAN_GOAL.STRENGTH,
    Fuerza: TRAINING_PLAN_GOAL.STRENGTH,
    potencia: TRAINING_PLAN_GOAL.POWER,
    Potencia: TRAINING_PLAN_GOAL.POWER,
    resistencia: TRAINING_PLAN_GOAL.ENDURANCE,
    Resistencia: TRAINING_PLAN_GOAL.ENDURANCE,
    "pérdida de peso": TRAINING_PLAN_GOAL.WEIGHT_LOSS,
    "Pérdida de peso": TRAINING_PLAN_GOAL.WEIGHT_LOSS,
    "Perdida de peso": TRAINING_PLAN_GOAL.WEIGHT_LOSS,
    mantenimiento: TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    Mantenimiento: TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    Mantenimento: TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    mantenimento: TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    "fitness general": TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    "Fitness general": TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    rehabilitacion: TRAINING_PLAN_GOAL.REHABILITATION,
    rehabilitación: TRAINING_PLAN_GOAL.REHABILITATION,
    Rehabilitación: TRAINING_PLAN_GOAL.REHABILITATION,
    rendimiento: TRAINING_PLAN_GOAL.SPORT_PERFORMANCE,
    Rendimiento: TRAINING_PLAN_GOAL.SPORT_PERFORMANCE,
    "rendimiento deportivo": TRAINING_PLAN_GOAL.SPORT_PERFORMANCE,
    "Rendimiento deportivo": TRAINING_PLAN_GOAL.SPORT_PERFORMANCE,
    // Legacy Title Case (para compatibilidad)
    "Muscle Gain": TRAINING_PLAN_GOAL.HYPERTROPHY,
    "Weight Loss": TRAINING_PLAN_GOAL.WEIGHT_LOSS,
    Strength: TRAINING_PLAN_GOAL.STRENGTH,
    Endurance: TRAINING_PLAN_GOAL.ENDURANCE,
    "General Fitness": TRAINING_PLAN_GOAL.GENERAL_FITNESS,
    Rehabilitation: TRAINING_PLAN_GOAL.REHABILITATION,
    Performance: TRAINING_PLAN_GOAL.SPORT_PERFORMANCE,
};

function canonicalGoal(goal: string | null | undefined): string {
    const g = goal?.trim() ?? "";
    return GOAL_TO_CANONICAL[g] ?? g;
}

export function toneFromGoal(goal: string | null | undefined): string {
    const canonical = canonicalGoal(goal);
    return (canonical && GOAL_CHIP_TONE[canonical]) ?? CHIP_NEUTRAL;
}

export function chipFromGoal(goal: string | null | undefined): TrainingCategoryChip[] {
    const g = goal?.trim() ?? "";
    if (!g) return [];
    const label = GOAL_LABEL_ES[g] ?? GOAL_LABEL_ES[canonicalGoal(g)] ?? g;
    const toneClass = toneFromGoal(goal);
    return [{ label, toneClass }];
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
