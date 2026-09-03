/**
 * fetchPeriodBlocksForVerify.ts — Refetch HTTP directo para verificación fail-closed O9.
 *
 * Evita servir caché RTK obsoleta tras materialize; MSW y backend real comparten la misma URL.
 */

import { API_CONFIG, AUTH_CONFIG } from "@nexia/shared/config/constants";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";

import { QuickProgramMaterializeVerificationError } from "./quickProgramMaterializeVerify";

function readAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    } catch {
        return null;
    }
}

export async function fetchPeriodBlocksForVerify(
    planId: number,
): Promise<PlanPeriodBlock[]> {
    const token = readAuthToken();
    const response = await fetch(
        `${API_CONFIG.BASE_URL}/training-plans/${planId}/period-blocks`,
        {
            headers: {
                Accept: "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        },
    );

    if (!response.ok) {
        throw new QuickProgramMaterializeVerificationError(
            "No se pudo refrescar la planificación tras crear los bloques.",
        );
    }

    return (await response.json()) as PlanPeriodBlock[];
}
