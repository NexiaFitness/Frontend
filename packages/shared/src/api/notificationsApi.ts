/**
 * Notifications API — Web Push (F3a).
 */

import { baseApi } from "./baseApi";

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
    }),
    overrideExisting: false,
});

export const {
    useGetVapidPublicKeyQuery,
    useLazyGetVapidPublicKeyQuery,
    useSubscribePushMutation,
    useUnsubscribePushMutation,
} = notificationsApi;
