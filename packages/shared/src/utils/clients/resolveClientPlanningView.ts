/**
 * resolveClientPlanningView — Contrato de vista tab Planificación (cliente).
 *
 * Reglas alineadas con CONSOLIDACION_VISTA_PLAN_EN_CLIENTE.md:
 * - Sin ?plan= válido → plan activo o hub.
 * - ?plan= obsoleto (404 / otro cliente) → sanear URL y activo o hub.
 */

import { getMutationErrorMessage } from "../errorMessage";

export type FocusedPlanFetchErrorKind = "none" | "not_found" | "recoverable";

export interface ResolveClientPlanningViewParams {
    clientId: number;
    focusPlanId: number | null;
    activePlanId: number | null | undefined;
    focusedFetchEnabled: boolean;
    focusedFetchLoading: boolean;
    focusedPlan: { id: number; client_id: number | null } | null | undefined;
    focusedFetchErrorKind: FocusedPlanFetchErrorKind;
    focusedFetchErrorMessage?: string;
}

export type ClientPlanningViewKind = "loading" | "hub" | "recoverable_error" | "plan_detail";

export interface ClientPlanningViewResolution {
    kind: ClientPlanningViewKind;
    planSource?: "active" | "focused";
    sanitizePlanParam: boolean;
    errorMessage?: string;
}

/** Clasifica error de GET /training-plans/:id para resolución de vista. */
export function classifyFocusedPlanFetchError(
    isError: boolean,
    error: unknown,
    plan: unknown | null | undefined,
): FocusedPlanFetchErrorKind {
    if (!isError && plan != null) {
        return "none";
    }
    if (isTrainingPlanFetchNotFound(isError, error)) {
        return "not_found";
    }
    if (isError || plan == null) {
        return "recoverable";
    }
    return "none";
}

export function isTrainingPlanFetchNotFound(isError: boolean, error: unknown): boolean {
    if (!isError || error == null || typeof error !== "object") {
        return false;
    }
    if ("status" in error) {
        const status = (error as { status: unknown }).status;
        if (status === 404 || status === "PARSING_ERROR") {
            return true;
        }
    }
    return getMutationErrorMessage(error).toLowerCase().includes("not found");
}

export function resolveClientPlanningView(
    params: ResolveClientPlanningViewParams,
): ClientPlanningViewResolution {
    const {
        clientId,
        focusPlanId,
        activePlanId,
        focusedFetchEnabled,
        focusedFetchLoading,
        focusedPlan,
        focusedFetchErrorKind,
        focusedFetchErrorMessage,
    } = params;

    if (!clientId || clientId <= 0) {
        return { kind: "loading", sanitizePlanParam: false };
    }

    const hasFocus = focusPlanId != null && focusPlanId > 0;
    const hasActive = activePlanId != null && activePlanId > 0;

    const fallbackFromStaleFocus = (): ClientPlanningViewResolution => {
        if (hasActive) {
            return {
                kind: "plan_detail",
                planSource: "active",
                sanitizePlanParam: true,
            };
        }
        return { kind: "hub", sanitizePlanParam: true };
    };

    if (hasFocus) {
        if (hasActive && activePlanId === focusPlanId) {
            return {
                kind: "plan_detail",
                planSource: "active",
                sanitizePlanParam: false,
            };
        }
        if (focusedFetchEnabled) {
            if (focusedFetchLoading) {
                return { kind: "loading", sanitizePlanParam: false };
            }
            if (focusedFetchErrorKind === "not_found") {
                return fallbackFromStaleFocus();
            }
            if (focusedFetchErrorKind === "recoverable") {
                return {
                    kind: "recoverable_error",
                    sanitizePlanParam: false,
                    errorMessage:
                        focusedFetchErrorMessage ??
                        "No se pudo cargar el plan. Inténtalo de nuevo.",
                };
            }
            if (focusedPlan) {
                if (focusedPlan.client_id !== clientId) {
                    return fallbackFromStaleFocus();
                }
                return {
                    kind: "plan_detail",
                    planSource: "focused",
                    sanitizePlanParam: false,
                };
            }
            return fallbackFromStaleFocus();
        }
    }

    if (hasActive) {
        return {
            kind: "plan_detail",
            planSource: "active",
            sanitizePlanParam: false,
        };
    }

    return { kind: "hub", sanitizePlanParam: false };
}
