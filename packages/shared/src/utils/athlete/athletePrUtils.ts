/**
 * athletePrUtils.ts — Detección de PR en ejecución atleta (F2-FE-10).
 */

import type { ProgressTracking } from "../../types/progress";

export interface AthletePrCheckResult {
    isPr: boolean;
    previousMaxWeight: number | null;
}

/** PR por peso: supera el max_weight histórico del ejercicio. */
export function checkWeightPersonalRecord(
    weight: number,
    tracking: ProgressTracking[]
): AthletePrCheckResult {
    if (!Number.isFinite(weight) || weight <= 0) {
        return { isPr: false, previousMaxWeight: null };
    }

    let previousMax = 0;
    for (const row of tracking) {
        const w = row.max_weight ?? 0;
        if (w > previousMax) previousMax = w;
    }

    if (previousMax <= 0) {
        return { isPr: false, previousMaxWeight: null };
    }

    return {
        isPr: weight > previousMax,
        previousMaxWeight: previousMax,
    };
}
