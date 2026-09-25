/**
 * adminPhysicalTests.ts — Tipos Portal Admin T1/T2 (tests físicos).
 *
 * Contratos: /admin/physical-tests*
 */

export const PHYSICAL_TEST_CATEGORIES = [
    "strength",
    "power",
    "speed",
    "aerobic",
    "anaerobic",
    "mobility",
] as const;

export type PhysicalTestCategory = (typeof PHYSICAL_TEST_CATEGORIES)[number];

export type PhysicalTestScope = "standard" | "trainer";

export interface AdminPhysicalTestOut {
    id: number;
    name: string;
    category: string;
    description?: string | null;
    unit: string;
    is_standard: boolean;
    created_by_trainer_id?: number | null;
    trainer_label?: string | null;
    default_frequency_weeks?: number | null;
    primary_exercise_id?: number | null;
    primary_exercise_name?: string | null;
    formula?: string | null;
    notes?: string | null;
    results_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AdminPhysicalTestsPageOut {
    items: AdminPhysicalTestOut[];
    total: number;
    page: number;
    page_size: number;
}

export interface AdminPhysicalTestCategoriesOut {
    categories: string[];
}

export interface AdminPhysicalTestsListParams {
    scope?: PhysicalTestScope;
    page?: number;
    page_size?: number;
    trainer_id?: number;
    include_inactive?: boolean;
    q?: string;
    category?: string;
}

export interface AdminPhysicalTestCreateIn {
    name: string;
    category: string;
    unit: string;
    description?: string | null;
    default_frequency_weeks?: number | null;
    primary_exercise_id?: number | null;
    formula?: string | null;
    notes?: string | null;
}

export interface AdminPhysicalTestUpdateIn {
    name?: string;
    category?: string;
    unit?: string;
    description?: string | null;
    default_frequency_weeks?: number | null;
    /** `null` clears the exercise; omit to leave unchanged. */
    primary_exercise_id?: number | null;
    formula?: string | null;
    notes?: string | null;
}

export function isPhysicalTestCategory(value: string): value is PhysicalTestCategory {
    return (PHYSICAL_TEST_CATEGORIES as readonly string[]).includes(value);
}
