/**
 * adminOrganizations.ts — Tipos Portal Admin G1 (organizaciones consulta).
 */

export type AdminOrgBillingStatus = "free" | "active" | "expired";
export type AdminOrgStatusFilter = "active" | "inactive";

export interface AdminOrgListItemOut {
    id: number;
    name: string;
    slug: string;
    is_personal: boolean;
    is_active: boolean;
    subscription_tier: string;
    billing_status: AdminOrgBillingStatus;
    subscription_expires_at: string | null;
    trainers_count: number;
    clients_count: number;
    gyms_count: number;
    created_at: string | null;
}

export interface AdminOrgsPageOut {
    items: AdminOrgListItemOut[];
    total: number;
    page: number;
    page_size: number;
}

export interface AdminOrgsListParams {
    page?: number;
    page_size?: number;
    q?: string;
    plan?: string;
    status?: AdminOrgStatusFilter;
}

export interface AdminOrgMemberOut {
    user_id: number;
    email: string | null;
    full_name: string | null;
    role: string;
    is_active: boolean;
    joined_at: string | null;
}

export interface AdminOrgInventoryItemOut {
    id: number;
    name: string;
    quantity: number;
    condition: string | null;
    is_available: boolean;
}

export interface AdminOrgGymOut {
    id: number;
    name: string;
    address: string | null;
    is_active: boolean;
    inventory_items_count: number;
    inventory_preview: AdminOrgInventoryItemOut[];
}

export interface AdminOrgDetailOut {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    is_personal: boolean;
    is_active: boolean;
    billing_email: string | null;
    subscription_tier: string;
    billing_status: AdminOrgBillingStatus;
    subscription_expires_at: string | null;
    max_trainers: number;
    max_clients: number;
    trainers_count: number;
    clients_count: number;
    gyms_count: number;
    members: AdminOrgMemberOut[];
    gyms: AdminOrgGymOut[];
    created_at: string | null;
    updated_at: string | null;
}
