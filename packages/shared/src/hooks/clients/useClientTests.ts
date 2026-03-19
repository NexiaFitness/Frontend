/**
 * useClientTests.ts — Hook para datos de Physical Tests
 *
 * Contexto:
 * - Encapsula lógica de transformación de datos de tests físicos
 * - Usa RTK Query para consumir endpoint de summary completo del backend
 * - Proporciona acceso a todos los datos necesarios para visualizaciones (radar chart, line charts, etc.)
 *
 * @author Frontend Team
 * @since v5.5.0
 * @updated v5.6.0 - Actualizado para usar endpoint de summary completo
 */

import { useGetClientTestingSummaryQuery } from "../../api/clientsApi";
import type { ClientTestingSummary } from "../../types/testing";

export interface UseClientTestsReturn {
    summary: ClientTestingSummary | null;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
}

/**
 * Hook ACTUALIZADO para usar summary endpoint completo
 * 
 * Este hook ahora consume el endpoint completo que incluye:
 * - physical_quality_profile: Datos para radar chart
 * - latest_tests_by_category: Tests más recientes con % de progreso vs baseline
 * - category_trends: Datos históricos para gráficos de línea
 * - upcoming_tests: Tests próximos a realizar
 * - profile_analysis: Análisis automático del perfil
 * - bilateral_comparison: Comparación izquierda/derecha para movilidad
 * 
 * @param clientId - ID del cliente
 * @returns Resumen completo de testing con todos los datos necesarios
 */
export const useClientTests = (
    clientId: number
): UseClientTestsReturn => {
    // Usar el endpoint de summary completo
    const {
        data: summary,
        isLoading,
        isError,
        refetch,
    } = useGetClientTestingSummaryQuery(clientId, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: false,
        refetchOnReconnect: true,
    });

    // Retornar datos completos
    return {
        summary: summary || null,
        isLoading,
        isError,
        refetch,
    };
};


