/**
 * ClientListWidget — Mis clientes (dashboard premium).
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import {
    useGetClientsWithMetricsQuery,
    useGetRecentActivityQuery,
} from "@nexia/shared/api/clientsApi";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import type { ClientListItem } from "@nexia/shared/types/client";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import { ClientListCard } from "./ClientListCard";
import {
    TRAINER_DASHBOARD_COPY,
    TRAINER_DASHBOARD_EMPTY_TITLE,
    TRAINER_DASHBOARD_LINK,
    TRAINER_DASHBOARD_LIST,
    TRAINER_DASHBOARD_LOADING_BLOCK,
    TRAINER_DASHBOARD_WIDGET,
    TRAINER_DASHBOARD_WIDGET_HINT,
    TRAINER_DASHBOARD_WIDGET_TITLE,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";

export const ClientListWidget: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !isAuthenticated,
    });

    const { data, isLoading } = useGetClientsWithMetricsQuery(
        {
            trainer_id: trainerProfile?.id ?? 0,
            page: 1,
            page_size: 6,
        },
        { skip: !trainerProfile?.id },
    );

    const { data: activityData } = useGetRecentActivityQuery(
        { limit: 30, trainer_id: trainerProfile?.id },
        { skip: !trainerProfile?.id, pollingInterval: 60_000 },
    );

    const activeClientIds = useMemo(() => {
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const ids = new Set<number>();
        for (const item of activityData?.items ?? []) {
            if (item.client_id && new Date(item.timestamp).getTime() >= cutoff) {
                ids.add(item.client_id);
            }
        }
        return ids;
    }, [activityData?.items]);

    const items: ClientListItem[] = data?.items ?? [];

    if (isLoading) {
        return (
            <section className={TRAINER_DASHBOARD_WIDGET}>
                <NexiaGlassAccentRim />
                <div className={TRAINER_DASHBOARD_LOADING_BLOCK} />
            </section>
        );
    }

    return (
        <section className={cn(TRAINER_DASHBOARD_WIDGET, "overflow-visible")}>
            <NexiaGlassAccentRim />
            <h2 className={TRAINER_DASHBOARD_WIDGET_TITLE}>{TRAINER_DASHBOARD_COPY.clientsTitle}</h2>
            <p className={TRAINER_DASHBOARD_WIDGET_HINT}>{TRAINER_DASHBOARD_COPY.clientsHint}</p>

            {items.length === 0 ? (
                <p className={cn(TRAINER_DASHBOARD_EMPTY_TITLE, "py-4 text-center text-muted-foreground")}>
                    {TRAINER_DASHBOARD_COPY.noClients}
                </p>
            ) : (
                <div className={TRAINER_DASHBOARD_LIST}>
                    {items.map((client) => (
                        <ClientListCard
                            key={client.id}
                            client={client}
                            hasRecentActivity={activeClientIds.has(client.id)}
                            onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                        />
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={() => navigate("/dashboard/clients")}
                className={cn(TRAINER_DASHBOARD_LINK, "mt-3")}
            >
                {TRAINER_DASHBOARD_COPY.viewAllClients}
            </button>
        </section>
    );
};
