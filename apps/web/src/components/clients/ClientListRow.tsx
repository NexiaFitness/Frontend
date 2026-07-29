/**
 * ClientListRow — Ítem fila glass premium en /dashboard/clients.
 */

import React from "react";
import { Battery, BatteryLow, ChevronRight } from "lucide-react";
import type { ClientListItem } from "@nexia/shared/types/client";
import { getClientAdherenceTooltip, getClientSatisfactionDisplay } from "@nexia/shared";
import { ClientAvatar } from "@/components/ui/avatar";
import { HintTooltip } from "@/components/ui/feedback";
import { AdherenceBar, SatisfactionIcon, TrendIcon } from "@/components/ui/indicators";
import { cn } from "@/lib/utils";
import {
    CLIENT_LIST_ADHERENCE_TONE,
    CLIENT_LIST_DESKTOP_METRIC_LABEL,
    CLIENT_LIST_FATIGUE_BADGE,
    CLIENT_LIST_ROW,
    CLIENT_LIST_ROW_ADHERENCE,
    CLIENT_LIST_ROW_ADHERENCE_METRIC,
    CLIENT_LIST_ROW_ADHERENCE_VALUE,
    CLIENT_LIST_ROW_AVATAR,
    CLIENT_LIST_ROW_BADGE_ROW,
    CLIENT_LIST_ROW_BODY,
    CLIENT_LIST_ROW_CHEVRON,
    CLIENT_LIST_ROW_METRICS,
    CLIENT_LIST_ROW_NAME,
    CLIENT_LIST_ROW_SATISFACTION_METRIC,
    getClientStatusBadgeClass,
    getClientStatusLabel,
    resolveClientAdherenceTrend,
    resolveClientFatigueVariant,
    shouldShowAdherenceTrendIcon,
    translateClientFatigue,
} from "./clientListPresentation";

export interface ClientListRowProps {
    client: ClientListItem;
    onClick: () => void;
}

function FatigueBatteryIcon({ fatigue }: { fatigue: string | null }) {
    if (!fatigue) {
        return <Battery className="size-3 shrink-0 opacity-50" aria-hidden />;
    }
    const f = fatigue.toLowerCase();
    const isLow = f.includes("slightly") || f.includes("very") || f.includes("exhausted");
    return isLow ? (
        <BatteryLow className="size-3 shrink-0" aria-hidden />
    ) : (
        <Battery className="size-3 shrink-0" aria-hidden />
    );
}

interface ClientListRowMetricsProps {
    client: ClientListItem;
    adherence: number;
    adherenceTooltip: string;
    satisfaction: ReturnType<typeof getClientSatisfactionDisplay>;
    compact?: boolean;
}

function ClientListRowMetrics({
    client,
    adherence,
    adherenceTooltip,
    satisfaction,
    compact = false,
}: ClientListRowMetricsProps) {
    const adherenceTrend = resolveClientAdherenceTrend(
        client.adherence_percentage,
        client.progress_trend,
    );
    const showAdherenceTrend = shouldShowAdherenceTrendIcon(
        adherenceTrend,
        client.progress_trend != null,
    );

    return (
        <div className={CLIENT_LIST_ROW_METRICS}>
            <div className={CLIENT_LIST_ROW_ADHERENCE_METRIC}>
                <span className={CLIENT_LIST_DESKTOP_METRIC_LABEL}>Adherencia</span>
                <HintTooltip label={adherenceTooltip} align="start" side="top">
                    <span className={CLIENT_LIST_ROW_ADHERENCE}>
                        {showAdherenceTrend && adherenceTrend ? (
                            <TrendIcon trend={adherenceTrend} className="size-3.5 shrink-0" />
                        ) : null}
                        <AdherenceBar
                            value={adherence}
                            className={cn("min-w-0 flex-1", compact ? "max-w-[8rem]" : "w-16 lg:w-[4.5rem]")}
                        />
                        <span
                            className={cn(
                                CLIENT_LIST_ROW_ADHERENCE_VALUE,
                                !compact && "text-sm font-medium",
                                CLIENT_LIST_ADHERENCE_TONE(client.adherence_percentage),
                            )}
                        >
                            {client.adherence_percentage != null
                                ? `${Math.round(client.adherence_percentage)}%`
                                : "—"}
                        </span>
                    </span>
                </HintTooltip>
            </div>

            <div className={CLIENT_LIST_ROW_SATISFACTION_METRIC}>
                <span className={CLIENT_LIST_DESKTOP_METRIC_LABEL}>Satisfacción</span>
                <HintTooltip label={satisfaction.tooltip} side="top" align="center">
                    <SatisfactionIcon
                        level={satisfaction.level ?? undefined}
                        unrated={satisfaction.unrated}
                        className="size-4"
                    />
                </HintTooltip>
            </div>
        </div>
    );
}

export const ClientListRow: React.FC<ClientListRowProps> = ({ client, onClick }) => {
    const adherence = Math.min(100, Math.max(0, client.adherence_percentage ?? 0));
    const adherenceTooltip = getClientAdherenceTooltip(client.adherence_percentage);
    const satisfaction = getClientSatisfactionDisplay(client);
    const fullName = [client.nombre, client.apellidos].filter(Boolean).join(" ") || "—";
    const fatigueVariant = resolveClientFatigueVariant(client.fatigue_level);

    return (
        <li>
            <button
                type="button"
                className={CLIENT_LIST_ROW}
                onClick={onClick}
                aria-label={`Ir al detalle de ${fullName}`}
            >
                <div className={CLIENT_LIST_ROW_AVATAR}>
                    <ClientAvatar
                        clientId={client.id}
                        nombre={client.nombre}
                        apellidos={client.apellidos}
                        size="sm"
                        className="size-10 text-label font-semibold sm:size-11"
                    />
                </div>

                <div className={CLIENT_LIST_ROW_BODY}>
                    <p className={CLIENT_LIST_ROW_NAME}>{fullName}</p>

                    <div className={CLIENT_LIST_ROW_BADGE_ROW}>
                        <span className={getClientStatusBadgeClass(client.status)}>
                            {getClientStatusLabel(client.status)}
                        </span>
                        <span className={cn(CLIENT_LIST_FATIGUE_BADGE[fatigueVariant], "gap-1")}>
                            <FatigueBatteryIcon fatigue={client.fatigue_level} />
                            {translateClientFatigue(client.fatigue_level)}
                        </span>
                    </div>

                    <div className="sm:hidden">
                        <ClientListRowMetrics
                            client={client}
                            adherence={adherence}
                            adherenceTooltip={adherenceTooltip}
                            satisfaction={satisfaction}
                            compact
                        />
                    </div>
                </div>

                <div className="hidden sm:flex">
                    <ClientListRowMetrics
                        client={client}
                        adherence={adherence}
                        adherenceTooltip={adherenceTooltip}
                        satisfaction={satisfaction}
                    />
                </div>

                <ChevronRight className={CLIENT_LIST_ROW_CHEVRON} aria-hidden />
            </button>
        </li>
    );
};
