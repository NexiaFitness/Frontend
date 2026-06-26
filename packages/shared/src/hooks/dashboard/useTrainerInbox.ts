/**
 * useTrainerInbox.ts — Inbox entrenador (global o filtrado por cliente).
 */

import { useCallback, useMemo } from "react";
import {
    useGetInboxNotificationsQuery,
    useMarkAllInboxNotificationsReadMutation,
    useMarkInboxNotificationReadMutation,
    useResolveInboxNotificationMutation,
} from "../../api/notificationsApi";
import type { ClientInboxItem } from "../../types/notification";
import {
    buildClientInboxItemsFromNotifications,
    computeInboxBadge,
    formatInboxBadgeCount,
} from "../../utils/trainer/trainerInboxUtils";

export interface UseTrainerInboxOptions {
    /** Si se omite, lista notificaciones de todos los clientes (campana global). */
    clientId?: number;
    enabled?: boolean;
}

export interface UseTrainerInboxResult {
    items: ClientInboxItem[];
    pendingItems: ClientInboxItem[];
    badgeCount: number;
    badgeLabel: string | null;
    unreadCount: number;
    isLoading: boolean;
    isFetching: boolean;
    refetch: () => void;
    markAsRead: (notificationId: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    resolveNotification: (notificationId: number) => Promise<void>;
}

export function useTrainerInbox(options: UseTrainerInboxOptions = {}): UseTrainerInboxResult {
    const { clientId, enabled = true } = options;
    const skip = !enabled || (clientId != null && clientId <= 0);

    const queryArgs =
        clientId != null ? { clientId, limit: 100 } : { limit: 100 };

    const { data, isLoading, isFetching, refetch } = useGetInboxNotificationsQuery(
        queryArgs,
        { skip },
    );

    const [markReadMutation] = useMarkInboxNotificationReadMutation();
    const [markAllReadMutation] = useMarkAllInboxNotificationsReadMutation();
    const [resolveMutation] = useResolveInboxNotificationMutation();

    const items = useMemo(
        () => buildClientInboxItemsFromNotifications(data?.items ?? []),
        [data?.items],
    );

    const pendingItems = useMemo(
        () => items.filter((item) => !item.isResolved),
        [items],
    );

    const badgeCount = useMemo(() => computeInboxBadge(items), [items]);
    const badgeLabel = useMemo(() => formatInboxBadgeCount(badgeCount), [badgeCount]);

    const markAsRead = useCallback(
        async (notificationId: number) => {
            await markReadMutation(notificationId).unwrap();
        },
        [markReadMutation],
    );

    const markAllAsRead = useCallback(async () => {
        const body = clientId != null ? { clientId } : undefined;
        await markAllReadMutation(body).unwrap();
    }, [clientId, markAllReadMutation]);

    const resolveNotification = useCallback(
        async (notificationId: number) => {
            await resolveMutation(notificationId).unwrap();
        },
        [resolveMutation],
    );

    return {
        items,
        pendingItems,
        badgeCount,
        badgeLabel,
        unreadCount: data?.unread_count ?? 0,
        isLoading,
        isFetching,
        refetch: () => {
            void refetch();
        },
        markAsRead,
        markAllAsRead,
        resolveNotification,
    };
}
