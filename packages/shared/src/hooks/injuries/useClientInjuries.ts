/**
 * useClientInjuries.ts — Hook principal para gestión de lesiones del cliente
 *
 * Orquesta:
 * - Historial completo
 * - Lesiones activas
 * - Enriquecimiento con nombres de joints/movements/muscles
 *
 * @author Nelson Valero
 * @since v5.7.0
 */

import { useMemo } from "react";
import {
    useGetClientInjuriesQuery,
    useGetClientActiveInjuriesQuery,
    useGetJointsQuery,
    useGetMusclesQuery,
} from "../../api/injuriesApi";
import type { ClientInjury, InjuryWithDetails } from "../../types/injuries";

interface UseClientInjuriesParams {
    clientId: number;
    includeHistory?: boolean;
}

interface UseClientInjuriesResult {
    // Datos
    activeInjuries: InjuryWithDetails[];
    historyInjuries: InjuryWithDetails[];

    // Estados
    isLoadingActive: boolean;
    isLoadingHistory: boolean;

    // Flags
    hasActiveInjuries: boolean;
    totalInjuries: number;
}

export const useClientInjuries = ({
    clientId,
    includeHistory = true,
}: UseClientInjuriesParams): UseClientInjuriesResult => {
    // =========================================================================
    // QUERIES
    // =========================================================================

    const {
        data: activeInjuriesRaw = [],
        isLoading: isLoadingActive,
    } = useGetClientActiveInjuriesQuery(clientId);

    const {
        data: historyInjuriesRaw = [],
        isLoading: isLoadingHistory,
    } = useGetClientInjuriesQuery(clientId, {
        skip: !includeHistory,
    });

    const { data: joints = [] } = useGetJointsQuery();
    const { data: muscles = [] } = useGetMusclesQuery();

    // =========================================================================
    // ENRIQUECIMIENTO DE DATOS
    // =========================================================================

    const enrichInjury = (injury: ClientInjury): InjuryWithDetails => {
        const joint = joints.find((j) => j.id === injury.joint_id);
        const muscle = muscles.find((m) => m.id === injury.affected_muscle_id);

        return {
            ...injury,
            joint_name: joint?.name,
            muscle_name: muscle?.name,
            // movement_name se podría enriquecer si cacheamos movements
        };
    };

    const activeInjuries = useMemo(
        () => activeInjuriesRaw.map(enrichInjury),
        [activeInjuriesRaw, joints, muscles]
    );

    const historyInjuries = useMemo(
        () => historyInjuriesRaw.map(enrichInjury),
        [historyInjuriesRaw, joints, muscles]
    );

    // =========================================================================
    // COMPUTED VALUES
    // =========================================================================

    const hasActiveInjuries = activeInjuries.length > 0;
    const totalInjuries = historyInjuries.length;

    return {
        activeInjuries,
        historyInjuries,
        isLoadingActive,
        isLoadingHistory,
        hasActiveInjuries,
        totalInjuries,
    };
};







