/**
 * planningHubUrl.ts — Query params del hub de planificación (selección de rango · analytics).
 *
 * `planningMode=createBlock` activa selección inline de fechas en PlanningExploreShell.
 */

import {
    clearBlockAuthorParams,
    clearBlockWeeksParam,
} from "@/utils/blockAuthoringUrl";

export const PLANNING_MODE_CREATE_BLOCK = "createBlock";
export const PLANNING_VIEW_ANALYTICS = "analytics";
export const PLANNING_VIEW_PLANS_HISTORY = "plansHistory";

export function isPlanningCreateWhenMode(params: URLSearchParams): boolean {
    return params.get("planningMode") === PLANNING_MODE_CREATE_BLOCK;
}

export function isPlanningAnalyticsView(params: URLSearchParams): boolean {
    return params.get("planningView") === PLANNING_VIEW_ANALYTICS;
}

export function isPlanningPlansHistoryView(params: URLSearchParams): boolean {
    return params.get("planningView") === PLANNING_VIEW_PLANS_HISTORY;
}

export function applyPlanningModeCreateBlock(
    prev: URLSearchParams,
): URLSearchParams {
    const next = new URLSearchParams(prev);
    next.set("planningMode", PLANNING_MODE_CREATE_BLOCK);
    next.delete("planningView");
    return next;
}

export function clearPlanningMode(prev: URLSearchParams): URLSearchParams {
    const next = new URLSearchParams(prev);
    next.delete("planningMode");
    return next;
}

export function applyPlanningViewAnalytics(
    prev: URLSearchParams,
): URLSearchParams {
    const next = new URLSearchParams(prev);
    next.set("planningView", PLANNING_VIEW_ANALYTICS);
    next.delete("planningMode");
    return next;
}

export function applyPlanningViewPlansHistory(
    prev: URLSearchParams,
): URLSearchParams {
    const next = new URLSearchParams(prev);
    next.set("planningView", PLANNING_VIEW_PLANS_HISTORY);
    next.delete("planningMode");
    return next;
}

export function clearPlanningView(prev: URLSearchParams): URLSearchParams {
    const next = new URLSearchParams(prev);
    next.delete("planningView");
    return next;
}

export function resetPlanningSubJourneyParams(
    prev: URLSearchParams,
): URLSearchParams {
    let next = new URLSearchParams(prev);
    next.delete("qp");
    next = clearBlockAuthorParams(next);
    next = clearBlockWeeksParam(next);
    next = clearPlanningMode(next);
    next = clearPlanningView(next);
    next.set("tab", "planning");
    return next;
}
