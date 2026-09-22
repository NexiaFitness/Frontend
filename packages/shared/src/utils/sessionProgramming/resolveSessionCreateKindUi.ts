/**
 * D2 UI — Cuándo mostrar segmented Programa | Sesión suelta (solo ambigüedad real).
 *
 * Flujo feliz (plan + día sin sesión): variant "none" — sin ruido en el constructor.
 * Coexistencia mismo día: SessionDayCoexistenceNotice (QA-9), no escape fijo arriba.
 */

import type { SessionCreateKind } from "./resolveSessionCreateKind";

export type SessionCreateKindUi =
    | { variant: "none" }
    | { variant: "segmented" }
    | {
          variant: "implicit_standalone";
          showProgramSwitch: boolean;
      };

export interface ResolveSessionCreateKindUiInput {
    sessionKind: SessionCreateKind;
    planIdFromUrl: number | null;
    activePlanCoversDate: boolean;
    programPlanActivationOk: boolean;
    inProgramPhaseWithPlannedValues: boolean;
    existingSessionsOnDayCount: number;
}

export function isProgramCreateContextLocked(input: {
    planIdFromUrl: number | null;
    activePlanCoversDate: boolean;
    programPlanActivationOk: boolean;
    inProgramPhaseWithPlannedValues: boolean;
}): boolean {
    if (input.planIdFromUrl != null && input.planIdFromUrl > 0) {
        return input.programPlanActivationOk;
    }
    return (
        input.activePlanCoversDate &&
        input.programPlanActivationOk &&
        input.inProgramPhaseWithPlannedValues
    );
}

export function resolveSessionCreateKindUi(
    input: ResolveSessionCreateKindUiInput,
): SessionCreateKindUi {
    const lockedProgram = isProgramCreateContextLocked({
        planIdFromUrl: input.planIdFromUrl,
        activePlanCoversDate: input.activePlanCoversDate,
        programPlanActivationOk: input.programPlanActivationOk,
        inProgramPhaseWithPlannedValues: input.inProgramPhaseWithPlannedValues,
    });

    if (input.sessionKind === "program" && lockedProgram) {
        return { variant: "none" };
    }

    if (
        input.sessionKind === "standalone" &&
        !input.activePlanCoversDate &&
        input.existingSessionsOnDayCount === 0
    ) {
        return { variant: "none" };
    }

    if (input.sessionKind === "standalone" && input.activePlanCoversDate) {
        return {
            variant: "implicit_standalone",
            showProgramSwitch: true,
        };
    }

    return { variant: "segmented" };
}
