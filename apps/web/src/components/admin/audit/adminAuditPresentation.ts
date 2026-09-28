/**
 * adminAuditPresentation.ts — Tokens, copy y helpers Auditoría admin (UX_AUDITORIA.md).
 */

import { cn } from "@/lib/utils";
import {
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
    PLATFORM_BACK_BUTTON,
    PLATFORM_ALERT_SPACING,
    nexiaSegmentedItemClass,
} from "@/components/ui/surface/platformPremiumPresentation";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";
import type { AdminAuditLogItemOut, AdminAuditUserBriefOut } from "@nexia/shared/types/adminUsers";
import { formatAdminAuditAction, formatAdminUserRole } from "@/components/admin/users/adminUsersPresentation";

export {
    PLATFORM_PAGE_HEADER as ADMIN_AUDIT_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as ADMIN_AUDIT_TITLE_WRAP,
    PLATFORM_BACK_BUTTON as ADMIN_AUDIT_BACK_BUTTON,
    PLATFORM_ALERT_SPACING as ADMIN_AUDIT_ALERT_SPACING,
};

export const ADMIN_AUDIT_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_72%)]";

export const ADMIN_AUDIT_STACK = "relative space-y-6 lg:space-y-8";

export const ADMIN_AUDIT_HEADER_ACTIONS = "flex flex-wrap items-center gap-2";

export const ADMIN_AUDIT_TOOLBAR = cn(
    NEXIA_GLASS_CARD,
    "relative flex flex-col gap-4 p-3 sm:p-4"
);

export const ADMIN_AUDIT_TOOLBAR_ROW = "flex flex-col gap-3";

export const ADMIN_AUDIT_FILTERS_GRID = cn(
    "grid grid-cols-1 gap-3",
    "sm:grid-cols-2",
    "xl:grid-cols-3"
);

export const ADMIN_AUDIT_FILTER_ROW = "flex flex-wrap items-center gap-2";

export const ADMIN_AUDIT_CHIPS_ROW = "flex flex-wrap items-center gap-2";

export const ADMIN_AUDIT_CHIP = cn(
    "inline-flex items-center gap-1.5 rounded-full border border-primary/25",
    "bg-primary/5 px-2.5 py-1 text-xs text-foreground"
);

export const ADMIN_AUDIT_TABLE_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative overflow-hidden"
);

export const ADMIN_AUDIT_LIST = "divide-y divide-border/60";

export const ADMIN_AUDIT_ROW = cn(
    "px-4 py-4 text-sm transition-colors hover:bg-primary/[0.03]",
    "md:py-3.5"
);

export const ADMIN_AUDIT_CARD_LIST = "space-y-3 p-3 md:hidden";

export const ADMIN_AUDIT_CARD_ITEM = cn(
    "flex flex-col gap-2 rounded-lg border border-border/70",
    "bg-surface-2/30 p-3"
);

export const ADMIN_AUDIT_REASON = cn(
    "mt-2 border-l-2 border-primary/30 pl-3 text-sm text-foreground"
);

export const ADMIN_AUDIT_TECH_DETAILS = "mt-2 text-xs text-muted-foreground";

export const ADMIN_AUDIT_SKELETON_LIST = "space-y-2 p-4";

export const ADMIN_AUDIT_SKELETON_ROW = "h-16 animate-pulse rounded-md bg-surface-2/50 md:h-14";

export const ADMIN_AUDIT_PAGINATION = "border-t border-border/60 px-4 py-3";

export const ADMIN_AUDIT_PICKER_PANEL = cn(
    "absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border",
    "bg-popover p-1 shadow-lg"
);

export const ADMIN_AUDIT_PICKER_OPTION = cn(
    "flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left text-sm",
    "hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export function adminAuditSegmentClass(isActive: boolean): string {
    return nexiaSegmentedItemClass(isActive);
}

export const ADMIN_AUDIT_COPY = {
    title: "Auditoría admin",
    subtitle: "Historial de acciones del equipo admin: soporte, catálogo e intervenciones",
    hint: "Busca por persona o filtra por fecha. Las consultas de solo lectura están ocultas por defecto.",
    backToAdmin: "Volver",
    retry: "Reintentar",
    listError: "No se pudo cargar la auditoría.",
    clearFilters: "Limpiar filtros",
    filterTargetLabel: "Sobre esta persona",
    filterTargetPlaceholder: "Buscar por nombre o email…",
    filterActorLabel: "Quién lo hizo",
    filterActorPlaceholder: "Cualquier admin…",
    filterTypeLabel: "Tipo de acción",
    filterTypeAll: "Todos los tipos",
    filterPeriodLabel: "Periodo",
    periodAll: "Todo",
    periodToday: "Hoy",
    period7d: "7 días",
    period30d: "30 días",
    periodCustom: "Personalizado",
    periodFrom: "Desde",
    periodTo: "Hasta",
    visibilityActions: "Acciones",
    visibilityReads: "Incluir consultas",
    visibilityAll: "Todo",
    visibilityLabel: "Ver",
    pickerMinChars: "Escribe al menos 2 caracteres para buscar.",
    pickerEmpty: "Sin coincidencias.",
    pickerRoleAll: "Todos",
    pickerRoleTrainer: "Entrenadores",
    pickerRoleAthlete: "Atletas",
    pickerRoleAdmin: "Admins",
    chipTarget: (name: string, role?: string | null) =>
        role ? `Sobre: ${name} (${formatAdminUserRole(role)})` : `Sobre: ${name}`,
    chipActor: (name: string) => `Por: ${name}`,
    chipPeriod: (label: string) => `Periodo: ${label}`,
    chipAction: (label: string) => `Tipo: ${label}`,
    chipVisibility: (label: string) => `Ver: ${label}`,
    emptyGlobalTitle: "Aún no hay acciones registradas",
    emptyGlobalBody:
        "Cuando suspendas un usuario, revises el catálogo o crees un admin, aparecerá aquí.",
    emptyFiltersTitle: "Nada coincide con estos filtros",
    emptyFiltersBody: "Prueba ampliar el periodo o quitar filtros.",
    emptyReadsHint: "Puede haber consultas de solo lectura ocultas. Cambia «Ver» a «Incluir consultas».",
    techDetails: "Detalles técnicos",
    unknownActor: "Usuario eliminado",
    systemActor: "Sistema",
} as const;

export type AdminAuditCategory = "support" | "catalog" | "intervention" | "read";

export const ADMIN_AUDIT_ACTION_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
    { value: "user_view", label: formatAdminAuditAction("user_view") },
    { value: "admin_create", label: formatAdminAuditAction("admin_create") },
    { value: "user_suspend", label: formatAdminAuditAction("user_suspend") },
    { value: "user_activate", label: formatAdminAuditAction("user_activate") },
    { value: "user_force_logout", label: formatAdminAuditAction("user_force_logout") },
    { value: "user_set_password", label: formatAdminAuditAction("user_set_password") },
    { value: "catalog_review", label: formatAdminAuditAction("catalog_review") },
    { value: "catalog_import_confirm", label: formatAdminAuditAction("catalog_import_confirm") },
    { value: "admin_write", label: formatAdminAuditAction("admin_write") },
    { value: "intervention", label: formatAdminAuditAction("intervention") },
    { value: "supervision_read", label: formatAdminAuditAction("supervision_read") },
];

export function auditCategoryForAction(action: string): AdminAuditCategory {
    switch (action) {
        case "catalog_review":
        case "catalog_import_confirm":
        case "catalog_reactivate":
        case "admin_write":
            return "catalog";
        case "intervention":
            return "intervention";
        case "supervision_read":
        case "user_view":
            return "read";
        default:
            return "support";
    }
}

export function auditCategoryLabel(category: AdminAuditCategory): string {
    switch (category) {
        case "catalog":
            return "Catálogo";
        case "intervention":
            return "Intervención";
        case "read":
            return "Consulta";
        default:
            return "Soporte";
    }
}

export function auditCategoryBadgeVariant(
    category: AdminAuditCategory
): "default" | "subtle-success" | "subtle-warning" | "subtle-destructive" {
    switch (category) {
        case "catalog":
            return "subtle-success";
        case "intervention":
            return "subtle-destructive";
        case "read":
            return "subtle-warning";
        default:
            return "default";
    }
}

export function formatAdminAuditUserDisplayName(
    user: AdminAuditUserBriefOut | null | undefined,
    fallbackId?: number | null
): string {
    if (!user) {
        return fallbackId != null ? `Usuario #${fallbackId}` : "—";
    }
    const name = user.full_name?.trim();
    if (name) return name;
    if (user.email) return user.email;
    return `Usuario #${user.id}`;
}

export function formatAdminAuditSentence(entry: AdminAuditLogItemOut): string {
    const actor = entry.actor
        ? formatAdminAuditUserDisplayName(entry.actor, entry.actor_user_id)
        : entry.actor_user_id
          ? ADMIN_AUDIT_COPY.unknownActor
          : ADMIN_AUDIT_COPY.systemActor;
    const target = formatAdminAuditUserDisplayName(entry.target_user, entry.target_user_id);
    const targetRole = entry.target_user?.role
        ? formatAdminUserRole(entry.target_user.role)
        : null;
    const targetLabel = targetRole ? `${target} (${targetRole})` : target;

    switch (entry.action) {
        case "user_suspend":
            return `${actor} suspendió a ${targetLabel}`;
        case "user_activate":
            return `${actor} reactivó a ${targetLabel}`;
        case "user_force_logout":
            return `${actor} forzó cierre de sesión de ${targetLabel}`;
        case "user_set_password":
            return `${actor} estableció contraseña de ${targetLabel}`;
        case "admin_create":
            return `${actor} creó admin ${targetLabel}`;
        case "user_view":
            return `${actor} abrió la ficha de ${targetLabel}`;
        case "catalog_review":
            return `${actor} revisó ejercicio en catálogo`;
        case "catalog_import_confirm":
            return `${actor} confirmó importación de catálogo`;
        case "admin_write":
            return `${actor} realizó escritura admin`;
        case "intervention":
            return `${actor} intervino sobre datos de entrenamiento`;
        case "supervision_read":
            return `${actor} consultó datos en supervisión`;
        default:
            return `${actor}: ${formatAdminAuditAction(entry.action)}`;
    }
}

export function formatAdminAuditDateTime(iso: string | null | undefined): string {
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

export function formatAdminAuditRelativeTime(iso: string | null | undefined): string {
    if (!iso) return "—";
    try {
        const date = new Date(iso);
        const diffMs = Date.now() - date.getTime();
        const diffMin = Math.round(diffMs / 60_000);
        if (diffMin < 1) return "ahora";
        if (diffMin < 60) return `hace ${diffMin} min`;
        const diffH = Math.round(diffMin / 60);
        if (diffH < 48) return `hace ${diffH} h`;
        return formatAdminAuditDateTime(iso);
    } catch {
        return iso;
    }
}
