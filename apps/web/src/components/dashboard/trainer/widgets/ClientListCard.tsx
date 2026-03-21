/**
 * ClientListCard — Ítem de lista "Mis clientes" (Dashboard)
 *
 * Especificación: Card de cliente — lista Mis clientes (DASHBOARD_LAYOUT_SPEC).
 * Estructura: Avatar | Nombre + barra adherencia + % | Iconos tendencia + satisfacción (derecha).
 * Tendencia: flecha arriba (verde), abajo (rojo), estable (muted). Satisfacción: Smile/Meh/Frown.
 *
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import type { ClientListItem, ClientProgressTrend } from "@nexia/shared/types/client";
import { ClientAvatar } from "@/components/ui/avatar";
import { AdherenceBar, SatisfactionIcon, TrendIcon } from "@/components/ui/indicators";

export interface ClientListCardProps {
    client: ClientListItem;
    onClick: () => void;
}

/** Satisfacción 1–10: fatigue 1 (perfecto) → 10, fatigue 10 (exhausted) → 1. */
function satisfactionFromFatigue(fatigueLevelNumeric: number | null): number {
    const raw = fatigueLevelNumeric != null ? 10 - fatigueLevelNumeric : 5;
    return Math.max(1, Math.min(10, raw));
}

export const ClientListCard: React.FC<ClientListCardProps> = ({ client, onClick }) => {
    const adherence = Math.min(100, Math.max(0, client.adherence_percentage ?? 0));
    const trend: ClientProgressTrend =
        client.satisfaction_trend ??
        client.progress_trend ??
        (client.adherence_percentage != null
            ? client.adherence_percentage >= 75
                ? "up"
                : client.adherence_percentage < 50
                  ? "down"
                  : "stable"
            : "stable");
    const satisfaction = satisfactionFromFatigue(client.fatigue_level_numeric);
    const fullName = [client.nombre, client.apellidos].filter(Boolean).join(" ") || "—";

    return (
        <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-surface p-3 text-left transition-colors hover:bg-surface-2"
            onClick={onClick}
            aria-label={`Ir al detalle de ${fullName}`}
        >
            {/* 1. Avatar */}
            <ClientAvatar
                clientId={client.id}
                nombre={client.nombre}
                apellidos={client.apellidos}
                size="sm"
                className="h-8 w-8 shrink-0 text-label font-semibold"
            />

            {/* 2. Nombre + adherencia (barra + %) */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
                <div className="mt-1 flex items-center gap-2">
                    <AdherenceBar value={adherence} />
                    <span className="text-label text-muted-foreground">{adherence}%</span>
                </div>
            </div>

            {/* 3. Iconos tendencia + satisfacción (derecha) */}
            <div className="flex shrink-0 items-center gap-2">
                <TrendIcon trend={trend} />
                <SatisfactionIcon level={client.satisfaction_level ?? undefined} value={satisfaction} />
            </div>
        </button>
    );
};
