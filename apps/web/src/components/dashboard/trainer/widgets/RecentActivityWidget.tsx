/**
 * RecentActivityWidget.tsx — Actividad reciente atletas (F2-FE-02).
 */

import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    useGetCurrentTrainerProfileQuery,
} from "@nexia/shared/api/trainerApi";
import { useGetRecentActivityQuery } from "@nexia/shared/api/clientsApi";
import type { RecentActivityItem } from "@nexia/shared/types/client";
import type { RootState } from "@nexia/shared/store";
import { LoadingSpinner } from "@/components/ui/feedback";
import { getTrainerActivityIcon } from "@/lib/trainerActivityIcons";

function formatTimeAgo(timestamp: string): string {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return "Ahora";
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} d`;
}

function activityHref(item: RecentActivityItem): string | null {
    if (item.session_id && item.client_id) {
        return `/dashboard/clients/${item.client_id}?tab=sessions&sessionId=${item.session_id}`;
    }
    if (item.client_id) {
        return `/dashboard/clients/${item.client_id}`;
    }
    return null;
}

export const RecentActivityWidget: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !isAuthenticated,
    });

    const { data, isLoading } = useGetRecentActivityQuery(
        { limit: 8, trainer_id: trainerProfile?.id },
        {
            skip: !trainerProfile?.id,
            pollingInterval: 60_000,
        }
    );

    const items = useMemo(() => data?.items ?? [], [data?.items]);

    const handleClick = useCallback(
        (item: RecentActivityItem) => {
            const href = activityHref(item);
            if (href) navigate(href);
        },
        [navigate]
    );

    return (
        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actividad reciente
            </h2>
            {isLoading ? (
                <div className="flex justify-center py-6">
                    <LoadingSpinner size="md" />
                </div>
            ) : items.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                    Sin actividad de clientes esta semana
                </p>
            ) : (
                <ul className="space-y-3">
                    {items.map((item) => {
                        const href = activityHref(item);
                        const content = (
                            <>
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                    {getTrainerActivityIcon(item.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm text-foreground">
                                        <span className="font-medium">{item.actor_name}</span>{" "}
                                        {item.description}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {formatTimeAgo(item.timestamp)}
                                    </p>
                                </div>
                            </>
                        );

                        if (!href) {
                            return (
                                <li key={item.id} className="flex gap-3">
                                    {content}
                                </li>
                            );
                        }

                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    className="flex w-full gap-3 rounded-md text-left transition-colors hover:bg-muted/50"
                                    onClick={() => handleClick(item)}
                                >
                                    {content}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
};
