/**
 * clientListMetricsPresentation.ts — Textos y estado de métricas en lista de clientes (D4).
 * Lógica pura: sin DOM. Usado por ClientListCard y ClientList.
 */

import type {
    ClientListItem,
    ClientProgressTrend,
    SatisfactionLevel,
} from "../types/client";

export interface ClientSatisfactionDisplay {
    level: SatisfactionLevel | null;
    unrated: boolean;
    tooltip: string;
}

export interface ClientSatisfactionTrendDisplay {
    trend: ClientProgressTrend | null;
    tooltip: string | null;
}

const SATISFACTION_TREND_LABELS: Record<ClientProgressTrend, string> = {
    up: "mejora",
    down: "baja",
    stable: "estable",
};

function formatRatingDate(iso: string): string {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/** True cuando el backend no ha recibido valoración post-sesión (ClientRating). */
export function hasClientSessionSatisfaction(client: ClientListItem): boolean {
    return client.last_satisfaction != null || client.satisfaction_level != null;
}

export function getClientSatisfactionDisplay(client: ClientListItem): ClientSatisfactionDisplay {
    if (!hasClientSessionSatisfaction(client)) {
        return {
            level: null,
            unrated: true,
            tooltip: "Sin valoración post-sesión",
        };
    }

    const rating = client.last_satisfaction;
    const dateLabel =
        client.last_satisfaction_date != null
            ? formatRatingDate(client.last_satisfaction_date)
            : "";

    let tooltip = "Satisfacción post-sesión";
    if (rating != null && dateLabel) {
        tooltip = `Satisfacción post-sesión: ${rating}/5 · ${dateLabel}`;
    } else if (rating != null) {
        tooltip = `Satisfacción post-sesión: ${rating}/5`;
    }

    return {
        level: client.satisfaction_level,
        unrated: false,
        tooltip,
    };
}

export function getClientAdherenceTooltip(adherence: number | null | undefined): string {
    if (adherence == null) {
        return "Adherencia al plan: sin datos";
    }
    const pct = Math.round(Math.min(100, Math.max(0, adherence)));
    return `Adherencia al plan: ${pct}% — sesiones completadas vs programadas (30 días)`;
}

/** Tendencia de satisfacción; null si aún no hay muestra suficiente (backend §8.1). */
export function getClientSatisfactionTrendDisplay(
    client: ClientListItem
): ClientSatisfactionTrendDisplay {
    const trend = client.satisfaction_trend;
    if (trend == null) {
        return { trend: null, tooltip: null };
    }
    return {
        trend,
        tooltip: `Tendencia de satisfacción: ${SATISFACTION_TREND_LABELS[trend]}`,
    };
}
