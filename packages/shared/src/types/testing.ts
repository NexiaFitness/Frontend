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
 * Resultado de test con cálculos de progreso (backend)
 */
export interface TestResultWithProgress extends PhysicalTestResultOut {
    baseline_value: number | null;
    baseline_date: string | null; // ISO date
    progress_percentage: number | null; // % change from baseline
    trend: "improving" | "stable" | "declining" | "unknown" | null;
}

/**
 * Perfil de cualidades físicas (para radar chart)
 */
export interface PhysicalQualityProfile {
    strength: number; // 0-100 score
    power: number; // 0-100 score
    speed: number; // 0-100 score
    aerobic: number; // 0-100 score
    anaerobic: number; // 0-100 score
    mobility: number; // 0-100 score
}

/**
 * Punto de tendencia para gráficos de progresión
 */
export interface TestTrendPoint {
    test_date: string; // ISO date
    value: number;
    unit: string;
    progress_percentage: number | null;
    test_name: string;
    test_id: number;
}

/**
 * Datos de repetición (para tests RSA)
 */
export interface RepetitionData {
    repetition_number: number; // 1, 2, 3, etc.
    value: number;
    unit: string;
}

/**
 * Análisis de fatiga (para tests RSA)
 */
export interface TestFatigueAnalysis {
    best_value: number;
    worst_value: number;
    fatigue_index_percentage: number; // ((worst - best) / best) * 100
    acceptable_range: string | null; // e.g., "acceptable range", "high fatigue"
}

/**
 * Datos de tendencia por categoría
 */
export interface CategoryTrendData {
    category: string;
    test_name: string;
    test_id: number;
    trend_points: TestTrendPoint[];
    baseline_value: number | null;
    baseline_date: string | null; // ISO date
    test_frequency_weeks: number | null;
    latest_surface: string | null; // e.g., "Track", "Treadmill"
    latest_repetitions: RepetitionData[] | null; // For tests with multiple reps
    latest_fatigue_analysis: TestFatigueAnalysis | null; // Calculated from latest repetitions
}

/**
 * Comparación bilateral (para tests de movilidad)
 */
export interface BilateralComparisonPoint {
    joint: string; // e.g., "Ankle", "Knee", "Hip", "Shoulder", "Elbow"
    left_value: number | null;
    right_value: number | null;
    unit: string; // e.g., "°"
}

/**
 * Test próximo a realizar
 */
export interface UpcomingTest {
    test_id: number;
    test_name: string;
    category: string;
    last_test_date: string; // ISO date
    next_due_date: string; // ISO date
}

/**
 * Resumen completo de testing (ACTUALIZADO - alineado con backend)
 */
export interface ClientTestingSummary {
    client_id: number;
    physical_quality_profile: PhysicalQualityProfile;
    latest_tests_by_category: Record<string, TestResultWithProgress | null>; // Dict[str, Optional[TestResultWithProgress]]
    category_trends: CategoryTrendData[]; // Trend data for charts
    upcoming_tests: UpcomingTest[]; // Tests due for repetition
    profile_analysis: string; // Auto-generated analysis text
    bilateral_comparison: BilateralComparisonPoint[] | null; // For mobility tests: joint ROM left vs right
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


