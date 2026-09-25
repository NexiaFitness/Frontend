/**
 * adminUsers.ts — Tipos Portal Admin U1/U2 (alineados con backend admin_users schemas).
 *
 * Contratos: GET/POST /admin/users*, GET /admin/audit-log.
 */

export interface AdminOrgBriefOut {
    id: number;
    name: string;
}

export interface AdminUserListItemOut {
    id: number;
    email: string | null;
    full_name: string | null;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    locked: boolean;
    created_at: string | null;
    trainer_id: number | null;
    client_profile_id: number | null;
    organization: AdminOrgBriefOut | null;
}

export interface AdminUsersPageOut {
    items: AdminUserListItemOut[];
    total: number;
    page: number;
    page_size: number;
}

export interface AdminUserMembershipOut {
    organization_id: number;
    organization_name: string;
    role: string;
    is_active: boolean;
}

export interface AdminUserDetailOut extends AdminUserListItemOut {
    clients_count: number | null;
    trainers_count: number | null;
    memberships: AdminUserMembershipOut[];
    active_refresh_sessions: number;
    failed_login_attempts: number;
    lockout_until: string | null;
}

export type AdminRoleFilter = "admin" | "trainer" | "athlete";
export type AdminStatusFilter = "active" | "suspended";

export interface AdminUsersListParams {
    page?: number;
    page_size?: number;
    role?: AdminRoleFilter;
    status?: AdminStatusFilter;
    is_verified?: boolean;
    locked?: boolean;
    q?: string;
}

export interface AdminCreateRequest {
    email: string;
    nombre: string;
    apellidos: string;
    password: string;
    reason: string;
}

export interface AdminReasonRequest {
    reason: string;
}

export interface AdminSetPasswordRequest {
    reason: string;
    new_password: string;
}

export interface AdminActionResultOut {
    message: string;
    user_id: number;
}

export interface AdminAuditLogItemOut {
    id: number;
    created_at: string;
    actor_user_id: number | null;
    action: string;
    target_type: string | null;
    target_id: number | null;
    target_user_id: number | null;
    reason: string | null;
    detail: Record<string, unknown> | null;
    request_method: string | null;
    request_path: string | null;
    status_code: number | null;
    ip: string | null;
}

export interface AdminAuditLogPageOut {
    items: AdminAuditLogItemOut[];
    total: number;
    page: number;
    page_size: number;
}

export interface AdminAuditLogListParams {
    page?: number;
    page_size?: number;
    actor_user_id?: number;
    target_user_id?: number;
    action?: string;
    /**
     * When true, include supervision_read rows.
     * Backend default is false (omit or false → exclude).
     */
    include_supervision?: boolean;
    /** Query alias `desde` en backend */
    desde?: string;
    /** Query alias `hasta` en backend */
    hasta?: string;
}
