/**
 * adminDashboard.ts — Tipos Portal Admin D1 (KPIs).
 */

export interface RoleActiveSuspended {
    active: number;
    suspended: number;
}

export interface RoleSignups {
    admin: number;
    trainer: number;
    athlete: number;
}

export interface AdminDashboardSummaryOut {
    users_by_role: Record<string, RoleActiveSuspended>;
    trainers_with_clients: number;
    active_clients: number;
    signups_7d: RoleSignups;
    signups_30d: RoleSignups;
    sessions_completed_7d: number;
    orgs_by_tier: Record<string, number>;
}
