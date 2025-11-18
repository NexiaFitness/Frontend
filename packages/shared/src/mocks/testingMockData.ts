/**
 * testingMockData.ts — Mock data para Testing Tab
 *
 * Contexto:
 * - Datos de prueba mientras backend implementa CRUD de tests
 * - Estructura basada en Figma y categorías de fitness testing
 *
 * @author Frontend Team
 * @since v5.2.0
 */

export type TestCategory = "strength" | "power" | "speed" | "aerobic" | "anaerobic" | "mobility";

export interface TestData {
    id: number;
    client_id: number;
    category: TestCategory;
    test_name: string;
    value: number;
    unit: string;
    test_date: string; // ISO date
    notes?: string;
}

export const MOCK_TESTING_DATA: TestData[] = [
    // Strength
    { id: 1, client_id: 1, category: "strength", test_name: "1RM Bench Press", value: 80, unit: "kg", test_date: "2024-01-15", notes: "Buen progreso" },
    { id: 2, client_id: 1, category: "strength", test_name: "1RM Back Squat", value: 120, unit: "kg", test_date: "2024-01-15" },
    { id: 3, client_id: 1, category: "strength", test_name: "1RM Deadlift", value: 140, unit: "kg", test_date: "2024-01-15" },
    
    // Power
    { id: 4, client_id: 1, category: "power", test_name: "CMJ (Countermovement Jump)", value: 45, unit: "cm", test_date: "2024-01-16" },
    { id: 5, client_id: 1, category: "power", test_name: "SJ (Squat Jump)", value: 42, unit: "cm", test_date: "2024-01-16" },
    { id: 6, client_id: 1, category: "power", test_name: "Broad Jump", value: 2.3, unit: "m", test_date: "2024-01-16" },
    
    // Speed
    { id: 7, client_id: 1, category: "speed", test_name: "10m Sprint", value: 1.8, unit: "s", test_date: "2024-01-17" },
    { id: 8, client_id: 1, category: "speed", test_name: "30m Sprint", value: 4.2, unit: "s", test_date: "2024-01-17" },
    
    // Aerobic
    { id: 9, client_id: 1, category: "aerobic", test_name: "VO2max", value: 52, unit: "ml/kg/min", test_date: "2024-01-18" },
    { id: 10, client_id: 1, category: "aerobic", test_name: "Cooper Test", value: 2800, unit: "m", test_date: "2024-01-18" },
    
    // Anaerobic
    { id: 11, client_id: 1, category: "anaerobic", test_name: "RSA (Repeated Sprint Ability)", value: 28, unit: "s", test_date: "2024-01-19" },
    { id: 12, client_id: 1, category: "anaerobic", test_name: "500m Row", value: 92, unit: "s", test_date: "2024-01-19" },
    
    // Mobility
    { id: 13, client_id: 1, category: "mobility", test_name: "Sit & Reach", value: 25, unit: "cm", test_date: "2024-01-20" },
    { id: 14, client_id: 1, category: "mobility", test_name: "FMS Score", value: 16, unit: "points", test_date: "2024-01-20" },
];

export const TEST_CATEGORIES: Record<TestCategory, { label: string; color: string }> = {
    strength: { label: "Fuerza", color: "#DC2626" },
    power: { label: "Potencia", color: "#EA580C" },
    speed: { label: "Velocidad", color: "#CA8A04" },
    aerobic: { label: "Aeróbico", color: "#16A34A" },
    anaerobic: { label: "Anaeróbico", color: "#2563EB" },
    mobility: { label: "Movilidad", color: "#9333EA" },
};

