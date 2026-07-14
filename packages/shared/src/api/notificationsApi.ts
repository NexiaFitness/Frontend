/**
 * Notifications API — Web Push (F3a) + trainer inbox (F1).
 */

import { baseApi } from "./baseApi";
import type {
    InboxNotificationListOut,
    InboxNotificationMarkAllReadOut,
    InboxNotificationUnreadCountOut,
    NotificationType,
} from "../types/notification";

export interface VapidPublicKeyResponse {
    public_key: string | null;
    enabled: boolean;
}

export interface PushSubscriptionPayload {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export interface GetInboxNotificationsArgs {
    clientId?: number;
    unreadOnly?: boolean;
    type?: NotificationType;
    skip?: number;
    limit?: number;
}

export interface MarkAllInboxReadArgs {
    clientId?: number;
    notificationType?: NotificationType;
}

export const notificationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getVapidPublicKey: builder.query<VapidPublicKeyResponse, void>({
            query: () => "/notifications/vapid-public-key",
        }),
        subscribePush: builder.mutation<{ id: number; endpoint: string }, PushSubscriptionPayload>({
            query: (body) => ({
                url: "/notifications/push-subscribe",
                method: "POST",
                body,
            }),
        }),
        unsubscribePush: builder.mutation<void, { endpoint: string }>({
            query: (body) => ({
                url: "/notifications/push-subscribe",
                method: "DELETE",
                body,
            }),
        }),

        getInboxNotifications: builder.query<InboxNotificationListOut, GetInboxNotificationsArgs>({
            query: ({ clientId, unreadOnly, type, skip = 0, limit = 50 }) => {
                const params = new URLSearchParams();
                if (clientId != null) params.set("client_id", String(clientId));
                if (unreadOnly) params.set("unread_only", "true");
                if (type) params.set("type", type);
                params.set("skip", String(skip));
                params.set("limit", String(limit));
                const qs = params.toString();
                return { url: `/notifications${qs ? `?${qs}` : ""}` };
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map(({ id }) => ({
                              type: "InboxNotification" as const,
                              id,
                          })),
                          { type: "InboxNotification" as const, id: "LIST" },
                      ]
                    : [{ type: "InboxNotification" as const, id: "LIST" }],
        }),

        getInboxUnreadCount: builder.query<
            InboxNotificationUnreadCountOut,
            { clientId?: number } | void
        >({
            query: (args) => {
                const params = new URLSearchParams();
                if (args?.clientId != null) {
                    params.set("client_id", String(args.clientId));
                }
                const qs = params.toString();
                return { url: `/notifications/unread-count${qs ? `?${qs}` : ""}` };
            },
            providesTags: [{ type: "InboxNotification", id: "COUNT" }],
        }),

        markInboxNotificationRead: builder.mutation<
            { message: string; id: number; read_at: string },
            number
        >({
            query: (notificationId) => ({
                url: `/notifications/${notificationId}/read`,
                method: "PUT",
            }),
            invalidatesTags: (_result, _error, notificationId) => [
                { type: "InboxNotification", id: notificationId },
                { type: "InboxNotification", id: "LIST" },
                { type: "InboxNotification", id: "COUNT" },
            ],
        }),

        markAllInboxNotificationsRead: builder.mutation<
            InboxNotificationMarkAllReadOut,
            MarkAllInboxReadArgs | void
        >({
            query: (body) => ({
                url: "/notifications/mark-all-read",
                method: "POST",
                body: body ?? {},
            }),
            invalidatesTags: [
                { type: "InboxNotification", id: "LIST" },
                { type: "InboxNotification", id: "COUNT" },
            ],
        }),

        resolveInboxNotification: builder.mutation<
            { message: string; id: number; resolved_at: string },
            number
        >({
            query: (notificationId) => ({
                url: `/notifications/${notificationId}/resolve`,
                method: "PUT",
            }),
            invalidatesTags: (_result, _error, notificationId) => [
                { type: "InboxNotification", id: notificationId },
                { type: "InboxNotification", id: "LIST" },
                { type: "InboxNotification", id: "COUNT" },
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetVapidPublicKeyQuery,
    useLazyGetVapidPublicKeyQuery,
    useSubscribePushMutation,
    useUnsubscribePushMutation,
    useGetInboxNotificationsQuery,
    useGetInboxUnreadCountQuery,
    useMarkInboxNotificationReadMutation,
    useMarkAllInboxNotificationsReadMutation,
    useResolveInboxNotificationMutation,
} = notificationsApi;
