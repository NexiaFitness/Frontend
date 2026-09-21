/**
 * standaloneSessionFeedbackPresentation.ts — Copy y layout G20 (feedback cliente, sesión libre).
 */

import type { StandaloneSessionFeedbackOut } from "@nexia/shared/types/standaloneSessions";
import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export const STANDALONE_FEEDBACK_PANEL_SHELL = cn(
    NEXIA_GLASS_CARD,
    "relative space-y-4 p-4 pt-5",
);

export const STANDALONE_FEEDBACK_TITLE = "text-lg font-semibold text-foreground";

export const STANDALONE_FEEDBACK_SUBTITLE = "text-sm text-muted-foreground";

export const STANDALONE_FEEDBACK_EMPTY =
    "El cliente aún no ha enviado feedback para esta sesión libre.";

export const STANDALONE_FEEDBACK_ERROR =
    "No se pudo cargar el feedback del cliente. Inténtalo de nuevo.";

export const STANDALONE_FEEDBACK_DATE_LABEL = "Registrado";

export const STANDALONE_FEEDBACK_SCALE_LABELS: Record<
    keyof Pick<
        StandaloneSessionFeedbackOut,
        | "perceived_effort"
        | "fatigue_level"
        | "sleep_quality"
        | "stress_level"
        | "motivation_level"
        | "energy_level"
    >,
    string
> = {
    perceived_effort: "Esfuerzo percibido",
    fatigue_level: "Fatiga",
    sleep_quality: "Calidad del sueño",
    stress_level: "Estrés",
    motivation_level: "Motivación",
    energy_level: "Energía",
};

export interface StandaloneFeedbackMetricRow {
    id: string;
    label: string;
    value: number;
}

export function formatStandaloneFeedbackDate(iso: string | null | undefined): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function buildStandaloneFeedbackMetrics(
    feedback: StandaloneSessionFeedbackOut,
): StandaloneFeedbackMetricRow[] {
    const rows: StandaloneFeedbackMetricRow[] = [];
    for (const [key, label] of Object.entries(STANDALONE_FEEDBACK_SCALE_LABELS) as [
        keyof typeof STANDALONE_FEEDBACK_SCALE_LABELS,
        string,
    ][]) {
        const value = feedback[key];
        if (typeof value === "number" && value >= 1 && value <= 10) {
            rows.push({ id: key, label, value });
        }
    }
    return rows;
}

export const STANDALONE_FEEDBACK_METRIC_GRID =
    "grid grid-cols-2 gap-3 sm:grid-cols-3";

export const STANDALONE_FEEDBACK_METRIC_CELL =
    "rounded-lg border border-border/60 bg-muted/10 px-3 py-2";

export const STANDALONE_FEEDBACK_METRIC_VALUE =
    "text-lg font-semibold tabular-nums text-foreground";

export const STANDALONE_FEEDBACK_TEXT_BLOCK = "space-y-1 text-sm";
