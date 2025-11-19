/**
 * testing.ts — Tipos TypeScript para Physical Tests
 *
 * Contexto:
 * - Tipos para tests físicos y resultados
 * - Usado por ClientTestingTab y hooks relacionados
 * - Alineado con estructura de datos del backend
 *
 * @author Frontend Team
 * @since v5.2.0
 * @updated v5.5.0 - Tipos actualizados para coincidir con backend real
 */

// ========================================
// TIPOS DEL BACKEND (snake_case)
// ========================================

/**
 * Definición de test físico (backend)
 */
export interface PhysicalTestOut {
    id: number;
    name: string;
    category: TestCategory;
    description: string | null;
    unit: string;
    is_standard: boolean;
    default_frequency_weeks: number | null;
    formula: string | null;
    notes: string | null;
    created_by_trainer_id: number | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

/**
 * Resultado de test físico (backend)
 */
export interface PhysicalTestResultOut {
    id: number;
    client_id: number;
    test_id: number;
    trainer_id: number;
    test_date: string; // ISO date
    value: number;
    unit: string;
    is_baseline: boolean;
    notes: string | null;
    surface: string | null;
    conditions: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}

/**
 * Resumen de tests del cliente (backend)
 */
export interface ClientTestingSummary {
    client_id: number;
    total_tests: number;
    tests_by_category: Record<TestCategory, number>;
    latest_test_date: string | null; // ISO date
    baseline_tests_count: number;
}

// ========================================
// TIPOS TRANSFORMADOS (camelCase para UI)
// ========================================

/**
 * Categorías de tests físicos
 */
export type TestCategory = "strength" | "power" | "speed" | "aerobic" | "anaerobic" | "mobility";

/**
 * Test físico con información completa (transformado)
 */
export interface TestData {
    id: number;
    clientId: number;
    testId: number;
    testName: string;
    category: TestCategory;
    value: number;
    unit: string;
    testDate: string; // ISO date
    notes: string | null;
    isBaseline: boolean;
    surface: string | null;
    conditions: string | null;
}

/**
 * Información de categoría de test
 */
export interface TestCategoryInfo {
    label: string;
    color: string;
}

/**
 * Mapa de categorías con sus etiquetas y colores
 */
export const TEST_CATEGORIES: Record<TestCategory, TestCategoryInfo> = {
    strength: { label: "Fuerza", color: "#DC2626" },
    power: { label: "Potencia", color: "#EA580C" },
    speed: { label: "Velocidad", color: "#CA8A04" },
    aerobic: { label: "Aeróbico", color: "#16A34A" },
    anaerobic: { label: "Anaeróbico", color: "#2563EB" },
    mobility: { label: "Movilidad", color: "#9333EA" },
} as const;

// ========================================
// TIPOS PARA CREAR/ACTUALIZAR
// ========================================

/**
 * Datos para crear un resultado de test
 */
export interface CreateTestResultData {
    client_id: number;
    test_id: number;
    trainer_id: number;
    test_date: string; // ISO date
    value: number;
    unit: string;
    is_baseline?: boolean;
    notes?: string | null;
    surface?: string | null;
    conditions?: string | null;
}

/**
 * Datos para actualizar un resultado de test
 */
export interface UpdateTestResultData {
    test_date?: string; // ISO date
    value?: number;
    unit?: string;
    is_baseline?: boolean;
    notes?: string | null;
    surface?: string | null;
    conditions?: string | null;
}


