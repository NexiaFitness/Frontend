/**
 * adminSupervisionPresentation.ts — Tokens y copy Portal Admin SUP (solo lectura).
 *
 * Referencia: UX_SUPERVISION.md · adminUsersPresentation.ts
 */

import { cn } from "@/lib/utils";
import {
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
    PLATFORM_BACK_BUTTON,
    PLATFORM_LOADING_ROW,
    PLATFORM_ALERT_SPACING,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    ADMIN_USERS_AUDIT_LIST,
    ADMIN_USERS_AUDIT_ROW,
    ADMIN_USERS_CARD_ITEM,
    ADMIN_USERS_CARD_LIST,
    ADMIN_USERS_CARD_META,
    ADMIN_USERS_CARD_TITLE_ROW,
    ADMIN_USERS_DETAIL_CARD,
    ADMIN_USERS_DETAIL_CARD_TITLE,
    ADMIN_USERS_FILTER_ROW,
    ADMIN_USERS_GLOW,
    ADMIN_USERS_HEADER_ACTIONS,
    ADMIN_USERS_PAGINATION,
    ADMIN_USERS_SKELETON_LIST,
    ADMIN_USERS_SKELETON_ROW,
    ADMIN_USERS_STACK,
    ADMIN_USERS_TABLE,
    ADMIN_USERS_TABLE_CARD,
    ADMIN_USERS_TABLE_SCROLL,
    ADMIN_USERS_TD,
    ADMIN_USERS_TD_MUTED,
    ADMIN_USERS_TD_NAME,
    ADMIN_USERS_TH,
    ADMIN_USERS_TOOLBAR,
    ADMIN_USERS_TOOLBAR_SEARCH,
    ADMIN_USERS_TR,
    formatAdminDateTime,
} from "@/components/admin/users/adminUsersPresentation";

export {
    PLATFORM_PAGE_HEADER as ADMIN_SUP_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as ADMIN_SUP_TITLE_WRAP,
    PLATFORM_BACK_BUTTON as ADMIN_SUP_BACK_BUTTON,
    PLATFORM_LOADING_ROW as ADMIN_SUP_LOADING_ROW,
    PLATFORM_ALERT_SPACING as ADMIN_SUP_ALERT_SPACING,
    ADMIN_USERS_GLOW as ADMIN_SUP_GLOW,
    ADMIN_USERS_STACK as ADMIN_SUP_STACK,
    ADMIN_USERS_HEADER_ACTIONS as ADMIN_SUP_HEADER_ACTIONS,
    ADMIN_USERS_TOOLBAR as ADMIN_SUP_TOOLBAR,
    ADMIN_USERS_TOOLBAR_SEARCH as ADMIN_SUP_TOOLBAR_SEARCH,
    ADMIN_USERS_FILTER_ROW as ADMIN_SUP_FILTER_ROW,
    ADMIN_USERS_TABLE_CARD as ADMIN_SUP_TABLE_CARD,
    ADMIN_USERS_TABLE_SCROLL as ADMIN_SUP_TABLE_SCROLL,
    ADMIN_USERS_TABLE as ADMIN_SUP_TABLE,
    ADMIN_USERS_TH as ADMIN_SUP_TH,
    ADMIN_USERS_TR as ADMIN_SUP_TR,
    ADMIN_USERS_TD as ADMIN_SUP_TD,
    ADMIN_USERS_TD_MUTED as ADMIN_SUP_TD_MUTED,
    ADMIN_USERS_TD_NAME as ADMIN_SUP_TD_NAME,
    ADMIN_USERS_CARD_LIST as ADMIN_SUP_CARD_LIST,
    ADMIN_USERS_CARD_ITEM as ADMIN_SUP_CARD_ITEM,
    ADMIN_USERS_CARD_TITLE_ROW as ADMIN_SUP_CARD_TITLE_ROW,
    ADMIN_USERS_CARD_META as ADMIN_SUP_CARD_META,
    ADMIN_USERS_SKELETON_LIST as ADMIN_SUP_SKELETON_LIST,
    ADMIN_USERS_SKELETON_ROW as ADMIN_SUP_SKELETON_ROW,
    ADMIN_USERS_PAGINATION as ADMIN_SUP_PAGINATION,
    ADMIN_USERS_DETAIL_CARD as ADMIN_SUP_DETAIL_CARD,
    ADMIN_USERS_DETAIL_CARD_TITLE as ADMIN_SUP_DETAIL_CARD_TITLE,
    ADMIN_USERS_AUDIT_LIST as ADMIN_SUP_AUDIT_LIST,
    ADMIN_USERS_AUDIT_ROW as ADMIN_SUP_AUDIT_ROW,
    formatAdminDateTime,
};

export const ADMIN_SUP_BANNER = cn(
    "rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5",
    "text-sm text-muted-foreground"
);

export const ADMIN_SUP_SECTION_GRID = cn(
    "grid grid-cols-1 gap-4",
    "lg:grid-cols-2"
);

export const ADMIN_SUP_SESSION_LIST = "divide-y divide-border/60";

export const ADMIN_SUP_SESSION_ROW = cn(
    "flex w-full cursor-pointer flex-col gap-1 px-4 py-3 text-left text-sm",
    "transition-colors hover:bg-primary/5",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
);

export const ADMIN_SUP_SESSION_ROW_ACTIVE = "bg-primary/10";

export const ADMIN_SUP_COPY = {
    banner:
        "Vista de supervisión, solo lectura. Las consultas quedan registradas.",
    sectionTitle: "Supervisión",
    sectionSubtitle: "Clientes del entrenador (solo lectura)",
    searchPlaceholder: "Buscar cliente…",
    searchLabel: "Buscar clientes supervisados",
    colName: "Cliente",
    colStatus: "Estado",
    colPlan: "Plan",
    colLastSession: "Última sesión",
    colAdherence: "Adherencia",
    emptyTitle: "Sin clientes",
    emptyBody: "Este entrenador no tiene clientes vinculados.",
    loadError: "No se pudo cargar la lista de clientes.",
    retry: "Reintentar",
    statusActive: "Activo",
    statusPaused: "Pausado",
    statusInactive: "Inactivo",
    statusUnknown: "—",
    planUnavailable: "—",
    lastSessionUnavailable: "—",
    adherenceUnavailable: "—",
    backToTrainer: "Volver a la ficha",
    supervisedTitle: "Cliente supervisado",
    scopeError:
        "Este cliente no está vinculado a este entrenador, o no tienes acceso.",
    profileSection: "Perfil",
    planSection: "Plan",
    sessionsSection: "Sesiones",
    testsSection: "Tests físicos",
    injuriesSection: "Lesiones activas",
    activePlan: "Plan activo",
    noActivePlan: "Sin plan activo en la fecha de hoy.",
    planHistory: "Historial de planes",
    noPlans: "Sin planes registrados.",
    upcomingSessions: "Próximas / recientes",
    noSessions: "Sin sesiones.",
    sessionDetail: "Detalle de sesión",
    selectSession: "Selecciona una sesión para ver el detalle.",
    sessionFeedback: "Feedback del atleta",
    noSessionFeedback: "Sin feedback registrado para esta sesión.",
    feedbackRpe: "RPE",
    feedbackFatigue: "Fatiga",
    feedbackSleep: "Sueño",
    feedbackMotivation: "Motivación",
    noTests: "Sin resultados de tests.",
    noInjuries: "Sin lesiones activas.",
    planProgress: "Progreso",
    viewAsSupervisor: "Ver como supervisor",
    chooseTrainerTitle: "Elegir entrenador",
    chooseTrainerBody:
        "Este atleta tiene varios entrenadores. Elige desde qué vínculo supervisas.",
    noTrainersLinked: "No hay entrenadores vinculados a este atleta.",
    trainersLoadError: "No se pudo cargar la lista de entrenadores.",
    cancel: "Cancelar",
    auditIncludeSupervision: "Incluir lecturas de supervisión",
    auditDayGroup: (count: number) =>
        `${count} consulta${count === 1 ? "" : "s"}`,
    auditActivityEmpty: "Sin actividad admin reciente.",
} as const;

export function formatClientStatus(status: string | null | undefined): string {
    switch (status) {
        case "active":
            return ADMIN_SUP_COPY.statusActive;
        case "paused":
            return ADMIN_SUP_COPY.statusPaused;
        case "inactive":
            return ADMIN_SUP_COPY.statusInactive;
        default:
            return ADMIN_SUP_COPY.statusUnknown;
    }
}

export function formatAdherence(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) {
        return ADMIN_SUP_COPY.adherenceUnavailable;
    }
    return `${Math.round(value)}%`;
}

export function formatSessionDate(iso: string | null | undefined): string {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("es-ES", { dateStyle: "medium" });
    } catch {
        return iso;
    }
}

/** Group audit items by local calendar day for the user detail activity card. */
export function groupAuditItemsByDay<
    T extends { id: number; created_at: string; request_path?: string | null },
>(items: T[]): Array<{ dayKey: string; dayLabel: string; count: number; paths: string[] }> {
    const map = new Map<
        string,
        { dayKey: string; dayLabel: string; count: number; paths: string[] }
    >();
    for (const item of items) {
        const d = new Date(item.created_at);
        const dayKey = Number.isNaN(d.getTime())
            ? item.created_at.slice(0, 10)
            : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const dayLabel = Number.isNaN(d.getTime())
            ? dayKey
            : d.toLocaleDateString("es-ES", { dateStyle: "medium" });
        const existing = map.get(dayKey);
        const path = item.request_path?.trim();
        if (existing) {
            existing.count += 1;
            if (path && !existing.paths.includes(path) && existing.paths.length < 4) {
                existing.paths.push(path);
            }
        } else {
            map.set(dayKey, {
                dayKey,
                dayLabel,
                count: 1,
                paths: path ? [path] : [],
            });
        }
    }
    return Array.from(map.values()).sort((a, b) => (a.dayKey < b.dayKey ? 1 : -1));
}
