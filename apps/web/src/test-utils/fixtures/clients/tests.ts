/**
 * Tests Fixtures - Factory para generar datos de tests físicos
 *
 * Alineado 100% con PhysicalTestResultOut de packages/shared/src/types/testing.ts
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { PhysicalTestResultOut } from "@nexia/shared/types/testing";

export const createMockTestResult = (overrides: Partial<PhysicalTestResultOut> = {}): PhysicalTestResultOut => ({
    id: 1,
    client_id: 1,
    test_id: 1,
    trainer_id: 1,
    test_date: new Date().toISOString().split('T')[0],
    value: 100,
    unit: "kg",
    is_baseline: false,
    notes: null,
    surface: null,
    conditions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    ...overrides,
});

