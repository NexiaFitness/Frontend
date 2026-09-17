/**
 * R12 / G23 — plan de programa en create-session debe coincidir con active-by-client para la fecha.
 */

export type ProgramPlanActivationStatus =
    | "loading"
    | "ok"
    | "no_active_plan"
    | "plan_not_active";

export function resolveProgramPlanActivationForDate(input: {
    isLoading: boolean;
    requestedPlanId: number | null;
    activePlanId: number | null | undefined;
}): ProgramPlanActivationStatus {
    const { isLoading, requestedPlanId, activePlanId } = input;
    if (isLoading) return "loading";
    if (!requestedPlanId || requestedPlanId <= 0) return "ok";
    if (!activePlanId || activePlanId <= 0) return "no_active_plan";
    if (activePlanId !== requestedPlanId) return "plan_not_active";
    return "ok";
}

export const PROGRAM_PLAN_NOT_ACTIVE_COPY =
    "Este plan no está activo para la fecha seleccionada. Usa el plan vigente del cliente o cambia la fecha.";

export const PROGRAM_PLAN_NO_ACTIVE_FOR_DATE_COPY =
    "No hay un plan activo del cliente para esta fecha. Asigna un plan o crea una sesión suelta.";
