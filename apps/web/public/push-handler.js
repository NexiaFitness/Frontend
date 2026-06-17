/**
 * push-handler.js — Service worker push + notification click (F3a).
 * Loaded by vite-plugin-pwa workbox via importScripts.
 */
self.addEventListener("push", (event) => {
    let payload = { title: "NEXIA", body: "", url: "/dashboard" };
    try {
        if (event.data) {
            payload = { ...payload, ...event.data.json() };
        }
    } catch {
        /* use defaults */
    }
    event.waitUntil(
        self.registration.showNotification(payload.title || "NEXIA", {
            body: payload.body || "",
            icon: "/icons/icon.svg",
            badge: "/icons/icon.svg",
            data: { url: payload.url || "/dashboard/feedback" },
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "/dashboard";
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
            for (const client of list) {
                if ("focus" in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
            return undefined;
        })
    );
});
