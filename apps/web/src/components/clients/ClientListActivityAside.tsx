/**
 * ClientListActivityAside — Sidebar actividad reciente (lista clientes, lg+).
 */

import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { RecentActivityItem } from "@nexia/shared/types/client";
import { LoadingSpinner } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { getTrainerActivityIcon } from "@/lib/trainerActivityIcons";
import {
    CLIENT_LIST_ACTIVITY_ASIDE,
    CLIENT_LIST_ACTIVITY_EMPTY,
    CLIENT_LIST_ACTIVITY_HEADER,
    CLIENT_LIST_ACTIVITY_ICON,
    CLIENT_LIST_ACTIVITY_ITEM,
    CLIENT_LIST_ACTIVITY_LIST,
    CLIENT_LIST_ACTIVITY_META,
    CLIENT_LIST_ACTIVITY_TITLE,
    CLIENT_LIST_COPY,
} from "./clientListPresentation";
import { TRAINER_DASHBOARD_LIST_ITEM } from "@/components/dashboard/trainer/trainerDashboardPresentation";

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

export interface ClientListActivityAsideProps {
    items: RecentActivityItem[];
    isLoading?: boolean;
}

export const ClientListActivityAside: React.FC<ClientListActivityAsideProps> = ({
    items,
    isLoading = false,
}) => {
    const navigate = useNavigate();
    const safeItems = useMemo(() => items.slice(0, 10), [items]);

    const handleClick = useCallback(
        (item: RecentActivityItem) => {
            const href = activityHref(item);
            if (href) navigate(href);
        },
        [navigate],
    );

    return (
        <aside className={CLIENT_LIST_ACTIVITY_ASIDE}>
            <NexiaGlassAccentRim />
            <div className={CLIENT_LIST_ACTIVITY_HEADER}>
                <h2 className={CLIENT_LIST_ACTIVITY_TITLE}>{CLIENT_LIST_COPY.activityTitle}</h2>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                </div>
            ) : safeItems.length === 0 ? (
                <p className={CLIENT_LIST_ACTIVITY_EMPTY}>{CLIENT_LIST_COPY.noActivity}</p>
            ) : (
                <ul className={CLIENT_LIST_ACTIVITY_LIST}>
                    {safeItems.map((item) => {
                        const href = activityHref(item);
                        const content = (
                            <>
                                <div className={CLIENT_LIST_ACTIVITY_ICON}>
                                    {getTrainerActivityIcon(item.type)}
                                </div>
                                <div className="min-w-0 flex-1 text-left">
                                    <p className="line-clamp-2 text-sm text-foreground">
                                        <span className="font-medium">{item.actor_name}</span>{" "}
                                        {item.description}
                                    </p>
                                    <p className={CLIENT_LIST_ACTIVITY_META}>
                                        {formatTimeAgo(item.timestamp)}
                                    </p>
                                </div>
                            </>
                        );

                        if (!href) {
                            return (
                                <li key={item.id} className={CLIENT_LIST_ACTIVITY_ITEM}>
                                    {content}
                                </li>
                            );
                        }

                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    className={TRAINER_DASHBOARD_LIST_ITEM}
                                    onClick={() => handleClick(item)}
                                >
                                    {content}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </aside>
    );
};
