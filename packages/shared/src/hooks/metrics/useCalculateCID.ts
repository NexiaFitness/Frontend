/**
 * hooks/metrics/useCalculateCID.ts - Hook para cálculo de CID
 * Calcula Carga Interna Diaria de una sesión
 *
 * @author Nelson Valero
 * @since v5.6.0
 */

import { useCallback } from "react";
import { useCalculateCIDMutation } from "../../api/metricsApi";
import type { CalculateCIDRequest, LOAD_TYPE, CIDCalculation } from "../../types/metrics";

interface CalculateCIDParams {
    volume: number;
    intensity: number;
    durationMinutes?: number;
    loadType: (typeof LOAD_TYPE)[keyof typeof LOAD_TYPE];
    experiencia?: "Baja" | "Media" | "Alta";
    clientId: number;
    trainerId?: number;
    sessionDate: string; // ISO date - required by SessionContext
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

export const useCalculateCID = () => {
    const [calculateCIDMutation, { isLoading, error }] = useCalculateCIDMutation();

    const calculateCID = useCallback(
        async (params: CalculateCIDParams): Promise<CalculateCIDResultType> => {
            try {
                const payload: CalculateCIDRequest = {
                    client_id: params.clientId,
                    trainer_id: params.trainerId,
                    session_date: params.sessionDate,
                    load_type: params.loadType,
                    intensity: params.intensity,
                    volume: params.volume,
                    duration_minutes: params.durationMinutes,
                    experiencia: params.experiencia,
                };

                const result = await calculateCIDMutation(payload).unwrap();

                return {
                    success: true,
                    data: result,
                };
            } catch (err) {
                console.error("Error calculating CID:", err);
                return {
                    success: false,
                    error: err,
                };
            }
        },
        [calculateCIDMutation]
    );

    return {
        calculateCID,
        isCalculating: isLoading,
        error,
    };
};

