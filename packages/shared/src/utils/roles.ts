/**
 * roles.ts
 * -----------------------------------------------------
 * Centralized role definitions and permissions matrix.
 * Shared across web and mobile apps.
 *
 * @scope Shared business logic (not UI-specific)
 * @author NEXIA
 * @since v2.3.0
 */

export const USER_ROLES = {
    ADMIN: "admin",
    TRAINER: "trainer",
    ATHLETE: "athlete",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    admin: ["dashboard", "users", "system", "reports"],
    trainer: ["dashboard", "clients", "plans", "progress", "onboarding"],
    athlete: ["dashboard", "training", "feedback", "goals"],
};

/**
 * Utility function to check if a role has access to a specific feature.
 * @param role User role (admin/trainer/athlete)
 * @param feature Feature key (e.g. 'clients', 'dashboard')
 * @returns boolean
 */
export const canAccess = (role: UserRole | undefined, feature: string): boolean => {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(feature) ?? false;
};
