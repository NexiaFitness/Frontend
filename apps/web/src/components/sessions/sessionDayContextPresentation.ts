/**
 * sessionDayContextPresentation.ts — View-model puro para "Hoy toca" (B1).
 */

import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type {
    SessionDayRecommendations,
    SessionRecommendationsResponse,
} from "@nexia/shared/types/sessionRecommendations";
import { findBlockContainingDate } from "@/components/trainingPlans/periodization/planningShellUtils";

export const SESSION_DAY_CONTEXT_COPY = {
    title: "Hoy toca",
    subtitle: "Contexto de planificación para esta sesión",
    patternsLabel: "Patrones de movimiento",
    musclesLabel: "Músculos objetivo",
    qualityLabel: "Prioridad de intención",
    mixTitle: "Prioridad relativa del bloque",
    mixHint:
        "Orientación de intención para esta fase. No indica un reparto automático de series, minutos ni ejercicios.",
    volumeLabel: "Volumen",
    intensityLabel: "Intensidad",
    noPlanTitle: "Sin plan activo",
    noPlanBody:
        "Este cliente no tiene un plan de entrenamiento activo para esta fecha. Puedes crear la sesión libremente.",
    planNoPhasesTitle: "Plan sin fases de periodización",
    planNoPhasesBody:
        "El programa está activo, pero aún no has definido ninguna fase. Puedes crear la sesión; añade fases en Planificación para periodizar el entrenamiento.",
    outsidePhaseTitle: "Fuera de fase",
    outsidePhaseBody:
        "Esta fecha no cae dentro de ninguna fase del plan. Puedes crear la sesión; no se asignará un bloque de periodización automáticamente.",
    patternsEmptyConfigured:
        "No hay patrones definidos para este día en la estructura semanal.",
    patternsEmptyFree:
        "Puedes crear la sesión libremente y elegir los ejercicios que necesites.",
    musclesEmpty:
        "Los músculos objetivo aparecerán cuando haya patrones configurados para este día.",
    configureWeekCta: "Configurar estructura de esta semana",
    configureWeekHint:
        "La semana {week} del bloque aún no tiene días de entreno definidos. Configúrala para ver qué toca entrenar.",
    incompleteBlockHint:
        "El bloque tiene {configured} de {total} semanas con estructura definida.",
} as const;

const METRIC_LABEL_CLASS =
    "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80";

export { METRIC_LABEL_CLASS };

export function formatSessionDateLong(isoDate: string): string {
    const d = new Date(isoDate + "T12:00:00");
    return d.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function formatBlockDateRange(
    start?: string | null,
    end?: string | null,
): string | null {
    if (!start || !end) return null;
    const fmt = (iso: string) => {
        const d = new Date(iso + "T12:00:00");
        return d.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };
    return `${fmt(start)} – ${fmt(end)}`;
}

export function resolveQualityLabel(
    slug: string,
    catalog: { slug: string; name: string }[],
): string {
    const found = catalog.find((q) => q.slug === slug);
    if (found?.name) return found.name;
    return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function resolveQualityLabelsFromRecommendation(
    rec: SessionDayRecommendations,
    catalog: { slug: string; name: string }[],
): string {
    const slugs =
        rec.primary_qualities && rec.primary_qualities.length > 0
            ? rec.primary_qualities
            : [rec.physical_quality];
    return slugs.map((slug) => resolveQualityLabel(slug, catalog)).join(" · ");
}

export function isCoPrimaryRecommendation(rec: SessionDayRecommendations): boolean {
    return (
        rec.primary_qualities != null &&
        rec.primary_qualities.length > 1 &&
        rec.primary_quality == null
    );
}

export function buildBlockContextLine(rec: SessionDayRecommendations): string | null {
    const weekLine =
        rec.block_week_ordinal != null &&
        rec.block_week_count != null &&
        rec.block_week_count > 0
            ? `Semana ${rec.block_week_ordinal} de ${rec.block_week_count}`
            : null;
    const dateRange = formatBlockDateRange(
        rec.period_block_start_date,
        rec.period_block_end_date,
    );
    return [rec.period_block_name, dateRange, weekLine].filter(Boolean).join(" · ") || null;
}

export function buildWeeklyStructurePath(
    trainingPlanId: number | null | undefined,
    periodBlockId: number | null | undefined,
    weekOrdinal?: number | null,
): string | null {
    if (!trainingPlanId || !periodBlockId) return null;
    const base = `/dashboard/training-plans/${trainingPlanId}/period-blocks/${periodBlockId}/weekly-structure`;
    if (weekOrdinal != null && weekOrdinal > 0) {
        return `${base}?week=${weekOrdinal}`;
    }
    return base;
}

export interface StructureGapViewModel {
    show: boolean;
    message: string;
    configurePath: string | null;
}

export function buildStructureGapViewModel(
    rec: SessionDayRecommendations,
): StructureGapViewModel {
    const patterns = rec.movement_patterns ?? [];
    const weekOrdinal = rec.block_week_ordinal;
    const configurePath = buildWeeklyStructurePath(
        rec.training_plan_id,
        rec.period_block_id,
        weekOrdinal,
    );

    if (patterns.length > 0) {
        return { show: false, message: "", configurePath };
    }

    if (rec.current_week_has_structure === false && weekOrdinal != null) {
        return {
            show: true,
            message: SESSION_DAY_CONTEXT_COPY.configureWeekHint.replace(
                "{week}",
                String(weekOrdinal),
            ),
            configurePath,
        };
    }

    if (
        rec.has_complete_weekly_structure === false &&
        rec.configured_week_count != null &&
        rec.calendar_week_count != null
    ) {
        return {
            show: true,
            message: SESSION_DAY_CONTEXT_COPY.incompleteBlockHint
                .replace("{configured}", String(rec.configured_week_count))
                .replace("{total}", String(rec.calendar_week_count)),
            configurePath,
        };
    }

    return { show: false, message: "", configurePath };
}

export type SessionDayPhaseEmptyKind = "no_active_plan" | "plan_no_phases" | "outside_phase";

export type SessionDayPhaseContext =
    | { kind: "no_active_plan"; title: string; body: string }
    | { kind: "plan_no_phases"; title: string; body: string }
    | { kind: "outside_phase"; title: string; body: string }
    | { kind: "in_phase"; response: Extract<
          SessionRecommendationsResponse,
          { has_planned_values: true }
      > };

export interface ResolveSessionDayPhaseContextInput {
    response: SessionRecommendationsResponse | undefined;
    sessionDate: string;
    periodBlocks?: readonly PlanPeriodBlock[];
}

/**
 * Ramas G22 (R8): permitir crear + aviso fuerte; sin mezclar «sin fases» y «fuera de bloque».
 */
export function resolveSessionDayPhaseContext(
    input: ResolveSessionDayPhaseContextInput,
): SessionDayPhaseContext | null {
    const { response, sessionDate, periodBlocks = [] } = input;
    if (!response) {
        return null;
    }

    if (!response.has_active_plan) {
        return {
            kind: "no_active_plan",
            title: SESSION_DAY_CONTEXT_COPY.noPlanTitle,
            body: SESSION_DAY_CONTEXT_COPY.noPlanBody,
        };
    }

    if (isSessionRecommendationsWithValues(response)) {
        return { kind: "in_phase", response };
    }

    if (periodBlocks.length === 0) {
        return {
            kind: "plan_no_phases",
            title: SESSION_DAY_CONTEXT_COPY.planNoPhasesTitle,
            body: SESSION_DAY_CONTEXT_COPY.planNoPhasesBody,
        };
    }

    const blockForDate = findBlockContainingDate([...periodBlocks], sessionDate);
    const hasPlannedDay =
        "has_planned_day" in response && response.has_planned_day === true;

    if (!hasPlannedDay || !blockForDate) {
        return {
            kind: "outside_phase",
            title: SESSION_DAY_CONTEXT_COPY.outsidePhaseTitle,
            body: SESSION_DAY_CONTEXT_COPY.outsidePhaseBody,
        };
    }

    return {
        kind: "outside_phase",
        title: SESSION_DAY_CONTEXT_COPY.outsidePhaseTitle,
        body: SESSION_DAY_CONTEXT_COPY.outsidePhaseBody,
    };
}

/** Alerta compacta en constructor (modo programa) — mismas ramas que el panel. */
export function sessionDayPhaseContextToProgramAlert(
    ctx: SessionDayPhaseContext | null,
): { title: string; body: string } | null {
    if (!ctx || ctx.kind === "no_active_plan" || ctx.kind === "in_phase") {
        return null;
    }
    return { title: ctx.title, body: ctx.body };
}

export function isSessionRecommendationsWithValues(
    data: SessionRecommendationsResponse | undefined,
): data is Extract<
    SessionRecommendationsResponse,
    { has_planned_values: true; recommendations: SessionDayRecommendations }
> {
    return Boolean(
        data &&
            data.has_active_plan &&
            "has_planned_values" in data &&
            data.has_planned_values &&
            data.recommendations,
    );
}

export function formatVolumeIntensityScale(
    volumeLevel: number | null | undefined,
    intensityLevel: number | null | undefined,
): string {
    const vol = volumeLevel ?? "—";
    const int = intensityLevel ?? "—";
    return `${vol} / ${int}`;
}
