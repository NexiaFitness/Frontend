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

import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useGetClientsWithMetricsQuery } from "@nexia/shared/api/clientsApi";
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
