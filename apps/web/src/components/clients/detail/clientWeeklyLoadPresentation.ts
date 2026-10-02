/**
 * clientWeeklyLoadPresentation.ts — Copy y clases carga semanal plan/extra (D10 Fase 1).
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import { PLATFORM_SECTION_LABEL } from "@/components/ui/surface/platformPremiumPresentation";

export const WEEKLY_LOAD_COPY = {
    sectionTitle: "Carga esta semana",
    sectionHint:
        "Índice 0–10: volumen ejecutado o, en cardio, duración y esfuerzo (RPE) del feedback.",
    planRow: "Del plan (ejecutado)",
    extraRow: "Sesiones extra",
    estimatedRow: "Estimado (sin registro ejecutado)",
    totalRow: "Suma índice ejecutado (exceso 25 %)",
    intensityNote: "Intensidad media (RPE o registro), independiente del índice de volumen.",
    excessTitle: "Exceso por extras",
    excessDetail:
        "La carga acumulada de sesiones extra supera el 25 % de la carga ejecutada del plan esta semana. Revisa fatiga y volumen total.",
    noData: "Aún no hay sesiones completadas esta semana para calcular carga.",
    formulaNote:
        "Cardio: carga = min(10, (minutos/40) × (RPE/10) × 10). Ejemplo: 40 min a RPE 8 → 8,0.",
} as const;

export const WEEKLY_LOAD_SHELL = cn(
    NEXIA_GLASS_CARD,
    "relative w-full space-y-4 p-5 pt-6",
);

export const WEEKLY_LOAD_SECTION_LABEL = PLATFORM_SECTION_LABEL;

export const WEEKLY_LOAD_EXCESS_BANNER = cn(
    "rounded-lg border border-warning/40 bg-warning/10 px-4 py-3",
);

export const WEEKLY_LOAD_METRIC_ROW = cn(
    "flex items-center justify-between gap-3 text-sm",
);

export function formatLoadIndex(value: number | undefined | null): string {
    if (value == null || Number.isNaN(value)) return "—";
    return value.toFixed(1).replace(".", ",");
}
