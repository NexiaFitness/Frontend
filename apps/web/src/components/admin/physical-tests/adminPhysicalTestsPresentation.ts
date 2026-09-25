/**
 * adminPhysicalTestsPresentation.ts — Tokens y copy Admin tests físicos (T2).
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
import {
    PHYSICAL_TEST_CATEGORIES,
    type PhysicalTestCategory,
} from "@nexia/shared/types/adminPhysicalTests";

export {
    PLATFORM_PAGE_HEADER as ADMIN_PT_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as ADMIN_PT_TITLE_WRAP,
    PLATFORM_BACK_BUTTON as ADMIN_PT_BACK_BUTTON,
    PLATFORM_ALERT_SPACING as ADMIN_PT_ALERT_SPACING,
};

export const ADMIN_PT_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_72%)]";

export const ADMIN_PT_STACK = "relative space-y-6 lg:space-y-8";

export const ADMIN_PT_HEADER_ACTIONS = "flex flex-wrap items-center gap-2";

export const ADMIN_PT_TOOLBAR = cn(
    NEXIA_GLASS_CARD,
    "relative flex flex-col gap-3 p-3 sm:p-4",
    "lg:flex-row lg:items-center lg:justify-between"
);

export const ADMIN_PT_TOOLBAR_SEARCH = "w-full lg:max-w-sm";

export const ADMIN_PT_FILTER_ROW = "flex flex-wrap gap-2";

export function adminPtFilterClass(isActive: boolean): string {
    return nexiaSegmentedItemClass(isActive);
}

export const ADMIN_PT_TABLE_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative overflow-hidden"
);

export const ADMIN_PT_TABLE_SCROLL = "hidden overflow-x-auto md:block";

export const ADMIN_PT_TABLE = "w-full min-w-[52rem] border-collapse text-sm";

export const ADMIN_PT_TH =
    "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

export const ADMIN_PT_TR = cn(
    "border-t border-border/60 transition-colors hover:bg-primary/5",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
);

export const ADMIN_PT_TR_INACTIVE = "opacity-60";

export const ADMIN_PT_TD = "px-4 py-3 align-middle text-foreground";

export const ADMIN_PT_TD_MUTED = cn(ADMIN_PT_TD, "text-muted-foreground");

export const ADMIN_PT_TD_NAME = cn(ADMIN_PT_TD, "font-medium");

export const ADMIN_PT_CARD_LIST = "space-y-3 p-3 md:hidden";

export const ADMIN_PT_CARD_ITEM = cn(
    "flex w-full min-h-[3rem] flex-col gap-2 rounded-lg border border-border/70",
    "bg-surface-2/30 p-3 text-left transition-colors hover:border-primary/30"
);

export const ADMIN_PT_CARD_TITLE_ROW =
    "flex items-start justify-between gap-2 text-sm font-medium text-foreground";

export const ADMIN_PT_CARD_META = "text-xs text-muted-foreground";

export const ADMIN_PT_CARD_ACTIONS = "flex flex-wrap gap-2 pt-1";

export const ADMIN_PT_ROW_ACTIONS = "flex flex-wrap gap-2";

export const ADMIN_PT_SKELETON_LIST = "space-y-2 p-4";

export const ADMIN_PT_SKELETON_ROW = "h-11 animate-pulse rounded-md bg-surface-2/50";

export const ADMIN_PT_PAGINATION = "mt-4";

export const ADMIN_PT_MODAL_FIELD = "space-y-4";

export const ADMIN_PT_HINT = "text-xs leading-relaxed text-muted-foreground";

export const ADMIN_PT_FORM_GRID = "grid gap-3 sm:grid-cols-2";

export const CATEGORY_LABELS: Record<PhysicalTestCategory, string> = {
    strength: "Fuerza",
    power: "Potencia",
    speed: "Velocidad",
    aerobic: "Aeróbico",
    anaerobic: "Anaeróbico",
    mobility: "Movilidad",
};

export const CATEGORY_OPTIONS = PHYSICAL_TEST_CATEGORIES.map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
}));

export function formatPhysicalTestCategory(category: string): string {
    if (category in CATEGORY_LABELS) {
        return CATEGORY_LABELS[category as PhysicalTestCategory];
    }
    return category;
}

export const ADMIN_PT_COPY = {
    pageTitle: "Tests físicos",
    pageSubtitle: (total: number, scope: string) =>
        `${scope} · ${total} test${total === 1 ? "" : "s"}`,
    scopeStandard: "Estándar",
    scopeTrainer: "De entrenadores",
    backToAdmin: "Volver al inicio",
    newStandard: "Nuevo estándar",
    newItem: "Nuevo estándar",
    searchPlaceholder: "Buscar por nombre…",
    searchLabel: "Buscar tests físicos",
    includeInactive: "Incluir inactivos",
    trainerIdPlaceholder: "ID entrenador",
    trainerIdLabel: "Filtrar por entrenador",
    retry: "Reintentar",
    listError: "No se pudo cargar el listado de tests físicos.",
    error: "No se pudo cargar los tests.",
    listEmptyTitle: "Sin resultados",
    listEmptyBody: "Prueba otros filtros o crea un test estándar.",
    empty: "No hay tests en este segmento.",
    clearFilters: "Quitar filtros",
    colName: "Nombre",
    colCategory: "Categoría",
    colUnit: "Unidad",
    colExercise: "Ejercicio principal",
    colFrequency: "Frecuencia (sem)",
    colTrainer: "Entrenador",
    colResults: "Resultados",
    colStatus: "Estado",
    colActions: "Acciones",
    statusActive: "Activo",
    statusInactive: "Inactivo",
    active: "Activo",
    inactive: "Inactivo",
    edit: "Editar",
    deactivate: "Desactivar",
    reactivate: "Reactivar",
    cancel: "Cancelar",
    save: "Guardar",
    createTitle: "Nuevo test estándar",
    editTitle: "Editar test estándar",
    fieldName: "Nombre",
    fieldCategory: "Categoría",
    fieldUnit: "Unidad",
    fieldDescription: "Descripción",
    fieldFrequency: "Frecuencia por defecto (semanas)",
    fieldExercise: "Ejercicio principal",
    fieldExerciseSearch: "Buscar ejercicio del catálogo…",
    fieldExerciseClear: "Quitar ejercicio",
    fieldFormula: "Fórmula",
    fieldNotes: "Notas",
    deactivateTitle: "Desactivar test",
    deactivateBody:
        "El test dejará de ofrecerse en altas nuevas. Los resultados históricos del cliente siguen visibles.",
    deactivateConfirm: "Desactivar",
    reactivateTitle: "Reactivar test",
    reactivateBody: "El test estándar volverá a estar disponible.",
    reactivateConfirm: "Reactivar",
    readOnlyTrainer: "Solo lectura — tests de entrenadores",
    none: "—",
} as const;
