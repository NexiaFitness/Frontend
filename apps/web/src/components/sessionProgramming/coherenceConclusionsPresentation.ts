/**
 * coherenceConclusionsPresentation.ts — Capa «Explicar» ASP (F4.3b / doc 23 §3).
 *
 * El backend evalúa (CriterionResult + trazas). Este módulo traduce a copy coach-facing.
 * Prohibido pasar criterion.explanation al UI — contiene vocabulario de motor interno.
 *
 * Contrato: docs/planificacion/23_DECISION_PRODUCTO_INTELIGENCIA_CUALIDADES.md §6–§7
 * Copy alineado con docs/planificacion/17_GUIA_PRODUCTO_CUALIDADES_FISICAS_ENTRENADOR.md
 */

import type {
    CoherenceReport,
    CriterionResult,
    CriterionStatus,
    Evaluability,
} from "@nexia/shared/types/coherenceReport";
import type { SessionCoherence } from "@nexia/shared/types/trainingSessions";

export type CoherenceHeroStatus = "ok" | "review" | "limited_data";

export type ConclusionTone = "neutral" | "info" | "caution" | "positive";

export interface CoherenceConclusionViewModel {
    id: string;
    title: string;
    body: string;
    tone: ConclusionTone;
    status: CriterionStatus;
}

export interface CoherenceConclusionsViewModel {
    heroStatus: CoherenceHeroStatus;
    heroLabel: string;
    heroDescription: string;
    phaseContext: string | null;
    visibleConclusions: CoherenceConclusionViewModel[];
    hiddenConclusions: CoherenceConclusionViewModel[];
    hiddenCount: number;
    disclaimer: string;
}

/** Prefijos legacy en `session.notes` — no usar como fuente de inteligencia (doc 23 §9.3 L3). */
export const LEGACY_COHERENCE_NOTE_PREFIXES = [
    "[Avisos de coherencia:",
    "[Coherence Warnings:",
] as const;

/**
 * Extrae notas del entrenador omitiendo bloques legacy de avisos de coherencia.
 * No interpreta el contenido del bloque — solo limpia la visualización.
 */
export function stripLegacyCoherenceFromNotes(
    notes: string | null | undefined,
): string | null {
    if (!notes?.trim()) return null;
    const trimmed = notes.trim();
    for (const prefix of LEGACY_COHERENCE_NOTE_PREFIXES) {
        if (!trimmed.startsWith(prefix)) continue;
        const closeIdx = trimmed.indexOf("]", prefix.length);
        if (closeIdx === -1) return null;
        const after = trimmed.slice(closeIdx + 1).trim();
        return after || null;
    }
    return trimmed;
}

/** Copy compacto L2/L3 — strip y lista (doc 23 §9.3). */
export const COHERENCE_STRIP_COPY = {
    legacyVolIntLabel: "Vol/int del día",
    phaseAlignmentShort: "Alineación fase",
    warningsCount: (count: number) =>
        count === 1 ? "1 aviso" : `${count} avisos`,
    openReviewAria: (label: string, warnings: number) =>
        warnings > 0
            ? `Alineación con la fase: ${label}. ${warnings} avisos. Abrir revisión completa.`
            : `Alineación con la fase: ${label}. Abrir revisión completa.`,
    listChipAria: (label: string, warnings: number) =>
        warnings > 0
            ? `Alineación fase: ${label}, ${warnings} avisos. Abrir revisión.`
            : `Alineación fase: ${label}. Abrir revisión.`,
} as const;

export interface CoherencePhaseChipViewModel {
    heroStatus: CoherenceHeroStatus;
    heroLabel: string;
    warningCount: number;
}

export const COHERENCE_CONCLUSIONS_COPY = {
    panelTitle: "Alineación con la fase",
    panelSubtitle:
        "Señales sobre la prescripción frente a la intención del bloque activo. No bloquea el flujo ni sustituye tu criterio profesional.",
    expandLabel: "Ver detalle",
    collapseLabel: "Ocultar detalle",
    emptyTitle: "Sin evaluación de fase",
    emptyBody:
        "No hay informe de alineación con la fase para esta sesión. Comprueba que la sesión pertenece a un plan con bloque activo.",
    loadingHint: "Analizando alineación con la fase…",
    disclaimer:
        "Estimación de soporte adaptativo; no predice ganancias ni adaptación garantizada.",
} as const;

/** Términos de motor interno — nunca deben aparecer en body coach-facing (tests + guard). */
export const BANNED_COACH_TERMS = [
    "F4.3",
    "F4.4",
    "F4.1b",
    "RHIEE",
    "TSLRE",
    "training_intent",
    "session_prescription",
    "pct_rm",
    "velocity_loss",
    "COHERENCE_SIGNAL",
    "DO_NOT_AUTOMATE",
    "evaluation_binding",
    "automation_status",
    "criterion_id",
    "ExerciseMuscle",
    "sufficiency=",
    "ASP no implementada",
    "L1.",
] as const;

const MAX_VISIBLE_CONCLUSIONS = 3;

const GOVERNANCE_CRITERION_IDS = new Set([
    "automation_do_not_automate",
    "evaluation_context_sufficiency",
]);

const CRITERION_TITLES: Record<string, string> = {
    modality_alignment_l1: "Modalidades e intención",
    strength_prescription_signal_l1: "Prescripción de carga",
    strength_fm_01_structural_signal: "Patrón estructural de fuerza",
    strength_fm_06_multiset: "Series por ejercicio",
    strength_fm_04_effort_proximity: "Esfuerzo planificado (RIR/RPE)",
    strength_fm_05_rest_documented: "Descanso inter-serie",
    strength_hy_01_structural_signal: "Patrón estructural de hipertrofia",
    strength_hy_04_reps_registered: "Repeticiones planificadas",
    strength_hy_02_weekly_volume_mg: "Volumen semanal por grupo muscular",
    anaerobic_prescription_signal_l1: "Resistencia anaeróbica en la sesión",
    aerobic_prescription_signal_l1: "Capacidad aeróbica en la sesión",
    mobility_prescription_signal_l1: "Movilidad en la sesión",
    phase_intent_resolution: "Intención de fase",
};

const HERO_LABELS: Record<CoherenceHeroStatus, string> = {
    ok: "Coherente con la fase",
    review: "Convendría revisar",
    limited_data: "Datos limitados",
};

const HERO_DESCRIPTIONS: Record<CoherenceHeroStatus, string> = {
    ok: "No detectamos desajustes relevantes entre la prescripción y la intención del bloque.",
    review:
        "Hay señales que pueden merecer una segunda mirada. Si es deliberado, puedes continuar.",
    limited_data:
        "Aún no hay datos suficientes para evaluar algunos criterios de la fase.",
};

type BodyContext = {
    qualityLabel: string | null;
};

function slugToDisplayLabel(slug: string): string {
    return slug
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function resolveQualityLabel(
    slug: string | null | undefined,
    catalog?: ReadonlyArray<{ slug: string; name: string }>,
): string | null {
    if (!slug) return null;
    const fromCatalog = catalog?.find((q) => q.slug === slug)?.name;
    return fromCatalog ?? slugToDisplayLabel(slug);
}

function getCriterionTitle(
    criterion: CriterionResult,
    catalog?: ReadonlyArray<{ slug: string; name: string }>,
): string {
    const mapped = CRITERION_TITLES[criterion.criterion_id];
    if (mapped) return mapped;
    const qualityLabel = resolveQualityLabel(criterion.quality_slug, catalog);
    if (qualityLabel) return qualityLabel;
    return slugToDisplayLabel(criterion.criterion_id);
}

function missingPrescription(criterion: CriterionResult): boolean {
    return criterion.missing_inputs.includes("session_prescription");
}

function numericInput(criterion: CriterionResult, key: string): number | null {
    const value = criterion.inputs_used[key];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function unknownInsufficientData(aspect: string): string {
    return `Aún no hay datos suficientes para evaluar ${aspect}.`;
}

function unknownNoExercises(): string {
    return "Esta sesión aún no tiene ejercicios prescritos; no podemos evaluar la alineación con la fase.";
}

function reviewOptional(aspect: string): string {
    return `Hay señales en ${aspect} que convendría revisar. Si es deliberado, puedes continuar.`;
}

const BODY_BY_CRITERION: Record<
    string,
    Partial<Record<CriterionStatus, (criterion: CriterionResult, ctx: BodyContext) => string>>
> = {
    phase_intent_resolution: {
        UNKNOWN: () =>
            "No hay datos suficientes para vincular esta sesión con la intención del bloque (fecha, plan o bloque activo).",
    },
    modality_alignment_l1: {
        UNKNOWN: (c) => {
            if (missingPrescription(c)) return unknownNoExercises();
            if (c.missing_inputs.includes("phase_intent")) {
                return unknownInsufficientData("las cualidades planificadas del bloque");
            }
            if (c.missing_inputs.includes("exercise.training_intent")) {
                return (
                    "Ningún ejercicio tiene intención de entrenamiento declarada en el catálogo. " +
                    "Sin ese dato no podemos comparar modalidades con la fase."
                );
            }
            return unknownInsufficientData("la alineación de modalidades");
        },
        PARTIAL: (c) => {
            const mismatch = numericInput(c, "mismatch_count");
            const total = numericInput(c, "total_with_intent");
            if (mismatch != null && total != null && total > 0) {
                return (
                    `En esta sesión, ${mismatch} de ${total} ejercicios con intención declarada ` +
                    "quedan fuera de las modalidades prioritarias de la fase. " +
                    "Si es deliberado, puedes continuar; si no, conviene revisar la selección."
                );
            }
            return reviewOptional("las modalidades de los ejercicios");
        },
        PASS: (c) => {
            const total = numericInput(c, "total_with_intent");
            const mismatch = numericInput(c, "mismatch_count");
            if (total != null && mismatch != null) {
                const aligned = total - mismatch;
                return (
                    `La mayoría de ejercicios con intención declarada (${aligned}/${total}) ` +
                    "coincide con las modalidades prioritarias de la fase."
                );
            }
            return "Los ejercicios con intención declarada encajan con las modalidades prioritarias de la fase.";
        },
    },
    strength_fm_01_structural_signal: {
        UNKNOWN: (c) =>
            missingPrescription(c)
                ? unknownNoExercises()
                : unknownInsufficientData(
                      "el patrón estructural de fuerza (series y carga planificadas)",
                  ),
        NOT_MET: () =>
            "Ningún ejercicio cumple un patrón estructural típico de fuerza (al menos 2 series con carga identificable). " +
            "Una sola serie o solo peso corporal no activan esta señal; no implica error si es tu decisión.",
        PASS: () =>
            "Al menos un ejercicio muestra un patrón estructural coherente con fuerza (series múltiples con carga identificable).",
    },
    strength_hy_01_structural_signal: {
        UNKNOWN: (c) =>
            missingPrescription(c)
                ? unknownNoExercises()
                : unknownInsufficientData(
                      "el patrón estructural de hipertrofia (series y carga planificadas)",
                  ),
        NOT_MET: () =>
            "Ningún ejercicio cumple un patrón estructural típico de hipertrofia (al menos 2 series con carga identificable). " +
            "Una sola serie no activa esta señal; no implica error si es tu decisión.",
        PASS: () =>
            "Al menos un ejercicio muestra un patrón estructural coherente con hipertrofia.",
    },
    strength_fm_06_multiset: {
        UNKNOWN: (c) =>
            missingPrescription(c)
                ? unknownNoExercises()
                : unknownInsufficientData("las series planificadas por ejercicio"),
        NOT_MET: () =>
            "Todos los ejercicios evaluables tienen una sola serie planificada. " +
            "El trabajo multi-serie suele favorecer resultados; una serie no implica incoherencia demostrada.",
        PASS: () =>
            "Al menos un ejercicio tiene varias series planificadas, señal habitual en programación de fuerza.",
    },
    strength_fm_04_effort_proximity: {
        UNKNOWN: (c) =>
            missingPrescription(c)
                ? unknownNoExercises()
                : "Sin esfuerzo planificado registrado (RIR o RPE con valor) en los ejercicios evaluables.",
        NOT_MET: () =>
            "El esfuerzo planificado registrado queda lejos de una zona de alta proximidad al fallo (RIR bajo o RPE alto). " +
            "Si buscas otra zona de trabajo, puedes ignorarlo.",
        PASS: () =>
            "Al menos un ejercicio tiene esfuerzo planificado en una zona de proximidad suficiente (RIR o RPE registrados).",
    },
    strength_fm_05_rest_documented: {
        UNKNOWN: (c) =>
            missingPrescription(c)
                ? unknownNoExercises()
                : "Ningún ejercicio tiene descanso inter-serie planificado documentado.",
        PASS: (c) => {
            const count = numericInput(c, "documented_count");
            if (count != null && count > 0) {
                return (
                    `Descanso inter-serie planificado registrado en ${count} ejercicio(s). ` +
                    "Dato informativo; no determina la coherencia por sí solo."
                );
            }
            return "Hay descanso inter-serie planificado documentado en la sesión.";
        },
    },
    strength_prescription_signal_l1: {
        UNKNOWN: (c) =>
            missingPrescription(c) || numericInput(c, "exercise_count") === 0
                ? unknownNoExercises()
                : "La prescripción aún no incluye series con carga planificada suficiente para evaluar soporte de fuerza.",
        PARTIAL: () =>
            "La prescripción incluye series con carga planificada; hay señal mínima de soporte de fuerza en la sesión.",
    },
    strength_hy_04_reps_registered: {
        UNKNOWN: (c) =>
            missingPrescription(c)
                ? unknownNoExercises()
                : "No hay repeticiones planificadas registradas en los ejercicios evaluables.",
        PASS: (c) => {
            const count = numericInput(c, "registered_exercises");
            if (count != null && count > 0) {
                return (
                    `Repeticiones planificadas registradas en ${count} ejercicio(s). ` +
                    "Solo indica disponibilidad del dato; no evalúa rangos ni progresión."
                );
            }
            return "Hay repeticiones planificadas registradas en al menos un ejercicio.";
        },
    },
    strength_hy_02_weekly_volume_mg: {
        UNKNOWN: (c) => {
            if (c.missing_inputs.includes("session_date")) {
                return "Sin fecha de sesión no podemos calcular el volumen semanal planificado.";
            }
            return unknownInsufficientData("el volumen semanal planificado por grupo muscular");
        },
    },
    anaerobic_prescription_signal_l1: {
        UNKNOWN: (_c, ctx) => {
            const label = ctx.qualityLabel ?? "resistencia anaeróbica";
            return (
                `NEXIA registra tu énfasis en ${label}, pero aún no evalúa automáticamente la prescripción anaeróbica ` +
                "sin un protocolo o contexto de tarea vinculado. Puedes continuar; la intención queda registrada."
            );
        },
    },
    aerobic_prescription_signal_l1: {
        UNKNOWN: () =>
            "NEXIA aún no evalúa automáticamente la prescripción aeróbica (zonas, ritmo o frecuencia cardíaca individualizada). " +
            "Puedes continuar programando; la intención de fase queda registrada.",
    },
    mobility_prescription_signal_l1: {
        UNKNOWN: () =>
            "NEXIA aún no evalúa automáticamente la prescripción de movilidad (rango articular, articulación o test específico). " +
            "Puedes continuar; la intención de fase queda registrada.",
    },
};

function genericBody(criterion: CriterionResult): string {
    switch (criterion.status) {
        case "PASS":
            return "No detectamos desajustes relevantes en este aspecto.";
        case "NOT_MET":
        case "PARTIAL":
        case "FAIL":
            return reviewOptional("este aspecto de la prescripción");
        case "UNKNOWN":
        default:
            return missingPrescription(criterion)
                ? unknownNoExercises()
                : unknownInsufficientData("este aspecto de la fase");
    }
}

/**
 * Traduce un CriterionResult del backend a prosa coach-facing.
 * Nunca usa criterion.explanation.
 */
export function formatCoherenceConclusionBody(
    criterion: CriterionResult,
    catalog?: ReadonlyArray<{ slug: string; name: string }>,
): string {
    const ctx: BodyContext = {
        qualityLabel: resolveQualityLabel(criterion.quality_slug, catalog),
    };

    const byStatus = BODY_BY_CRITERION[criterion.criterion_id];
    const resolver = byStatus?.[criterion.status];
    const body = resolver ? resolver(criterion, ctx) : genericBody(criterion);

    return body.trim();
}

export function containsBannedCoachTerm(text: string): boolean {
    return BANNED_COACH_TERMS.some((term) => text.includes(term));
}

function conclusionTone(status: CriterionStatus): ConclusionTone {
    switch (status) {
        case "PASS":
            return "positive";
        case "NOT_MET":
        case "FAIL":
        case "PARTIAL":
            return "caution";
        case "UNKNOWN":
        default:
            return "neutral";
    }
}

function criterionPriority(criterion: CriterionResult): number {
    switch (criterion.status) {
        case "FAIL":
            return 500;
        case "NOT_MET":
            return 450;
        case "PARTIAL":
            return 400;
        case "PASS":
            return 200;
        case "UNKNOWN":
        default:
            return missingPrescription(criterion) ? 50 : 100;
    }
}

export function isCoachFacingCriterion(criterion: CriterionResult): boolean {
    if (GOVERNANCE_CRITERION_IDS.has(criterion.criterion_id)) {
        return false;
    }
    if (
        criterion.automation_status === "DO_NOT_AUTOMATE" &&
        criterion.criterion_id.endsWith("_signal_l1") === false &&
        criterion.criterion_id !== "modality_alignment_l1"
    ) {
        return false;
    }
    return true;
}

function buildPhaseContext(
    report: CoherenceReport,
    catalog?: ReadonlyArray<{ slug: string; name: string }>,
): string | null {
    const qualities = report.phase_intent.primary_qualities.filter(Boolean);
    if (qualities.length < 2) return null;

    const labels = qualities.map((slug) => resolveQualityLabel(slug, catalog) ?? slug);
    return `En esta fase compartes prioridad entre ${labels.join(" y ")}. Las señales se evalúan en ese contexto.`;
}

function deriveHeroStatus(
    evaluability: Evaluability,
    criteria: CriterionResult[],
): CoherenceHeroStatus {
    const actionable = criteria.filter(isCoachFacingCriterion);
    const hasMismatch = actionable.some(
        (c) => c.status === "NOT_MET" || c.status === "PARTIAL" || c.status === "FAIL",
    );

    if (hasMismatch) return "review";
    if (evaluability === "UNKNOWN") return "limited_data";
    return "ok";
}

function toConclusionViewModel(
    criterion: CriterionResult,
    catalog?: ReadonlyArray<{ slug: string; name: string }>,
): CoherenceConclusionViewModel {
    return {
        id: criterion.criterion_id,
        title: getCriterionTitle(criterion, catalog),
        body: formatCoherenceConclusionBody(criterion, catalog),
        tone: conclusionTone(criterion.status),
        status: criterion.status,
    };
}

/**
 * Indicador compacto L2 para detalle de sesión.
 * Sin prosa de criterios — solo estado + contador de avisos legacy.
 */
export function buildCoherencePhaseChipViewModel(
    coherence: SessionCoherence | null | undefined,
    catalog?: ReadonlyArray<{ slug: string; name: string }>,
): CoherencePhaseChipViewModel | null {
    if (!coherence) return null;

    const warningCount = coherence.coherence_warnings?.length ?? 0;

    if (coherence.coherence_report) {
        const conclusions = buildCoherenceConclusionsViewModel(
            coherence.coherence_report,
            catalog,
        );
        if (!conclusions) return null;
        return {
            heroStatus: conclusions.heroStatus,
            heroLabel: conclusions.heroLabel,
            warningCount,
        };
    }

    if (warningCount === 0) return null;

    return {
        heroStatus: "review",
        heroLabel: HERO_LABELS.review,
        warningCount,
    };
}

export function buildCoherenceConclusionsViewModel(
    report: CoherenceReport | null | undefined,
    catalog?: ReadonlyArray<{ slug: string; name: string }>,
): CoherenceConclusionsViewModel | null {
    if (!report) return null;

    const coachFacing = report.criterion_results
        .filter(isCoachFacingCriterion)
        .slice()
        .sort((a, b) => criterionPriority(b) - criterionPriority(a))
        .map((c) => toConclusionViewModel(c, catalog));

    const heroStatus = deriveHeroStatus(report.asp_profile.evaluability, report.criterion_results);

    const visibleConclusions = coachFacing.slice(0, MAX_VISIBLE_CONCLUSIONS);
    const hiddenConclusions = coachFacing.slice(MAX_VISIBLE_CONCLUSIONS);

    return {
        heroStatus,
        heroLabel: HERO_LABELS[heroStatus],
        heroDescription: HERO_DESCRIPTIONS[heroStatus],
        phaseContext: buildPhaseContext(report, catalog),
        visibleConclusions,
        hiddenConclusions,
        hiddenCount: hiddenConclusions.length,
        disclaimer: COHERENCE_CONCLUSIONS_COPY.disclaimer,
    };
}

export function heroStatusBadgeClasses(status: CoherenceHeroStatus): string {
    switch (status) {
        case "ok":
            return "border-success/30 bg-success/10 text-success";
        case "review":
            return "border-warning/30 bg-warning/10 text-warning";
        case "limited_data":
        default:
            return "border-primary/30 bg-primary/10 text-primary";
    }
}

export function conclusionToneClasses(tone: ConclusionTone): {
    container: string;
    icon: string;
} {
    switch (tone) {
        case "positive":
            return {
                container: "border-success/25 bg-success/5",
                icon: "text-success",
            };
        case "caution":
            return {
                container: "border-warning/25 bg-warning/5",
                icon: "text-warning",
            };
        case "info":
            return {
                container: "border-primary/25 bg-primary/5",
                icon: "text-primary",
            };
        case "neutral":
        default:
            return {
                container: "border-border/60 bg-muted/20",
                icon: "text-muted-foreground",
            };
    }
}
