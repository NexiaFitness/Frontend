/**
 * Integridad clientId / planId en create-session (IMPL: con planId, cliente canónico = plan.client_id).
 */

export type CreateSessionClientPlanContext =
    | { status: "pending" }
    | { status: "ready"; effectiveClientId: number }
    | {
          status: "mismatch";
          queryClientId: number;
          planClientId: number;
      };

export function resolveCreateSessionClientContext(input: {
    queryClientId: number | null;
    planId: number | null;
    planClientId: number | null | undefined;
    isPlanLoading: boolean;
}): CreateSessionClientPlanContext {
    const { queryClientId, planId, planClientId, isPlanLoading } = input;

    if (planId) {
        if (isPlanLoading || planClientId == null || planClientId <= 0) {
            return { status: "pending" };
        }
        if (
            queryClientId != null &&
            queryClientId > 0 &&
            queryClientId !== planClientId
        ) {
            return {
                status: "mismatch",
                queryClientId,
                planClientId,
            };
        }
        return { status: "ready", effectiveClientId: planClientId };
    }

    if (queryClientId != null && queryClientId > 0) {
        return { status: "ready", effectiveClientId: queryClientId };
    }

    return { status: "pending" };
}
