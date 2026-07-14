/**
 * trainingPlanNavigation.ts — URLs canónicas plan ↔ cliente
 *
 * Tras consolidación UX (2026-05): el detalle operativo del plan vive en
 * `/dashboard/clients/:clientId?tab=planning&plan=:planId`.
 * `/dashboard/training-plans/:id` redirige aquí si el plan tiene cliente.
 */

export type ClientDetailTab = "overview" | "sessions" | "daily-coherence" | "testing" | "progress" | "planning" | "injuries";

export interface ClientTabPathOptions {
    tab?: ClientDetailTab;
    planId?: number | null;
}

/**
 * Ruta canónica del perfil de cliente con tab (y plan opcional en planificación).
 */
export function buildClientTabPath(clientId: number, options?: ClientTabPathOptions): string {
    const params = new URLSearchParams();
    params.set("tab", options?.tab ?? "planning");
    if (options?.planId != null && options.planId > 0) {
        params.set("plan", String(options.planId));
    }
    return `/dashboard/clients/${clientId}?${params.toString()}`;
}

/**
 * Destino al abrir `/dashboard/training-plans/:id` con query legacy.
 */
export function resolveTrainingPlanDetailRedirect(
    clientId: number | null | undefined,
    planId: number,
    searchParams: URLSearchParams,
): string | null {
    if (clientId == null || clientId <= 0) {
        return null;
    }
    const legacyTab = searchParams.get("tab");
    if (legacyTab === "sessions") {
        return buildClientTabPath(clientId, { tab: "sessions" });
    }
    return buildClientTabPath(clientId, { tab: "planning", planId });
}
