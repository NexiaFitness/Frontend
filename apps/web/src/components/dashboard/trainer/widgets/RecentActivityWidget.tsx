/**
 * RecentActivityWidget — Actividad reciente atletas (dashboard premium).
 */

import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useGetRecentActivityQuery } from "@nexia/shared/api/clientsApi";
import type { RecentActivityItem } from "@nexia/shared/types/client";
import type { RootState } from "@nexia/shared/store";
import { LoadingSpinner } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { getTrainerActivityIcon } from "@/lib/trainerActivityIcons";
import {
    TRAINER_DASHBOARD_ACTIVITY_ICON,
    TRAINER_DASHBOARD_COPY,
    TRAINER_DASHBOARD_LIST,
    TRAINER_DASHBOARD_LIST_ITEM,
    TRAINER_DASHBOARD_LIST_ITEM_META,
    TRAINER_DASHBOARD_WIDGET_BODY,
    TRAINER_DASHBOARD_WIDGET_EMPTY_INLINE,
    TRAINER_DASHBOARD_WIDGET_HEADER,
    TRAINER_DASHBOARD_WIDGET_STRETCH,
    TRAINER_DASHBOARD_WIDGET_TITLE,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";

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
        },
    );

    const items = useMemo(() => data?.items ?? [], [data?.items]);

    const handleClick = useCallback(
        (item: RecentActivityItem) => {
            const href = activityHref(item);
            if (href) navigate(href);
        },
        [navigate],
    );

    return (
        <section className={TRAINER_DASHBOARD_WIDGET_STRETCH}>
            <NexiaGlassAccentRim />
            <div className={TRAINER_DASHBOARD_WIDGET_HEADER}>
                <h2 className={TRAINER_DASHBOARD_WIDGET_TITLE}>{TRAINER_DASHBOARD_COPY.activityTitle}</h2>
            </div>

            {isLoading ? (
                <div className={TRAINER_DASHBOARD_WIDGET_BODY}>
                    <div className="flex flex-1 items-center justify-center py-8">
                        <LoadingSpinner size="md" />
                    </div>
                </div>
            ) : items.length === 0 ? (
                <p className={TRAINER_DASHBOARD_WIDGET_EMPTY_INLINE}>{TRAINER_DASHBOARD_COPY.noActivity}</p>
            ) : (
                <div className={TRAINER_DASHBOARD_WIDGET_BODY}>
                    <ul className={TRAINER_DASHBOARD_LIST}>
                        {items.map((item) => {
                            const href = activityHref(item);
                            const content = (
                                <>
                                    <div className={TRAINER_DASHBOARD_ACTIVITY_ICON}>
                                        {getTrainerActivityIcon(item.type)}
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                        <p className="line-clamp-2 text-sm text-foreground">
                                            <span className="font-medium">{item.actor_name}</span>{" "}
                                            {item.description}
                                        </p>
                                        <p className={TRAINER_DASHBOARD_LIST_ITEM_META}>
                                            {formatTimeAgo(item.timestamp)}
                                        </p>
                                    </div>
                                </>
                            );

                            if (!href) {
                                return (
                                    <li key={item.id} className="flex gap-3 px-1">
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
                </div>
            )}
        </section>
    );
};
