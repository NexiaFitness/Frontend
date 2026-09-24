/**
 * adminUsersPresentation.ts — Tokens y copy Admin usuarios / auditoría (U2).
 *
 * Referencia visual: adminCatalogPresentation.ts · UX_USUARIOS.md
 */

import { cn } from "@/lib/utils";
import {
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
    PLATFORM_BACK_BUTTON,
    PLATFORM_LOADING_ROW,
    PLATFORM_ALERT_SPACING,
    nexiaSegmentedItemClass,
} from "@/components/ui/surface/platformPremiumPresentation";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";

export {
    PLATFORM_PAGE_HEADER as ADMIN_USERS_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as ADMIN_USERS_TITLE_WRAP,
    PLATFORM_BACK_BUTTON as ADMIN_USERS_BACK_BUTTON,
    PLATFORM_LOADING_ROW as ADMIN_USERS_LOADING_ROW,
    PLATFORM_ALERT_SPACING as ADMIN_USERS_ALERT_SPACING,
};

export const ADMIN_USERS_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_72%)]";

export const ADMIN_USERS_STACK = "relative space-y-6 lg:space-y-8";

export const ADMIN_USERS_HEADER_ACTIONS = "flex flex-wrap items-center gap-2";

export const ADMIN_USERS_TOOLBAR = cn(
    NEXIA_GLASS_CARD,
    "relative flex flex-col gap-3 p-3 sm:p-4",
    "lg:flex-row lg:items-center lg:justify-between"
);

export const ADMIN_USERS_TOOLBAR_SEARCH = "w-full lg:max-w-sm";

export const ADMIN_USERS_FILTER_ROW = "flex flex-wrap gap-2";

export function adminUsersFilterClass(isActive: boolean): string {
    return nexiaSegmentedItemClass(isActive);
}

export const ADMIN_USERS_TABLE_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative overflow-hidden"
);

export const ADMIN_USERS_TABLE_SCROLL = "hidden overflow-x-auto md:block";

export const ADMIN_USERS_TABLE = "w-full min-w-[52rem] border-collapse text-sm";

export const ADMIN_USERS_TH =
    "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

export const ADMIN_USERS_TR = cn(
    "cursor-pointer border-t border-border/60 transition-colors hover:bg-primary/5",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
);

export const ADMIN_USERS_TR_INACTIVE = "opacity-60";

export const ADMIN_USERS_TD = "px-4 py-3 align-middle text-foreground";

export const ADMIN_USERS_TD_MUTED = cn(ADMIN_USERS_TD, "text-muted-foreground");

export const ADMIN_USERS_TD_NAME = cn(ADMIN_USERS_TD, "font-medium");

export const ADMIN_USERS_CARD_LIST = "space-y-3 p-3 md:hidden";

export const ADMIN_USERS_CARD_ITEM = cn(
    "flex w-full min-h-[3rem] flex-col gap-2 rounded-lg border border-border/70",
    "bg-surface-2/30 p-3 text-left transition-colors hover:border-primary/30",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const ADMIN_USERS_CARD_TITLE_ROW =
    "flex items-start justify-between gap-2 text-sm font-medium text-foreground";

export const ADMIN_USERS_CARD_META = "text-xs text-muted-foreground";

export const ADMIN_USERS_SKELETON_LIST = "space-y-2 p-4";

export const ADMIN_USERS_SKELETON_ROW =
    "h-11 animate-pulse rounded-md bg-surface-2/50";

export const ADMIN_USERS_PAGINATION = "mt-4";

export const ADMIN_USERS_DETAIL_GRID = cn(
    "grid grid-cols-1 gap-4",
    "lg:grid-cols-2 xl:grid-cols-3"
);

export const ADMIN_USERS_DETAIL_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-3 p-4 sm:p-5"
);

export const ADMIN_USERS_DETAIL_CARD_TITLE =
    "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

export const ADMIN_USERS_DETAIL_ACTIONS = "flex flex-wrap gap-2 pt-2";

export const ADMIN_USERS_DETAIL_HINT = "text-xs leading-relaxed text-muted-foreground";

export const ADMIN_USERS_AUDIT_LIST = "divide-y divide-border/60";

export const ADMIN_USERS_AUDIT_ROW = "flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-start sm:justify-between";

export const ADMIN_USERS_MODAL_FIELD = "space-y-4";

export const ADMIN_USERS_COPY = {
    listTitle: "Usuarios",
    listSubtitle: (total: number) => `${total} cuenta${total === 1 ? "" : "s"} en el listado`,
    backToAdmin: "Volver al inicio",
    backToUsers: "Volver al listado",
    listNewAdmin: "Nuevo admin",
    searchPlaceholder: "Buscar por nombre o email…",
    searchLabel: "Buscar usuarios",
    retry: "Reintentar",
    listError: "No se pudo cargar el listado de usuarios.",
    listEmptyTitle: "Sin resultados",
    listEmptyBody: "Prueba otros filtros o la búsqueda.",
    listClearFilters: "Quitar filtros",
    colName: "Usuario",
    colRole: "Rol",
    colStatus: "Estado",
    colVerified: "Verificado",
    colOrg: "Organización",
    colCreated: "Alta",
    colOpen: "Abrir ficha",
    filterRoleAll: "Todos",
    filterRoleTrainer: "Entrenadores",
    filterRoleAthlete: "Atletas",
    filterRoleAdmin: "Admins",
    filterStatusAll: "Cualquier estado",
    filterStatusActive: "Activos",
    filterStatusSuspended: "Suspendidos",
    filterStatusLocked: "Bloqueados",
    filterVerifiedAll: "Verificación",
    filterVerifiedYes: "Verificados",
    filterVerifiedNo: "Sin verificar",
    roleAdmin: "Admin",
    roleTrainer: "Entrenador",
    roleAthlete: "Atleta",
    statusActive: "Activo",
    statusSuspended: "Suspendido",
    statusLocked: "Bloqueado",
    verifiedYes: "Verificado",
    verifiedNo: "Pendiente",
    detailTitle: "Ficha de usuario",
    detailLoadError: "No se pudo cargar la ficha.",
    sectionAccount: "Cuenta",
    sectionRelation: "Relación",
    sectionSupport: "Soporte",
    sectionAudit: "Actividad admin",
    labelEmail: "Email",
    labelSessions: "Sesiones activas",
    labelFailedLogins: "Intentos fallidos",
    labelLockout: "Bloqueo hasta",
    labelClients: "Clientes",
    labelTrainers: "Entrenadores",
    labelMemberships: "Membresías",
    actionForceLogout: "Forzar cierre de sesión",
    actionSetPassword: "Establecer contraseña",
    actionActivate: "Activar cuenta",
    actionSuspend: "Suspender cuenta",
    actionSuccess: "Acción registrada correctamente.",
    reasonLabel: "Motivo (obligatorio)",
    reasonPlaceholder: "Describe el motivo de la intervención…",
    cancel: "Cancelar",
    confirm: "Confirmar",
    createAdminTitle: "Nuevo administrador",
    createAdminSubmit: "Crear admin",
    fieldNombre: "Nombre",
    fieldApellidos: "Apellidos",
    fieldEmail: "Email",
    fieldPassword: "Contraseña temporal",
    setPasswordTitle: "Establecer contraseña",
    setPasswordSubmit: "Guardar contraseña",
    fieldNewPassword: "Nueva contraseña",
    auditTitle: "Auditoría admin",
    auditSubtitle: "Registro de intervenciones y consultas sensibles",
    auditColWhen: "Fecha",
    auditColAction: "Acción",
    auditColActor: "Actor",
    auditColTarget: "Usuario objetivo",
    auditColReason: "Motivo",
    auditEmpty: "No hay entradas con estos filtros.",
    auditFilterAction: "Acción",
    auditFilterActor: "ID actor",
    auditFilterTarget: "ID objetivo",
    auditFilterFrom: "Desde",
    auditFilterTo: "Hasta",
    auditActionAll: "Todas",
    dashboardUsers: "Usuarios",
    dashboardUsersHint: "Listado, ficha y soporte de cuentas",
    dashboardAudit: "Auditoría admin",
    dashboardAuditHint: "Historial de acciones con motivo",
} as const;

export function formatAdminUserRole(role: string): string {
    switch (role) {
        case "admin":
            return ADMIN_USERS_COPY.roleAdmin;
        case "trainer":
            return ADMIN_USERS_COPY.roleTrainer;
        case "athlete":
            return ADMIN_USERS_COPY.roleAthlete;
        default:
            return role;
    }
}

export function formatAdminAuditAction(action: string): string {
    const map: Record<string, string> = {
        user_view: "Consulta ficha",
        admin_create: "Alta admin",
        user_suspend: "Suspensión",
        user_activate: "Activación",
        user_force_logout: "Cierre de sesión forzado",
        user_set_password: "Cambio de contraseña",
        user_delete: "Eliminación usuario",
        catalog_review: "Revisión catálogo",
        catalog_reactivate: "Reactivación catálogo",
        catalog_import_confirm: "Importación catálogo",
        supervision_read: "Lectura de supervisión",
        intervention: "Intervención",
        admin_write: "Escritura admin",
        reset_profile_onboarding: "Reset onboarding",
    };
    return map[action] ?? action;
}

export function formatAdminDateTime(iso: string | null | undefined): string {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString("es-ES", {
            dateStyle: "short",
            timeStyle: "short",
        });
    } catch {
        return iso;
    }
}
