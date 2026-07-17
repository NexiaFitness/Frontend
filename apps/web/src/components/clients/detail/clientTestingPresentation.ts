/**
 * clientTestingPresentation — Copy + tokens premium tab Tests (Spec 01).
 *
 * Doc: docs/design/00_LEEME_PRIMERO.md · ref: exercisesLibraryPresentation.ts
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";
import {
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    ATHLETE_EMPTY_STATE_ACTION,
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    ATHLETE_EMPTY_STATE_GLOW,
    ATHLETE_EMPTY_STATE_TITLE,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";
import type { TestCategory } from "@nexia/shared/types/testing";

export {
    PLATFORM_PAGE_HEADER as TESTING_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as TESTING_PAGE_TITLE_WRAP,
};

/** Categorías con fuerza al final (E-01). */
export const TEST_CATEGORY_ORDER: TestCategory[] = [
    "mobility",
    "power",
    "speed",
    "aerobic",
    "anaerobic",
    "strength",
];

export const TESTING_TAB_TITLE = "Evaluaciones físicas";

export const TESTING_TAB_SUBTITLE =
    "Protocolos planificados: movilidad, potencia, velocidad y resistencia.";

export const TESTING_CTA_REGISTER = "Registrar evaluación";

export const TESTING_CTA_RETEST = "Retestar";

export const TESTING_EDIT_MODAL_TITLE = "Editar evaluación";

export const TESTING_HISTORY_MODAL_TITLE = "Historial de evaluaciones";

export const TESTING_DELETE_MODAL_TITLE = "¿Eliminar esta evaluación?";

export const TESTING_DELETE_MODAL_DESCRIPTION =
    "Se borrará el registro de forma permanente. La progresión y el insight se recalcularán.";

export const TESTING_EDIT_SUCCESS = "Evaluación actualizada.";

export const TESTING_DELETE_SUCCESS = "Evaluación eliminada.";

export const TESTING_BASELINE_BADGE = "Línea base";

export const TESTING_STRENGTH_PILL_TITLE =
    "Para marcas de gym y PRs, usa Rendimiento gym.";

export const TESTING_EMPTY_TITLE = (categoryLabel: string) =>
    `Sin evaluaciones en ${categoryLabel.toLowerCase()}`;

export const TESTING_EMPTY_DESCRIPTION =
    "Registra una evaluación para ver progresión y perfil.";

export const TESTING_UPCOMING_TITLE = "Evaluaciones pendientes de retest";

export const TESTING_UPCOMING_CTA = "Registrar retest";

export const TESTING_BILATERAL_TITLE = "Comparación bilateral (movilidad)";

export const TESTING_BILATERAL_ASYMMETRY_BADGE = "Asimetría";

export const TESTING_ASYMMETRY_THRESHOLD_PCT = 15;

export const TESTING_AI_INSIGHT_STALE_PROMPT =
    "Hay evaluaciones nuevas desde el último insight.";

export const TESTING_AI_INSIGHT_UPDATE = "Actualizar insight";

export const TESTING_AI_INSIGHT_LOADING = "Preparando insight…";

export const TESTING_AI_INSIGHT_GENERATING = "Actualizando insight…";

export const TESTING_AI_INSIGHT_ERROR = "No se pudo generar el insight.";

export const TESTING_AI_INSIGHT_TITLE = "Insight del entrenador";

export const TESTING_AI_SOURCE_LABEL: Record<
    "llm" | "cache" | "deterministic",
    string
> = {
    llm: "Generado con IA",
    cache: "Desde caché",
    deterministic: "Análisis automático",
};

export const TESTING_TAB_SHELL = cn("relative space-y-6 pb-24 lg:space-y-8");

export const TESTING_TAB_GLOW =
    "pointer-events-none absolute inset-x-0 -top-4 h-40 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_72%)]";

export const TESTING_UPCOMING_BANNER = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative border-warning/30 bg-warning/5 p-4 space-y-3"
);

export const TESTING_INSIGHT_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative p-4 sm:p-5"
);

/** Filtros categoría — mismo patrón que Lesiones / Sesiones (sin colores por categoría). */
export const TESTING_CATEGORY_PILLS = "flex flex-wrap gap-1.5";

export const TESTING_CATEGORY_PILL = cn(
    "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
);

export const TESTING_CATEGORY_PILL_ACTIVE =
    "border-primary bg-primary/10 text-primary";

export const TESTING_CATEGORY_PILL_INACTIVE = cn(
    "border-border text-muted-foreground",
    "hover:border-input hover:text-foreground"
);

export const TESTING_RESULTS_GRID = cn(
    "grid grid-cols-1 gap-4",
    "sm:grid-cols-2 sm:gap-5",
    "lg:grid-cols-3 lg:gap-6"
);

/** Paridad EXERCISES_LIBRARY_CARD — glass, sin borde lateral de color. */
export const TESTING_RESULT_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex h-full flex-col p-5 text-left transition-all",
    "hover:bg-surface-2/30"
);

export const TESTING_RESULT_CARD_HEADER = "mb-2 flex items-start justify-between gap-2";

export const TESTING_RESULT_CARD_TITLE =
    "text-sm font-bold text-foreground line-clamp-2";

export const TESTING_RESULT_CARD_ACTIONS = "flex shrink-0 items-center gap-0.5";

export const TESTING_RESULT_ICON_BTN = cn(
    "rounded-md p-1.5 text-muted-foreground transition-colors",
    "hover:bg-accent hover:text-primary"
);

export const TESTING_RESULT_ICON_BTN_DANGER = cn(
    TESTING_RESULT_ICON_BTN,
    "hover:text-destructive"
);

export const TESTING_RESULT_VALUE_ROW = "mt-3 flex items-baseline gap-1.5";

export const TESTING_RESULT_VALUE = "text-2xl font-semibold tracking-tight text-foreground";

export const TESTING_RESULT_UNIT = "text-sm font-medium text-muted-foreground";

export const TESTING_RESULT_META = "mt-2 text-xs text-muted-foreground";

export const TESTING_RESULT_BADGE_ROW = "mt-2 flex flex-wrap gap-1.5";

export const TESTING_BASELINE_CHIP =
    "border-border bg-muted/30 text-[10px] font-medium text-muted-foreground";

export const TESTING_SECTION_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative p-5 sm:p-6"
);

export const TESTING_EMPTY_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex flex-col items-center px-5 py-10 text-center sm:py-12"
);

export const TESTING_EMPTY_GLOW = ATHLETE_EMPTY_STATE_GLOW;

export const TESTING_EMPTY_TITLE_CLASS = ATHLETE_EMPTY_STATE_TITLE;

export const TESTING_EMPTY_DESCRIPTION_CLASS = ATHLETE_EMPTY_STATE_DESCRIPTION;

export const TESTING_EMPTY_ACTION_CLASS = ATHLETE_EMPTY_STATE_ACTION;

export const TESTING_HISTORY_ROW = cn(
    "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/80",
    "bg-surface/40 px-4 py-3 transition-colors hover:border-primary/25 hover:bg-surface-2/40"
);

export function formatTestingDate(value: string): string {
    return new Date(value).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export function asymmetryPercent(
    left: number | null | undefined,
    right: number | null | undefined,
): number | null {
    if (left == null || right == null) return null;
    const max = Math.max(Math.abs(left), Math.abs(right));
    if (max === 0) return 0;
    return (Math.abs(left - right) / max) * 100;
}

/** Chip progreso vs baseline — semántica design system (como injuryPresentation). */
export function testingProgressChipClass(progress: number): string {
    const base =
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium";
    if (progress > 0) return `${base} border-success/30 bg-success/10 text-success`;
    if (progress < 0) return `${base} border-destructive/30 bg-destructive/10 text-destructive`;
    return `${base} border-border bg-muted/20 text-muted-foreground`;
}

/** Segundos → min:seg para inputs de edición (unidad s/seg). */
export function formatSecondsForTimeInput(totalSeconds: number): string {
    const rounded = Math.round(totalSeconds * 100) / 100;
    const wholeSecs = Math.floor(rounded);
    const mins = Math.floor(wholeSecs / 60);
    const secs = wholeSecs % 60;
    const frac = rounded - wholeSecs;
    const secStr =
        frac > 0
            ? String(Math.round(rounded * 10) / 10).replace(/^0+/, "")
            : String(secs).padStart(2, "0");
    if (mins === 0) {
        return frac > 0 ? String(rounded) : `0:${secStr}`;
    }
    return `${mins}:${String(secs).padStart(2, "0")}`;
}
