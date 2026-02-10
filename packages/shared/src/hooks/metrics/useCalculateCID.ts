/**
 * hooks/metrics/useCalculateCID.ts - Hook para cálculo de CID
 * Calcula Carga Interna Diaria de una sesión.
 * Migrado a V2: usa useLazyCalculateCidV2Query (POST /metrics/cid).
 *
 * @author Nelson Valero
 * @since v5.6.0
 */

import { useCallback } from "react";
import { useLazyCalculateCidV2Query } from "../../api/metricsApiV2";
import type { LOAD_TYPE, CIDCalculation, CIDCalcIn } from "../../types/metrics";

interface CalculateCIDParams {
    volume: number;
    intensity: number;
    durationMinutes?: number;
    loadType: (typeof LOAD_TYPE)[keyof typeof LOAD_TYPE];
    experiencia?: "Baja" | "Media" | "Alta";
    clientId: number;
    trainerId?: number;
    sessionDate: string; // ISO date
}

interface CalculateCIDSuccessResult {
    success: true;
    data: CIDCalculation;
}

interface CalculateCIDErrorResult {
    success: false;
    error: unknown;
}

type CalculateCIDResultType = CalculateCIDSuccessResult | CalculateCIDErrorResult;

function kExperienciaFrom(experiencia?: "Baja" | "Media" | "Alta"): number {
    if (experiencia === "Baja") return 0.8;
    if (experiencia === "Alta") return 1.1;
    return 1.0;
}

export const useCalculateCID = () => {
    const [calculateCidTrigger, { isLoading, error }] = useLazyCalculateCidV2Query();

    const calculateCID = useCallback(
        async (params: CalculateCIDParams): Promise<CalculateCIDResultType> => {
            try {
                const payload: CIDCalcIn = {
                    volumen_level: Math.min(10, Math.max(1, params.volume)),
                    intensidad_level: Math.min(10, Math.max(1, params.intensity)),
                    k_fase: 1.0,
                    k_experiencia: kExperienciaFrom(params.experiencia),
                    p: 1.0,
                };

                const result = await calculateCidTrigger(payload).unwrap();

                const data: CIDCalculation = {
                    load_type: params.loadType,
                    cid_score: result.cid_0_100,
                    status: "info",
                    alerts: [],
                };

                return {
                    success: true,
                    data,
                };
            } catch (err) {
                console.error("Error calculating CID:", err);
                return {
                    success: false,
                    error: err,
                };
            }
        },
        [calculateCidTrigger]
    );

    return {
        calculateCID,
        isCalculating: isLoading,
        error,
    };
};

