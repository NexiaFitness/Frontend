/**
 * adminTaxonomies.ts — Tipos Portal Admin T1/T2 (taxonomías).
 *
 * Contratos: /admin/taxonomies/{kind}*
 */

export const TAXONOMY_KINDS = [
    "patterns",
    "muscle-groups",
    "muscles",
    "joints",
    "joint-movements",
    "equipment",
    "tags",
] as const;

export type TaxonomyKind = (typeof TAXONOMY_KINDS)[number];

export const TAXONOMY_UI_BUCKETS = [
    "LOWER",
    "UPPER",
    "CORE",
    "POWER_LOCOMOTION",
    "ACCESSORY",
] as const;

export type TaxonomyUiBucket = (typeof TAXONOMY_UI_BUCKETS)[number];

export interface TaxonomyUsageBreakdown {
    [table: string]: number;
}

export interface TaxonomyItemOut {
    id: number;
    kind?: TaxonomyKind;
    name_en?: string | null;
    name_es?: string | null;
    name?: string | null;
    description?: string | null;
    is_active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
    ui_bucket?: string | null;
    parent_id?: number | null;
    level?: number | null;
    display_order?: number | null;
    muscle_group_id?: number | null;
    joint_id?: number | null;
    region?: string | null;
    category?: string | null;
    usage_count: number;
}

export interface TaxonomyDetailOut extends TaxonomyItemOut {
    usage_breakdown: TaxonomyUsageBreakdown;
}

export interface TaxonomyPageOut {
    items: TaxonomyItemOut[];
    total: number;
    page: number;
    page_size: number;
}

export interface TaxonomyListParams {
    kind: TaxonomyKind;
    page?: number;
    page_size?: number;
    q?: string;
    include_inactive?: boolean;
}

export interface TaxonomyCreateIn {
    name_en: string;
    name_es?: string | null;
    name?: string | null;
    description?: string | null;
    ui_bucket?: string | null;
    parent_id?: number | null;
    level?: number | null;
    display_order?: number | null;
    muscle_group_id?: number | null;
    joint_id?: number | null;
    region?: string | null;
    category?: string | null;
}

export interface TaxonomyUpdateIn {
    name_es?: string | null;
    name?: string | null;
    description?: string | null;
    ui_bucket?: string | null;
    parent_id?: number | null;
    level?: number | null;
    display_order?: number | null;
    muscle_group_id?: number | null;
    joint_id?: number | null;
    region?: string | null;
    category?: string | null;
}

export interface TaxonomyUpdateImpactOut {
    affected_exercises_count: number;
}

export interface TaxonomyUpdateOut {
    item: TaxonomyItemOut;
    impact?: TaxonomyUpdateImpactOut | null;
}

export interface TaxonomyDeactivateErrorDetail {
    code: "TAXONOMY_IN_USE";
    usage_count: number;
    usage_breakdown: TaxonomyUsageBreakdown;
}

export function isTaxonomyKind(value: string): value is TaxonomyKind {
    return (TAXONOMY_KINDS as readonly string[]).includes(value);
}
