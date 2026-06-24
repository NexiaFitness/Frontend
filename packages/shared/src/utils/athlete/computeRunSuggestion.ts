/**
 * computeRunSuggestion — Motor sugerencia carga v2 (SUGERENCIA_CARGA.md §6).
 */

import type {
    AthleteRunSuggestion,
    AthleteRunSuggestionAction,
    AthleteRunSuggestionConfidence,
    AthleteRunSuggestionContext,
    AthleteRunSuggestionReference,
} from "../../types/athleteRunSuggestion";

const DEFAULT_LOAD_STEP_KG = 2.5;

export function resolvePrescribedRpe(ctx: AthleteRunSuggestionContext): number | null {
    if (ctx.prescribed_rpe != null) {
        return ctx.prescribed_rpe;
    }
    if (ctx.prescribed_rir != null) {
        return Math.max(1, Math.min(10, 10 - ctx.prescribed_rir));
    }
    return null;
}

export function mapRpeDelta(deltaRpe: number): AthleteRunSuggestionAction {
    if (deltaRpe <= -1) return "increase";
    if (deltaRpe >= 1) return "decrease";
    return "maintain";
}

export function exposureToConfidence(
    exposureCount: number,
    hasRpe: boolean
): AthleteRunSuggestionConfidence {
    if (exposureCount <= 0) return "none";
    if (exposureCount < 3) return "low";
    if (exposureCount < 6) return "medium";
    if (hasRpe || exposureCount >= 6) return "high";
    return "medium";
}

export function roundToLoadStep(value: number, step: number): number {
    if (step <= 0) return value;
    const rounded = Math.round(value / step) * step;
    return Math.round(rounded * 1000) / 1000;
}

function isDropsetDropSlot(ctx: AthleteRunSuggestionContext): boolean {
    if (ctx.group_kind !== "dropset" && ctx.lookup_key.group_kind !== "dropset") {
        return false;
    }
    const label = (ctx.slot_label ?? ctx.lookup_key.slot_label ?? "").toUpperCase();
    return label.startsWith("DROP");
}

function buildBasisLabel(ref: AthleteRunSuggestionReference): string {
    if (ref.basis_label) return ref.basis_label;
    const parts: string[] = [];
    if (ref.weight_kg != null) parts.push(`${ref.weight_kg} kg`);
    if (ref.reps != null) parts.push(`× ${ref.reps}`);
    if (ref.rpe != null) parts.push(`@ RPE ${ref.rpe}`);
    return parts.join(" ") || "Referencia";
}

function buildWeightExplanation(
    ctx: AthleteRunSuggestionContext,
    action: AthleteRunSuggestionAction,
    prescribedTarget: number | null,
    ref: AthleteRunSuggestionReference
): string {
    const basis = buildBasisLabel(ref);
    const prefix = `Basado en ${basis}.`;

    if (prescribedTarget != null && ref.rpe != null) {
        if (action === "increase") {
            return `${prefix} RPE ${ref.rpe} vs objetivo ${prescribedTarget} → prueba +${ctx.load_step_kg ?? DEFAULT_LOAD_STEP_KG} kg.`;
        }
        if (action === "decrease") {
            return `${prefix} RPE ${ref.rpe} vs objetivo ${prescribedTarget} → prueba −${ctx.load_step_kg ?? DEFAULT_LOAD_STEP_KG} kg.`;
        }
        return `${prefix} RPE acorde al objetivo → mantén la carga.`;
    }

    if (action === "increase") {
        return `${prefix} Alcanzaste el rango de reps → sube carga.`;
    }
    if (action === "decrease") {
        return `${prefix} Reduce carga para cumplir el objetivo.`;
    }
    return `${prefix} Mantén la carga. Registra RPE para afinar la sugerencia.`;
}

function resolveDoubleProgressionAction(
    ref: AthleteRunSuggestionReference,
    ctx: AthleteRunSuggestionContext
): AthleteRunSuggestionAction {
    if (ref.reps == null) return "maintain";
    const targetMax = ctx.prescribed_reps_max ?? ctx.prescribed_reps;
    if (targetMax == null) return "maintain";
    return ref.reps >= targetMax ? "increase" : "maintain";
}

function buildMaintainSuggestion(
    ctx: AthleteRunSuggestionContext,
    ref: AthleteRunSuggestionReference,
    confidence: AthleteRunSuggestionConfidence,
    explanation: string
): AthleteRunSuggestion {
    const weight = ref.weight_kg ?? 0;
    return {
        metric: "weight_kg",
        suggested_value: weight,
        reference_value: weight,
        delta: 0,
        action: "maintain",
        confidence,
        exposure_count: ctx.exposure_count,
        explanation,
        basis_label: buildBasisLabel(ref),
        show_card: false,
    };
}

function computeTimedSuggestion(ctx: AthleteRunSuggestionContext): AthleteRunSuggestion | null {
    const ref = ctx.reference;
    if (!ref) return null;

    const rounds = ref.rounds_completed ?? 0;
    return {
        metric: "rounds",
        suggested_value: rounds,
        reference_value: rounds,
        delta: 0,
        action: "maintain",
        confidence: exposureToConfidence(ctx.exposure_count, ref.rpe != null),
        exposure_count: ctx.exposure_count,
        explanation: "Mantén el ritmo de la referencia; la mejor marca está en la tarjeta PR.",
        basis_label: buildBasisLabel(ref),
        show_card: false,
    };
}

export function computeRunSuggestion(
    ctx: AthleteRunSuggestionContext
): AthleteRunSuggestion | null {
    const ref = ctx.reference;
    if (!ref) return null;

    const step = ctx.load_step_kg ?? DEFAULT_LOAD_STEP_KG;
    const basisLabel = buildBasisLabel(ref);

    if (ctx.exposure_count < 3) {
        return buildMaintainSuggestion(
            ctx,
            ref,
            "low",
            `${basisLabel ? `Basado en ${basisLabel}. ` : ""}Repite tu última carga registrada.`
        );
    }

    if (ctx.input_mode === "rounds_only" || ctx.input_mode === "timed_score") {
        return computeTimedSuggestion(ctx);
    }

    const prescribedTarget = resolvePrescribedRpe(ctx);
    let action: AthleteRunSuggestionAction = "maintain";

    if (ref.rpe != null && prescribedTarget != null) {
        action = mapRpeDelta(ref.rpe - prescribedTarget);
    } else if (ref.reps != null && (ctx.prescribed_reps != null || ctx.prescribed_reps_max != null)) {
        action = resolveDoubleProgressionAction(ref, ctx);
    }

    if (isDropsetDropSlot(ctx) && action === "increase") {
        action = "maintain";
    }

    let suggested = ref.weight_kg ?? 0;
    if (action === "increase") {
        suggested = suggested + step;
        const maxAllowed = (ref.weight_kg ?? 0) + step;
        suggested = Math.min(suggested, maxAllowed);
    } else if (action === "decrease") {
        suggested = Math.max(0, suggested - step);
    }

    suggested = roundToLoadStep(suggested, step);
    const referenceValue = ref.weight_kg ?? 0;
    const confidence = exposureToConfidence(ctx.exposure_count, ref.rpe != null);
    const explanation = buildWeightExplanation(ctx, action, prescribedTarget, ref);
    const delta = roundToLoadStep(suggested - referenceValue, step);
    const showCard =
        (confidence === "medium" || confidence === "high") && Math.abs(delta) >= 0.001;

    return {
        metric: "weight_kg",
        suggested_value: suggested,
        reference_value: referenceValue,
        delta,
        action,
        confidence,
        exposure_count: ctx.exposure_count,
        explanation,
        basis_label: basisLabel,
        show_card: showCard,
    };
}
