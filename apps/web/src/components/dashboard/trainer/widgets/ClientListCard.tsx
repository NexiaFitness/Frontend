/**
 * ClientListCard — Ítem lista «Mis clientes» (dashboard premium).
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
import { TRAINER_DASHBOARD_LIST_ITEM } from "@/components/dashboard/trainer/trainerDashboardPresentation";

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
            className={TRAINER_DASHBOARD_LIST_ITEM}
            onClick={onClick}
            aria-label={`Ir al detalle de ${fullName}`}
        >
            <div className="relative shrink-0">
                <ClientAvatar
                    clientId={client.id}
                    nombre={client.nombre}
                    apellidos={client.apellidos}
                    size="sm"
                    className="h-8 w-8 text-label font-semibold"
                />
                {hasRecentActivity ? (
                    <span
                        className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/50 ring-2 ring-card"
                        aria-label="Actividad reciente"
                    />
                ) : null}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
                <HintTooltip label={adherenceTooltip} className="mt-1" align="start">
                    <span className="flex items-center gap-2">
                        <AdherenceBar value={adherence} />
                        <span className="text-label tabular-nums text-muted-foreground">{adherence}%</span>
                    </span>
                </HintTooltip>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                {satisfactionTrend.trend != null && satisfactionTrend.tooltip != null ? (
                    <HintTooltip label={satisfactionTrend.tooltip} side="top" align="end">
                        <TrendIcon trend={satisfactionTrend.trend} />
                    </HintTooltip>
                ) : null}
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
