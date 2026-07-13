/**
 * ClientListCard — Ítem de lista "Mis clientes" (Dashboard)
 *
 * Especificación: Card de cliente — lista Mis clientes (DASHBOARD_LAYOUT_SPEC).
 * D4: barra = adherencia al plan; cara = satisfacción post-sesión (ClientRating).
 * Sin valoración → cara neutra sin color; HintTooltip en hover/foco.
 *
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import type { ClientListItem } from "@nexia/shared/types/client";
import {
    getClientAdherenceTooltip,
    getClientSatisfactionDisplay,
    getClientSatisfactionTrendDisplay,
} from "@nexia/shared";
import { ClientAvatar } from "@/components/ui/avatar";
import { HintTooltip } from "@/components/ui/feedback";
import { AdherenceBar, SatisfactionIcon, TrendIcon } from "@/components/ui/indicators";

export interface ClientListCardProps {
    client: ClientListItem;
    onClick: () => void;
    hasRecentActivity?: boolean;
}

export const ClientListCard: React.FC<ClientListCardProps> = ({
    client,
    onClick,
    hasRecentActivity = false,
}) => {
    const adherence = Math.min(100, Math.max(0, client.adherence_percentage ?? 0));
    const adherenceTooltip = getClientAdherenceTooltip(client.adherence_percentage);
    const satisfaction = getClientSatisfactionDisplay(client);
    const satisfactionTrend = getClientSatisfactionTrendDisplay(client);
    const fullName = [client.nombre, client.apellidos].filter(Boolean).join(" ") || "—";

    return (
        <button
            type="button"
            className="relative flex w-full cursor-pointer items-center gap-3 overflow-visible rounded-lg bg-surface p-3 text-left transition-colors hover:bg-surface-2"
            onClick={onClick}
            aria-label={`Ir al detalle de ${fullName}`}
        >
            {/* 1. Avatar */}
            <div className="relative shrink-0">
                <ClientAvatar
                    clientId={client.id}
                    nombre={client.nombre}
                    apellidos={client.apellidos}
                    size="sm"
                    className="h-8 w-8 text-label font-semibold"
                />
                {hasRecentActivity && (
                    <span
                        className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-card"
                        aria-label="Actividad reciente"
                    />
                )}
            </div>

            {/* 2. Nombre + adherencia (barra + %) */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
                <HintTooltip label={adherenceTooltip} className="mt-1" align="start">
                    <span className="flex items-center gap-2">
                        <AdherenceBar value={adherence} />
                        <span className="text-label text-muted-foreground">{adherence}%</span>
                    </span>
                </HintTooltip>
            </div>

            {/* 3. Tendencia satisfacción + icono satisfacción (derecha) */}
            <div className="flex shrink-0 items-center gap-2">
                {satisfactionTrend.trend != null && satisfactionTrend.tooltip != null && (
                    <HintTooltip label={satisfactionTrend.tooltip} side="top" align="end">
                        <TrendIcon trend={satisfactionTrend.trend} />
                    </HintTooltip>
                )}
                <HintTooltip label={satisfaction.tooltip} side="top" align="end">
                    <SatisfactionIcon
                        level={satisfaction.level ?? undefined}
                        unrated={satisfaction.unrated}
                    />
                </HintTooltip>
            </div>
        </button>
    );
};
