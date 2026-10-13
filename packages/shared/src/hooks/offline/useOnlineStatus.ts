/**
 * useOnlineStatus.ts — Estado de conectividad del navegador.
 * Notas: tras suscribirse relee navigator.onLine para no quedarse en "online" si el evento offline
 * llego antes que el listener (DBG-E-05).
 */

import { useEffect, useState } from "react";

export function useOnlineStatus(): boolean {
    const [online, setOnline] = useState(
        typeof navigator !== "undefined" ? navigator.onLine : true
    );

    useEffect(() => {
        const onOnline = () => setOnline(true);
        const onOffline = () => setOnline(false);
        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);
        // Un evento emitido entre el render y esta suscripcion se perderia: releer el estado real.
        setOnline(navigator.onLine);
        return () => {
            window.removeEventListener("online", onOnline);
            window.removeEventListener("offline", onOffline);
        };
    }, []);

    return online;
}
