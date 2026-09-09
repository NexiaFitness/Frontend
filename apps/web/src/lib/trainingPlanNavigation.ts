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

export interface BlockAuthorPathOptions {
    clientId: number;
    planId: number;
    mode: "create" | "edit";
    blockId?: number;
    blockStart?: string;
    blockEnd?: string;
    blockStep?: string;
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

/** Entrada al journey D-PAP (create/edit bloque) sobre la ruta canónica de planificación. */
export function buildBlockAuthorPath(options: BlockAuthorPathOptions): string {
    const params = new URLSearchParams();
    params.set("tab", "planning");
    params.set("plan", String(options.planId));
    params.set("blockAuthor", options.mode);
    if (options.blockId != null) {
        params.set("blockId", String(options.blockId));
    }
    if (options.blockStart) {
        params.set("blockStart", options.blockStart);
    }
    if (options.blockEnd) {
        params.set("blockEnd", options.blockEnd);
    }
    params.set("blockStep", options.blockStep ?? (options.mode === "edit" ? "summary" : "qualities"));
    return `/dashboard/clients/${options.clientId}?${params.toString()}`;
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
