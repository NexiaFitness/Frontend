/**
 * adminOrganizationsPresentation.ts — Tokens y copy G1.
 */

import { cn } from "@/lib/utils";
import {
    PLATFORM_ALERT_SPACING,
    PLATFORM_BACK_BUTTON,
    PLATFORM_LOADING_ROW,
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
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
} from "@/components/admin/users/adminUsersPresentation";
import type { AdminOrgBillingStatus } from "@nexia/shared/types/adminOrganizations";

export {
    PLATFORM_PAGE_HEADER as ADMIN_ORGS_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as ADMIN_ORGS_TITLE_WRAP,
    PLATFORM_BACK_BUTTON as ADMIN_ORGS_BACK_BUTTON,
    PLATFORM_LOADING_ROW as ADMIN_ORGS_LOADING_ROW,
    PLATFORM_ALERT_SPACING as ADMIN_ORGS_ALERT_SPACING,
    ADMIN_USERS_GLOW as ADMIN_ORGS_GLOW,
    ADMIN_USERS_STACK as ADMIN_ORGS_STACK,
    ADMIN_USERS_HEADER_ACTIONS as ADMIN_ORGS_HEADER_ACTIONS,
    ADMIN_USERS_TOOLBAR as ADMIN_ORGS_TOOLBAR,
    ADMIN_USERS_TOOLBAR_SEARCH as ADMIN_ORGS_TOOLBAR_SEARCH,
    ADMIN_USERS_FILTER_ROW as ADMIN_ORGS_FILTER_ROW,
    ADMIN_USERS_TABLE_CARD as ADMIN_ORGS_TABLE_CARD,
    ADMIN_USERS_TABLE_SCROLL as ADMIN_ORGS_TABLE_SCROLL,
    ADMIN_USERS_TABLE as ADMIN_ORGS_TABLE,
    ADMIN_USERS_TH as ADMIN_ORGS_TH,
    ADMIN_USERS_TR as ADMIN_ORGS_TR,
    ADMIN_USERS_TD as ADMIN_ORGS_TD,
    ADMIN_USERS_TD_MUTED as ADMIN_ORGS_TD_MUTED,
    ADMIN_USERS_TD_NAME as ADMIN_ORGS_TD_NAME,
    ADMIN_USERS_CARD_LIST as ADMIN_ORGS_CARD_LIST,
    ADMIN_USERS_CARD_ITEM as ADMIN_ORGS_CARD_ITEM,
    ADMIN_USERS_CARD_TITLE_ROW as ADMIN_ORGS_CARD_TITLE_ROW,
    ADMIN_USERS_CARD_META as ADMIN_ORGS_CARD_META,
    ADMIN_USERS_SKELETON_LIST as ADMIN_ORGS_SKELETON_LIST,
    ADMIN_USERS_SKELETON_ROW as ADMIN_ORGS_SKELETON_ROW,
    ADMIN_USERS_PAGINATION as ADMIN_ORGS_PAGINATION,
    ADMIN_USERS_DETAIL_CARD as ADMIN_ORGS_DETAIL_CARD,
    ADMIN_USERS_DETAIL_CARD_TITLE as ADMIN_ORGS_DETAIL_CARD_TITLE,
};

export const ADMIN_ORGS_SECTION_GRID = cn("grid grid-cols-1 gap-4", "lg:grid-cols-2");

export const ADMIN_ORGS_COPY = {
    listTitle: "Organizaciones",
    listSubtitle: "Consulta de tenants, plan y estado (solo lectura)",
    searchPlaceholder: "Buscar por nombre o slug…",
    searchLabel: "Buscar organizaciones",
    filterAll: "Todas",
    filterActive: "Activas",
    filterInactive: "Inactivas",
    filterPlanAll: "Cualquier plan",
    colName: "Organización",
    colPlan: "Plan",
    colBilling: "Facturación",
    colTrainers: "Entrenadores",
    colClients: "Clientes",
    colGyms: "Gimnasios",
    emptyTitle: "Sin organizaciones",
    emptyBody: "No hay organizaciones con estos filtros.",
    loadError: "No se pudo cargar el listado.",
    retry: "Reintentar",
    backToList: "Volver al listado",
    backToAdmin: "Volver al inicio",
    detailMembers: "Miembros",
    detailGyms: "Gimnasios e inventario",
    detailBilling: "Plan y facturación",
    detailLimits: "Límites",
    noMembers: "Sin miembros.",
    noGyms: "Sin gimnasios.",
    inventoryEmpty: "Sin inventario.",
    personalBadge: "Personal",
    inactiveBadge: "Inactiva",
    billingFree: "Free",
    billingActive: "Activo",
    billingExpired: "Caducado",
} as const;

export function billingBadgeVariant(
    status: AdminOrgBillingStatus
): "subtle-success" | "subtle-warning" | "destructive" | "secondary" {
    switch (status) {
        case "active":
            return "subtle-success";
        case "expired":
            return "destructive";
        case "free":
            return "secondary";
        default:
            return "secondary";
    }
}

export function billingLabel(status: AdminOrgBillingStatus): string {
    switch (status) {
        case "active":
            return ADMIN_ORGS_COPY.billingActive;
        case "expired":
            return ADMIN_ORGS_COPY.billingExpired;
        case "free":
            return ADMIN_ORGS_COPY.billingFree;
        default:
            return status;
    }
}
