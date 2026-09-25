/**
 * adminTaxonomiesPresentation.ts — Tokens y copy taxonomías admin (T2).
 */

import { cn } from "@/lib/utils";
import {
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
    PLATFORM_BACK_BUTTON,
    PLATFORM_ALERT_SPACING,
    nexiaSegmentedItemClass,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
} from "@/components/ui/surface/glassSurfacePresentation";
import type { TaxonomyItemOut, TaxonomyKind } from "@nexia/shared";

export {
    PLATFORM_PAGE_HEADER as ADMIN_TAX_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as ADMIN_TAX_TITLE_WRAP,
    PLATFORM_BACK_BUTTON as ADMIN_TAX_BACK_BUTTON,
    PLATFORM_ALERT_SPACING as ADMIN_TAX_ALERT_SPACING,
};

export const ADMIN_TAX_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_72%)]";

export const ADMIN_TAX_STACK = "relative space-y-6 lg:space-y-8";
export const ADMIN_TAX_HEADER_ACTIONS = "flex flex-wrap items-center gap-2";
export const ADMIN_TAX_TOOLBAR = cn(
    NEXIA_GLASS_CARD,
    "relative flex flex-col gap-3 p-3 sm:p-4",
    "lg:flex-row lg:items-center lg:justify-between"
);
export const ADMIN_TAX_TOOLBAR_SEARCH = "w-full lg:max-w-sm";
export const ADMIN_TAX_FILTER_ROW = "flex flex-wrap gap-2";
export const ADMIN_TAX_TABS = "flex flex-wrap gap-2";
export const ADMIN_TAX_KIND_ROW = ADMIN_TAX_TABS;

export function adminTaxFilterClass(isActive: boolean): string {
    return nexiaSegmentedItemClass(isActive);
}

export const ADMIN_TAX_TABLE_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative overflow-hidden"
);
export const ADMIN_TAX_TABLE_SCROLL = "hidden overflow-x-auto md:block";
export const ADMIN_TAX_TABLE = "w-full min-w-[48rem] border-collapse text-sm";
export const ADMIN_TAX_TH =
    "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";
export const ADMIN_TAX_TR = cn(
    "border-t border-border/40 transition-colors hover:bg-muted/30"
);
export const ADMIN_TAX_TR_INACTIVE = "opacity-60";
export const ADMIN_TAX_TD = "px-4 py-3 align-middle";
export const ADMIN_TAX_TD_MUTED = "px-4 py-3 align-middle text-muted-foreground";
export const ADMIN_TAX_TD_NAME = "px-4 py-3 align-middle font-medium text-foreground";
export const ADMIN_TAX_ROW_ACTIONS = "flex flex-wrap gap-2";
export const ADMIN_TAX_CARD_LIST = "space-y-3 md:hidden p-3";
export const ADMIN_TAX_CARD_ITEM = cn(NEXIA_GLASS_CARD, "p-4 space-y-2");
export const ADMIN_TAX_CARD_TITLE_ROW = "flex items-start justify-between gap-2";
export const ADMIN_TAX_CARD_META = "text-sm text-muted-foreground space-y-1";
export const ADMIN_TAX_CARD_ACTIONS = "flex flex-wrap gap-2 pt-1";
export const ADMIN_TAX_PAGINATION = "p-3 pt-0";
export const ADMIN_TAX_SKELETON_LIST = "space-y-3 p-3";
export const ADMIN_TAX_SKELETON_ROW = "h-14 animate-pulse rounded-xl bg-muted/40";
export const ADMIN_TAX_FORM_GRID = "grid gap-3 sm:grid-cols-2";
export const ADMIN_TAX_FORM_FULL = "sm:col-span-2 space-y-1.5";
export const ADMIN_TAX_HINT = "text-xs text-muted-foreground";
export const ADMIN_TAX_BREAKDOWN = "mt-2 space-y-1 text-sm text-muted-foreground";

export const TAXONOMY_KIND_LABELS: Record<TaxonomyKind, string> = {
    patterns: "Patrones",
    "muscle-groups": "Grupos musculares",
    muscles: "Músculos",
    joints: "Articulaciones",
    "joint-movements": "Movimientos articulares",
    equipment: "Equipamiento",
    tags: "Tags",
};

export const TAXONOMY_KIND_TABS = (
    Object.entries(TAXONOMY_KIND_LABELS) as [TaxonomyKind, string][]
).map(([kind, label]) => ({ kind, label }));

export const UI_BUCKET_OPTIONS = [
    { value: "LOWER", label: "Tren inferior" },
    { value: "UPPER", label: "Tren superior" },
    { value: "CORE", label: "Core / Estabilidad" },
    { value: "POWER_LOCOMOTION", label: "Potencia / Locomoción" },
    { value: "ACCESSORY", label: "Accesorio / Prehab" },
] as const;

export const ADMIN_TAX_COPY = {
    pageTitle: "Taxonomías",
    title: "Taxonomías",
    pageSubtitle: (kindLabel: string, total: number) =>
        `${kindLabel} · ${total} término${total === 1 ? "" : "s"}`,
    backToAdmin: "Volver al inicio",
    newItem: "Nuevo",
    searchPlaceholder: "Buscar por nombre…",
    searchLabel: "Buscar taxonomía",
    includeInactive: "Incluir inactivos",
    colName: "Nombre",
    colNameEn: "name_en",
    colEn: "name_en",
    colUsage: "En uso",
    colStatus: "Estado",
    colExtra: "Detalle",
    colActions: "Acciones",
    empty: "No hay términos en este tipo.",
    listEmptyTitle: "Sin resultados",
    listEmptyBody: "No hay términos con estos filtros.",
    error: "No se pudo cargar la taxonomía.",
    listError: "No se pudo cargar la taxonomía.",
    retry: "Reintentar",
    active: "Activo",
    inactive: "Inactivo",
    statusActive: "Activo",
    statusInactive: "Inactivo",
    edit: "Editar",
    nameEnHint: "Clave del importador Excel — no editable.",
    deactivate: "Desactivar",
    reactivate: "Reactivar",
    deactivateTitle: "Desactivar término",
    reactivateTitle: "Reactivar término",
    deactivateBody: "¿Desactivar este término? Podrás reactivarlo después.",
    reactivateBody: "¿Reactivar este término?",
    deactivateConfirm: "Desactivar",
    reactivateConfirm: "Reactivar",
    deactivateBlocked: "No se puede desactivar: está en uso.",
    deactivateOk: "¿Desactivar este término? Podrás reactivarlo después.",
    reactivateOk: "¿Reactivar este término?",
    usageBreakdownTitle: "Uso por tabla",
    impactTitle: "Impacto del cambio",
    impactBody: (n: number) =>
        `Afecta a ${n} ejercicio${n === 1 ? "" : "s"} y a la carga semanal por músculo.`,
    impactConfirm: "Confirmar cambio",
    save: "Guardar",
    cancel: "Cancelar",
    createTitle: "Nuevo término",
    editTitle: "Editar término",
} as const;

export function taxonomyDisplayName(item: TaxonomyItemOut): string {
    return item.name_es || item.name || item.name_en || `#${item.id}`;
}

export function formatUsageBreakdown(
    breakdown: Record<string, number> | null | undefined
): { table: string; count: number }[] {
    if (!breakdown) return [];
    return Object.entries(breakdown)
        .map(([table, count]) => ({ table, count }))
        .sort((a, b) => b.count - a.count);
}
