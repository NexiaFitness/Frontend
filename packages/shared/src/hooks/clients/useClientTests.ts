/**
 * useClientTests.ts — Hook para datos de Physical Tests
 *
 * Contexto:
 * - Encapsula lógica de transformación de datos de tests físicos
 * - Usa RTK Query para consumir endpoints reales del backend
 * - Transforma datos del backend (snake_case) a formato frontend (camelCase)
 * - Agrupa tests por categoría y enriquece con información de definiciones
 *
 * @author Frontend Team
 * @since v5.5.0
 */

import { useMemo } from "react";
import {
    useGetClientTestResultsQuery,
    useGetPhysicalTestsQuery,
} from "../../api/clientsApi";
import type {
    TestData,
    PhysicalTestResultOut,
    PhysicalTestOut,
    TestCategory,
} from "../../types/testing";

interface UseClientTestsReturn {
    tests: TestData[];
    testsByCategory: Record<TestCategory, TestData[]>;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
}

/**
 * Transforma un resultado de test del backend al formato esperado por el componente
 */
const transformTestResult = (
    result: PhysicalTestResultOut,
    testDefinition: PhysicalTestOut | undefined
): TestData => {
    return {
        id: result.id,
        clientId: result.client_id,
        testId: result.test_id,
        testName: testDefinition?.name || `Test ${result.test_id}`,
        category: (testDefinition?.category || "strength") as TestCategory,
        value: result.value,
        unit: result.unit,
        testDate: result.test_date,
        notes: result.notes,
        isBaseline: result.is_baseline,
        surface: result.surface,
        conditions: result.conditions,
    };
};

/**
 * Hook para obtener y transformar datos de tests físicos de un cliente
 * @param clientId - ID del cliente
 * @param category - Categoría opcional para filtrar tests
 * @returns Datos transformados listos para usar en el componente
 */
export const useClientTests = (
    clientId: number,
    category?: TestCategory
): UseClientTestsReturn => {
    // Obtener resultados de tests del cliente
    const {
        data: testResults = [],
        isLoading: isLoadingResults,
        isError: isErrorResults,
        refetch: refetchResults,
    } = useGetClientTestResultsQuery(
        {
            clientId,
            category: category || undefined,
        },
        {
            refetchOnMountOrArgChange: true,
            refetchOnFocus: false,
            refetchOnReconnect: true,
        }
    );

    // Obtener todas las definiciones de tests para enriquecer los resultados
    const {
        data: testDefinitions = [],
        isLoading: isLoadingDefinitions,
        isError: isErrorDefinitions,
    } = useGetPhysicalTestsQuery(
        {},
        {
            refetchOnMountOrArgChange: false,
            refetchOnFocus: false,
            refetchOnReconnect: false,
        }
    );

    // Crear un mapa de test_id -> test definition para lookup rápido
    const testDefinitionsMap = useMemo(() => {
        const map = new Map<number, PhysicalTestOut>();
        testDefinitions.forEach((test) => {
            map.set(test.id, test);
        });
        return map;
    }, [testDefinitions]);

    // Transformar resultados de tests
    const tests: TestData[] = useMemo(() => {
        if (!testResults || testResults.length === 0) {
            return [];
        }

        return testResults
            .filter((result) => result.is_active)
            .map((result) => {
                const testDefinition = testDefinitionsMap.get(result.test_id);
                return transformTestResult(result, testDefinition);
            })
            .sort((a, b) => {
                // Ordenar por fecha descendente (más recientes primero)
                return new Date(b.testDate).getTime() - new Date(a.testDate).getTime();
            });
    }, [testResults, testDefinitionsMap]);

    // Agrupar tests por categoría
    const testsByCategory = useMemo(() => {
        const grouped: Record<TestCategory, TestData[]> = {
            strength: [],
            power: [],
            speed: [],
            aerobic: [],
            anaerobic: [],
            mobility: [],
        };

        tests.forEach((test) => {
            if (grouped[test.category]) {
                grouped[test.category].push(test);
            }
        });

        return grouped;
    }, [tests]);

    const isLoading = isLoadingResults || isLoadingDefinitions;
    const isError = isErrorResults || isErrorDefinitions;

    return {
        tests,
        testsByCategory,
        isLoading,
        isError,
        refetch: refetchResults,
    };
};


