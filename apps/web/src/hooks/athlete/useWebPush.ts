/**
 * useWebPush.ts — Suscripción Web Push PWA atleta (F3a).
 */

import { useCallback, useState } from "react";
import {
    useLazyGetVapidPublicKeyQuery,
    useSubscribePushMutation,
    useUnsubscribePushMutation,
} from "@nexia/shared/api/notificationsApi";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = window.atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) {
        arr[i] = raw.charCodeAt(i);
    }
    return arr;
}

export type WebPushStatus = "unsupported" | "disabled" | "idle" | "subscribing" | "subscribed" | "error";

export function useWebPush() {
    const [status, setStatus] = useState<WebPushStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fetchVapid] = useLazyGetVapidPublicKeyQuery();
    const [subscribePush] = useSubscribePushMutation();
    const [unsubscribePush] = useUnsubscribePushMutation();

    const subscribe = useCallback(async (): Promise<boolean> => {
        setErrorMessage(null);

        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            setStatus("unsupported");
            setErrorMessage("Tu navegador no soporta notificaciones push.");
            return false;
        }

        if (!("Notification" in window)) {
            setStatus("unsupported");
            return false;
        }

        setStatus("subscribing");

        try {
            const vapid = await fetchVapid().unwrap();
            if (!vapid.enabled || !vapid.public_key) {
                setStatus("disabled");
                setErrorMessage("Push no configurado en el servidor.");
                return false;
            }

            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                setStatus("idle");
                setErrorMessage("Permiso de notificaciones denegado.");
                return false;
            }

            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapid.public_key),
                });
            }

            const json = subscription.toJSON();
            if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
                throw new Error("Suscripción push incompleta");
            }

            await subscribePush({
                endpoint: json.endpoint,
                keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
            }).unwrap();

            setStatus("subscribed");
            return true;
        } catch (err) {
            setStatus("error");
            setErrorMessage(
                err instanceof Error ? err.message : "No se pudo activar push"
            );
            return false;
        }
    }, [fetchVapid, subscribePush]);

    const unsubscribe = useCallback(async (): Promise<void> => {
        if (!("serviceWorker" in navigator)) return;
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                const endpoint = subscription.endpoint;
                await subscription.unsubscribe();
                await unsubscribePush({ endpoint }).unwrap();
            }
            setStatus("idle");
        } catch {
            setStatus("error");
        }
    }, [unsubscribePush]);

    return { status, errorMessage, subscribe, unsubscribe };
};
