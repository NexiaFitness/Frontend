/**
 * ClientListWidget — Mis clientes con AdherenceBar según DASHBOARD_LAYOUT_SPEC
 *
 * Lista clientes con avatar, nombre, barra de adherencia, %, iconos tendencia (flechas) y
 * satisfacción (Smile/Meh/Frown). Card según spec: 3 bloques, iconos a la derecha.
 * Link "Ver todos" a /dashboard/clients.
 *
 * @author Frontend Team
 * @since v5.x - DASHBOARD_LAYOUT_SPEC
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
import { ClientListCard } from "./ClientListCard";

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
        { skip: !trainerProfile?.id }
    );

    const { data: activityData } = useGetRecentActivityQuery(
        { limit: 30, trainer_id: trainerProfile?.id },
        { skip: !trainerProfile?.id, pollingInterval: 60_000 }
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
            <div>
                <h2 className="mb-4 text-lg font-semibold text-foreground">Mis clientes</h2>
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex h-14 items-center gap-3 rounded-lg bg-surface p-3">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-surface-2 animate-pulse" />
                            <div className="h-4 flex-1 rounded bg-surface-2 animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Mis clientes</h2>
            <div className="space-y-2">
                {items.length === 0 ? (
                    <p className="rounded-lg bg-surface p-4 text-center text-sm text-muted-foreground">
                        No tienes clientes aún
                    </p>
                ) : (
                    items.map((client) => (
                        <ClientListCard
                            key={client.id}
                            client={client}
                            hasRecentActivity={activeClientIds.has(client.id)}
                            onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                        />
                    ))
                )}
            </div>
            <button
                type="button"
                onClick={() => navigate("/dashboard/clients")}
                className="mt-3 text-sm text-primary hover:underline"
            >
                Ver todos
            </button>
        </div>
    );
};
