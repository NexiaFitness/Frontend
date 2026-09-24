/**
 * adminUserPermissions.ts — Heurísticas de soporte admin (U2).
 */

import type { AdminUserDetailOut, AdminUserListItemOut } from "../../types/adminUsers";

export const ADMIN_REASON_MIN_LENGTH = 5;

export function validateAdminReason(reason: string): string | undefined {
    const trimmed = reason.trim();
    if (trimmed.length < ADMIN_REASON_MIN_LENGTH) {
        return `El motivo debe tener al menos ${ADMIN_REASON_MIN_LENGTH} caracteres`;
    }
    return undefined;
}

export function canSuspendSelf(
    currentUserId: number | undefined,
    user: Pick<AdminUserListItemOut, "id" | "role"> | undefined
): boolean {
    if (currentUserId == null || !user) return false;
    return user.id === currentUserId && user.role === "admin";
}

export function canSuspendLastAdmin(
    user: Pick<AdminUserListItemOut, "role" | "is_active"> | undefined,
    activeAdminTotal: number | undefined
): boolean {
    if (!user || user.role !== "admin" || !user.is_active) return false;
    if (activeAdminTotal == null) return false;
    return activeAdminTotal <= 1;
}

export function suspendDisabledReason(
    currentUserId: number | undefined,
    user: AdminUserDetailOut | undefined,
    activeAdminTotal: number | undefined
): string | undefined {
    if (!user) return undefined;
    if (canSuspendSelf(currentUserId, user)) {
        return "No puedes suspender tu propia cuenta de administrador.";
    }
    if (canSuspendLastAdmin(user, activeAdminTotal)) {
        return "No puedes suspender al último administrador activo de la plataforma.";
    }
    return undefined;
}
