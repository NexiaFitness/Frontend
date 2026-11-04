/**
 * adminCatalogReviewPresentation.ts — Tokens y copy de la revisión masiva (H5).
 *
 * Filas del listado de sesiones del atleta, filtros segmentados y un primary
 * en el footer. El chip de rúbrica usa la variante `subtle` (tinte primary):
 * Badge no tiene variante info.
 */

import { cn } from "@/lib/utils";
import { ATHLETE_SESSION_LIST_ITEM } from "@/components/athlete/sessions/athleteSessionsPresentation";
import { PLATFORM_DASHBOARD_FOOTER_ROW } from "@/components/ui/forms/platformFormPresentation";
import {
    NEXIA_SEGMENTED_SCROLL,
    NEXIA_SEGMENTED_SHELL,
    PLATFORM_ALERT_SPACING,
    PLATFORM_BODY_MUTED,
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
    nexiaSegmentedItemClass,
    nexiaSegmentedTrackClass,
} from "@/components/ui/surface/platformPremiumPresentation";
import type { CatalogValueReviewFilter } from "@nexia/shared/types/adminCatalog";

export const ADMIN_CATALOG_REVIEW_PATH = "/dashboard/admin/catalog/review";

export const ADMIN_CATALOG_REVIEW_PAGE = PLATFORM_PAGE_WITH_FIXED_FOOTER;

export const ADMIN_CATALOG_REVIEW_HEADER = PLATFORM_PAGE_HEADER;

export const ADMIN_CATALOG_REVIEW_STACK = "relative min-w-0 space-y-4";

export const ADMIN_CATALOG_REVIEW_ALERT = PLATFORM_ALERT_SPACING;

export const ADMIN_CATALOG_REVIEW_FILTERS = "min-w-0 space-y-3";

export const ADMIN_CATALOG_REVIEW_SEGMENTED_SHELL = cn(NEXIA_SEGMENTED_SHELL, "min-w-0 max-w-full");

export const ADMIN_CATALOG_REVIEW_SEGMENTED_SCROLL = NEXIA_SEGMENTED_SCROLL;

export const ADMIN_CATALOG_REVIEW_SEGMENTED_TRACK = nexiaSegmentedTrackClass("content");

export function adminCatalogReviewSegmentClass(selected: boolean): string {
    return cn(nexiaSegmentedItemClass(selected, "content"), "min-h-touch");
}

export const ADMIN_CATALOG_REVIEW_NARROW = "grid grid-cols-1 gap-3 sm:grid-cols-3";

export const ADMIN_CATALOG_REVIEW_LIST = "space-y-3 pb-4";

export const ADMIN_CATALOG_REVIEW_ROW = cn(
    ATHLETE_SESSION_LIST_ITEM,
    "cursor-default flex-col items-stretch gap-3 hover:border-border/80 active:scale-100"
);

export const ADMIN_CATALOG_REVIEW_ROW_TOP = "flex items-start gap-3";

/** El Checkbox de formulario trae `w-full`; en la fila solo debe ocupar el cuadro. */
export const ADMIN_CATALOG_REVIEW_CHECK = "shrink-0 [&>div]:w-auto";

export const ADMIN_CATALOG_REVIEW_ROW_BODY = "min-w-0 flex-1 space-y-1";

export const ADMIN_CATALOG_REVIEW_TITLE = "text-left font-semibold leading-snug text-foreground";

export const ADMIN_CATALOG_REVIEW_META = "text-caption leading-snug text-muted-foreground";

export const ADMIN_CATALOG_REVIEW_CHIPS = "flex flex-wrap gap-2";

export const ADMIN_CATALOG_REVIEW_NOTE = cn(PLATFORM_BODY_MUTED, "break-words text-sm");

export const ADMIN_CATALOG_REVIEW_FIELDS = "grid w-full grid-cols-1 gap-3";

export const ADMIN_CATALOG_REVIEW_ACTIONS = "flex flex-wrap gap-2";

export const ADMIN_CATALOG_REVIEW_FOOTER = PLATFORM_DASHBOARD_FOOTER_ROW;

export const ADMIN_CATALOG_REVIEW_QUEUE_LINK = cn(
    "text-sm font-medium text-primary underline-offset-2 hover:underline",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const ADMIN_CATALOG_REVIEW_SKELETON = "h-28 animate-pulse rounded-xl bg-muted/40";

export const ADMIN_CATALOG_REVIEW_FILTERS_DEF: {
    id: CatalogValueReviewFilter;
    label: string;
}[] = [
    { id: "rubric", label: "Propuestos por rúbrica" },
    { id: "pending", label: "Pendientes" },
    { id: "tiebreak", label: "Resueltos por desempate" },
];

export const ADMIN_CATALOG_REVIEW_COPY = {
    title: "Revisión de carga y nivel",
    back: "Volver al catálogo",
    queueLink: (count: number) => `${count} por revisar`,
    searchLabel: "Buscar ejercicio",
    searchPlaceholder: "Nombre o código",
    axialAll: "Toda la carga axial",
    nivelAll: "Todo el nivel",
    patternLabel: "Patrón",
    patternPlaceholder: "Patrón primario",
    axialLabel: "Carga axial",
    nivelLabel: "Nivel",
    filterAxial: "Filtrar por carga axial",
    filterNivel: "Filtrar por nivel",
    rubricChip: "Rúbrica",
    pendingChip: "Pendiente",
    tiebreakChip: "Desempate",
    selectLabel: (nombre: string) => `Seleccionar ${nombre}`,
    reviewOne: "Marcar revisado",
    openFicha: "Abrir ficha",
    reviewMany: (count: number) => `Marcar revisadas (${count})`,
    clearSelection: "Quitar selección",
    confirmTitle: "Marcar como revisadas",
    confirmBody: "Se guardan la carga axial y el nivel que se ven en cada fila.",
    confirmAction: (count: number) => `Marcar revisadas (${count})`,
    cancel: "Cancelar",
    loading: "Guardando…",
    emptyTitle: "No hay ejercicios en este filtro",
    emptyBody: "Prueba otro estado, o quita la carga, el nivel o el patrón.",
    error: "No se pudo cargar la revisión.",
    retry: "Reintentar",
    conflict: (names: string[]) =>
        `Estos ejercicios cambiaron y no se aplicó ninguno: ${names.join(", ")}. La lista se ha vuelto a cargar.`,
    tooMany: "Se pueden marcar hasta 200 ejercicios a la vez.",
    fieldAxial: "Carga",
    fieldNivel: "Nivel",
} as const;
