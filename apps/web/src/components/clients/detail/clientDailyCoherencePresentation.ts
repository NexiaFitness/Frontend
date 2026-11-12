/**
 * clientDailyCoherencePresentation.ts — Copy y mapeos de monotonía/strain (Foster) en Coherencia diaria.
 *
 * La monotonía es semanal (7 días, descanso = 0); el backend devuelve null sin datos suficientes.
 */

import type { MetricCardColor, StrainWeekData } from "@nexia/shared/types/coherence";

export const MONOTONY_HIGH_THRESHOLD = 2.0;

export const DAILY_COHERENCE_LOAD_COPY = {
    notEnoughData: "Sin datos suficientes",
    monotonyHigh: "Alta — revisar planificación",
    monotonyNormal: "Normal",
    strainSubtitle: "Carga acumulada",
    monotonyEmpty: "No hay datos de monotonía disponibles",
    monotonyWeeklyOnly:
        "La monotonía se calcula por semana: el valor está en la tarjeta. Cambia a Mes o Bloque para ver su evolución.",
} as const;

export interface CoherenceMetricCardView {
    value: string;
    subtitle: string;
    color: MetricCardColor;
}

export interface StrainChartPoint extends StrainWeekData {
    periodLabel: string;
    rawLoad: number;
    rawStrain: number | null;
}

export function monotonyMetricCard(monotony: number | null): CoherenceMetricCardView {
    if (monotony == null) {
        return { value: "—", subtitle: DAILY_COHERENCE_LOAD_COPY.notEnoughData, color: "blue" };
    }
    const high = monotony > MONOTONY_HIGH_THRESHOLD;
    return {
        value: monotony.toFixed(1),
        subtitle: high ? DAILY_COHERENCE_LOAD_COPY.monotonyHigh : DAILY_COHERENCE_LOAD_COPY.monotonyNormal,
        color: high ? "orange" : "green",
    };
}

export function strainMetricCard(strain: number | null): CoherenceMetricCardView {
    if (strain == null) {
        return { value: "—", subtitle: DAILY_COHERENCE_LOAD_COPY.notEnoughData, color: "blue" };
    }
    return { value: String(strain), subtitle: DAILY_COHERENCE_LOAD_COPY.strainSubtitle, color: "blue" };
}

export function monotonyChartEmptyMessage(periodType: string): string {
    return periodType === "week"
        ? DAILY_COHERENCE_LOAD_COPY.monotonyWeeklyOnly
        : DAILY_COHERENCE_LOAD_COPY.monotonyEmpty;
}

/** Carga y strain en escala 0–10 para compartir eje; conserva los valores reales para el tooltip. */
export function normalizeStrainChartData(items: readonly StrainWeekData[]): StrainChartPoint[] {
    const maxValue = Math.max(0, ...items.map((item) => Math.max(item.load, item.strain ?? 0)));
    if (maxValue === 0) return [];
    return items.map((item) => ({
        ...item,
        periodLabel: item.week,
        load: (item.load / maxValue) * 10,
        strain: item.strain == null ? null : (item.strain / maxValue) * 10,
        rawLoad: item.load,
        rawStrain: item.strain,
    }));
}
