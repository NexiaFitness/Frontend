/**
 * trainingPlanNavigation.ts — URLs canónicas plan ↔ cliente
 *
 * Tras consolidación UX (2026-05): el detalle operativo del plan vive en
 * `/dashboard/clients/:clientId?tab=planning&plan=:planId`.
 * `/dashboard/training-plans/:id` redirige aquí si el plan tiene cliente.
 */

import {
    clearBlockAuthorParams,
    clearBlockWeeksParam,
    isBlockAuthoringActive,
    parseBlockAuthorParams,
    parseBlockWeeksId,
} from "@/utils/blockAuthoringUrl";
import {
    clearPlanningMode,
    clearPlanningView,
    isPlanningAnalyticsView,
    isPlanningCreateWhenMode,
    isPlanningPlansHistoryView,
} from "@/utils/planningHubUrl";

export type ClientDetailTab = "overview" | "sessions" | "daily-coherence" | "testing" | "progress" | "planning" | "injuries";

export const CLIENT_DETAIL_HOME_TAB: ClientDetailTab = "overview";

const CLIENT_DETAIL_JOURNEY_QUERY_KEYS = [
    "plan",
    "planTab",
    "subtab",
    "qp",
    "focus",
] as const;

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

/** Resumen del cliente: tab overview sin sub-journeys (plan, bloque, analytics, …). */
export function buildClientHomePath(clientId: number): string {
    return `/dashboard/clients/${clientId}?tab=${CLIENT_DETAIL_HOME_TAB}`;
}

export function isClientDetailHomeSearchParams(params: URLSearchParams): boolean {
    const tab = params.get("tab");
    if (tab != null && tab !== CLIENT_DETAIL_HOME_TAB) {
        return false;
    }
    for (const key of CLIENT_DETAIL_JOURNEY_QUERY_KEYS) {
        if (params.get(key)) {
            return false;
        }
    }
    if (isBlockAuthoringActive(parseBlockAuthorParams(params))) {
        return false;
    }
    if (parseBlockWeeksId(params) != null) {
        return false;
    }
    if (
        isPlanningCreateWhenMode(params) ||
        isPlanningAnalyticsView(params) ||
        isPlanningPlansHistoryView(params)
    ) {
        return false;
    }
    return true;
}

export function applyClientDetailHomeSearchParams(prev: URLSearchParams): URLSearchParams {
    let next = new URLSearchParams(prev);
    for (const key of CLIENT_DETAIL_JOURNEY_QUERY_KEYS) {
        next.delete(key);
    }
    next = clearBlockAuthorParams(next);
    next = clearBlockWeeksParam(next);
    next = clearPlanningMode(next);
    next = clearPlanningView(next);
    next.set("tab", CLIENT_DETAIL_HOME_TAB);
    return next;
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
