/**
 * adminCatalogPresentation.ts — Tokens y copy Admin catálogo de ejercicios (M5).
 *
 * Doc: DESIGN_PREMIUM.md · 13_UX_ADMIN_CATALOGO.md
 * Sin clases sueltas en pages.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { cn } from "@/lib/utils";
import {
    PLATFORM_DASHBOARD_FOOTER_BTN,
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD,
    PLATFORM_FORM_BODY,
    PLATFORM_FORM_SECTION,
    PLATFORM_FORM_SECTION_TITLE,
    PLATFORM_FORM_SHELL,
} from "@/components/ui/forms/platformFormPresentation";
import {
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
    PLATFORM_BACK_BUTTON,
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
    PLATFORM_LOADING_ROW,
    PLATFORM_ALERT_SPACING,
    nexiaSegmentedItemClass,
} from "@/components/ui/surface/platformPremiumPresentation";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";

export {
    PLATFORM_PAGE_HEADER as ADMIN_CATALOG_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as ADMIN_CATALOG_TITLE_WRAP,
    PLATFORM_BACK_BUTTON as ADMIN_CATALOG_BACK_BUTTON,
    PLATFORM_LOADING_ROW as ADMIN_CATALOG_LOADING_ROW,
    PLATFORM_ALERT_SPACING as ADMIN_CATALOG_ALERT_SPACING,
};

export const ADMIN_CATALOG_PAGE = PLATFORM_PAGE_WITH_FIXED_FOOTER;

export const ADMIN_CATALOG_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_72%)]";

export const ADMIN_CATALOG_STACK = "relative space-y-6 lg:space-y-8";

export const ADMIN_CATALOG_LAYOUT = cn(
    "grid grid-cols-1 gap-6",
    "lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8"
);

export const ADMIN_CATALOG_INDEX = cn(
    "hidden lg:block",
    "sticky top-4 self-start",
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-1 p-3"
);

export const ADMIN_CATALOG_INDEX_LINK = cn(
    "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm",
    "text-muted-foreground hover:bg-primary/10 hover:text-primary",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const ADMIN_CATALOG_INDEX_LINK_ACTIVE = "bg-primary/15 text-primary";

export const ADMIN_CATALOG_INDEX_ERROR_BADGE = cn(
    "inline-flex min-w-[1.25rem] items-center justify-center rounded-full",
    "bg-destructive/20 px-1.5 text-[10px] font-semibold text-destructive"
);

export const ADMIN_CATALOG_MOBILE_STEPPER = cn(
    "flex gap-2 overflow-x-auto pb-1 lg:hidden",
    "scrollbar-thin"
);

export const ADMIN_CATALOG_STEPPER_CHIP = cn(
    "shrink-0 rounded-md border border-border/80 px-3 py-1.5 text-xs font-medium",
    "text-muted-foreground"
);

export const ADMIN_CATALOG_STEPPER_CHIP_ACTIVE = cn(
    "border-primary/40 bg-primary/15 text-primary"
);

export const ADMIN_CATALOG_STEPPER_CHIP_ERROR = cn(
    "border-destructive/40 text-destructive"
);

export const ADMIN_CATALOG_FORM_SHELL = PLATFORM_FORM_SHELL;

export const ADMIN_CATALOG_FORM_BODY = PLATFORM_FORM_BODY;

export const ADMIN_CATALOG_SECTION = cn(PLATFORM_FORM_SECTION, "scroll-mt-24");

export const ADMIN_CATALOG_SECTION_TITLE = PLATFORM_FORM_SECTION_TITLE;

export const ADMIN_CATALOG_SECTION_HINT = "text-sm leading-relaxed text-muted-foreground";

export const ADMIN_CATALOG_ROW = cn(
    "flex flex-col gap-3 rounded-lg border border-border/70 bg-surface-2/30 p-3",
    "sm:flex-row sm:items-end sm:gap-3"
);

export const ADMIN_CATALOG_ROW_DRAG = cn(
    ADMIN_CATALOG_ROW,
    "cursor-grab active:cursor-grabbing"
);

export const ADMIN_CATALOG_ROW_DRAG_HANDLE =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary";

export const ADMIN_CATALOG_FIELD_GROW = "min-w-0 flex-1";

export const ADMIN_CATALOG_ADD_ROW = "pt-1";

export const ADMIN_CATALOG_PICKER_PANEL = cn(
    "mt-2 max-h-48 space-y-1 overflow-y-auto rounded-md border border-border/70 bg-black/40 p-2"
);

export const ADMIN_CATALOG_PICKER_OPTION = cn(
    "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm",
    "text-foreground hover:bg-primary/10"
);

export const ADMIN_CATALOG_PICKER_GROUP_LABEL =
    "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground";

export const ADMIN_CATALOG_CHIP_LIST = "flex flex-wrap gap-2";

export const ADMIN_CATALOG_META_ROW = "flex flex-wrap items-center gap-2 text-sm text-muted-foreground";

export const ADMIN_CATALOG_HEADER_ACTIONS = "flex flex-wrap items-center gap-2";

export const ADMIN_CATALOG_FOOTER_SHELL = cn(
    "border-border/80 bg-background/90 backdrop-blur-md"
);

export const ADMIN_CATALOG_FOOTER_ROW = cn(
    "pointer-events-auto flex w-full min-w-0 max-w-full flex-col gap-3",
    "md:flex-row md:flex-nowrap md:items-center md:justify-between"
);

export const ADMIN_CATALOG_FOOTER_LEFT = cn(
    "flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap",
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD
);

export const ADMIN_CATALOG_FOOTER_ACTIONS = cn(
    "flex w-full min-w-0 flex-col-reverse gap-2",
    "sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3 md:w-auto md:shrink-0",
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD
);

export const ADMIN_CATALOG_FOOTER_BTN = PLATFORM_DASHBOARD_FOOTER_BTN;

export const ADMIN_CATALOG_HISTORY_LIST = "space-y-3";

export const ADMIN_CATALOG_HISTORY_ITEM = cn(
    "rounded-lg border border-border/70 bg-surface-2/30 px-3 py-2.5 text-sm"
);

export const ADMIN_CATALOG_HISTORY_META = "text-xs text-muted-foreground";

/* ---------------------------------------------------------------------------
 * Listado (§3.1) — toolbar, tabla desktop, cards móvil, progreso.
 * ------------------------------------------------------------------------- */

export const ADMIN_CATALOG_TOOLBAR = cn(
    NEXIA_GLASS_CARD,
    "relative flex flex-col gap-3 p-3 sm:p-4",
    "lg:flex-row lg:items-center lg:justify-between"
);

export const ADMIN_CATALOG_TOOLBAR_SEARCH = "w-full lg:max-w-sm";

export const ADMIN_CATALOG_FILTER_ROW = "flex flex-wrap gap-2";

/** Toggle de filtro (aria-pressed) sobre la barra segmentada premium. */
export function adminCatalogFilterClass(isActive: boolean): string {
    return nexiaSegmentedItemClass(isActive);
}

export const ADMIN_CATALOG_PROGRESS_ROW =
    "mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground";

export const ADMIN_CATALOG_PROGRESS_VALUE = "font-semibold text-foreground";

export const ADMIN_CATALOG_TABLE_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative overflow-hidden"
);

export const ADMIN_CATALOG_TABLE_SCROLL = "hidden overflow-x-auto md:block";

export const ADMIN_CATALOG_TABLE = "w-full min-w-[46rem] border-collapse text-sm";

export const ADMIN_CATALOG_TH =
    "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

export const ADMIN_CATALOG_TR = cn(
    "cursor-pointer border-t border-border/60 transition-colors hover:bg-primary/5",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
);

export const ADMIN_CATALOG_TR_INACTIVE = "opacity-60";

export const ADMIN_CATALOG_TD = "px-4 py-3 align-middle text-foreground";

export const ADMIN_CATALOG_TD_MUTED = cn(ADMIN_CATALOG_TD, "text-muted-foreground");

export const ADMIN_CATALOG_TD_NAME = cn(ADMIN_CATALOG_TD, "font-medium");

export const ADMIN_CATALOG_CARD_LIST = "space-y-3 p-3 md:hidden";

export const ADMIN_CATALOG_CARD_ITEM = cn(
    "flex w-full min-h-[3rem] flex-col gap-2 rounded-lg border border-border/70",
    "bg-surface-2/30 p-3 text-left transition-colors hover:border-primary/30",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const ADMIN_CATALOG_CARD_TITLE_ROW =
    "flex items-start justify-between gap-2 text-sm font-medium text-foreground";

export const ADMIN_CATALOG_CARD_META = "text-xs text-muted-foreground";

export const ADMIN_CATALOG_SKELETON_LIST = "space-y-2 p-4";

export const ADMIN_CATALOG_SKELETON_ROW =
    "h-11 animate-pulse rounded-md bg-surface-2/50";

export const ADMIN_CATALOG_PAGINATION = "mt-4";

/* ---------------------------------------------------------------------------
 * Import / export (§3.4).
 * ------------------------------------------------------------------------- */

export const ADMIN_CATALOG_IMPORT_GRID = "grid grid-cols-1 gap-4 lg:grid-cols-2";

export const ADMIN_CATALOG_IMPORT_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-4 p-4 sm:p-5"
);

export const ADMIN_CATALOG_IMPORT_STEP_LABEL =
    "text-[11px] font-semibold uppercase tracking-wide text-primary";

export const ADMIN_CATALOG_IMPORT_CARD_TITLE = "text-base font-semibold text-foreground";

export const ADMIN_CATALOG_IMPORT_FILE_INPUT = cn(
    "block w-full cursor-pointer rounded-lg border border-border/70 bg-surface-2/30",
    "px-3 py-2.5 text-sm text-foreground",
    "file:mr-3 file:rounded-md file:border-0 file:bg-primary/15 file:px-3 file:py-1.5",
    "file:text-sm file:font-medium file:text-primary hover:file:bg-primary/25",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const ADMIN_CATALOG_IMPORT_ACTIONS = "flex flex-wrap items-center gap-2";

export const ADMIN_CATALOG_SUMMARY_GRID = "grid grid-cols-1 gap-3 sm:grid-cols-3";

export const ADMIN_CATALOG_SUMMARY_TILE = cn(
    "rounded-lg border border-border/70 bg-surface-2/30 p-3"
);

export const ADMIN_CATALOG_SUMMARY_TILE_VALUE = "text-xl font-semibold text-foreground";

export const ADMIN_CATALOG_SUMMARY_TILE_LABEL = "text-xs text-muted-foreground";

export const ADMIN_CATALOG_SUMMARY_LIST =
    "max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border/70 bg-surface-2/20 p-3";

export const ADMIN_CATALOG_SUMMARY_ITEM = "text-sm text-foreground";

export const ADMIN_CATALOG_SUMMARY_ITEM_FIELDS = "text-xs text-muted-foreground";

export const ADMIN_CATALOG_VIOLATION_LIST =
    "max-h-64 space-y-2 overflow-y-auto rounded-lg border border-destructive/30 bg-destructive/5 p-3";

export const ADMIN_CATALOG_VIOLATION_ITEM = "text-sm text-foreground";

export const ADMIN_CATALOG_VIOLATION_META = "text-xs text-muted-foreground";

/** Copy UI — textos fijos de listado, ficha e import/export. */
export const ADMIN_CATALOG_COPY = {
    listTitle: "Catálogo de ejercicios",
    listNew: "Nuevo ejercicio",
    listImport: "Importar",
    searchLabel: "Buscar por nombre o slug EN",
    searchPlaceholderList: "Buscar nombre / slug EN…",
    filterPending: "Pendientes de revisión",
    filterIncludeInactive: "Incluir inactivos",
    filterQualityIssues: "Solo incidencias calidad",
    progressLabel: (reviewed: number, active: number) =>
        `Progreso revisión: ${reviewed}/${active} activos`,
    issuesLabel: (count: number) =>
        count === 1 ? "1 incidencia" : `${count} incidencias`,
    colCode: "ID",
    colName: "Nombre ES",
    colReview: "Revisión",
    colQuality: "Calidad",
    colOpen: "Abrir ficha",
    inactiveBadge: "Inactivo",
    listEmptyTitle: "Sin ejercicios para estos filtros",
    listEmptyBody: "Ajusta la búsqueda o limpia los filtros activos.",
    listClearFilters: "Limpiar filtros",
    listError: "No se pudo cargar el catálogo",
    retry: "Reintentar",
    createTitle: "Nuevo ejercicio",
    editTitle: "Editar ejercicio",
    backToList: "Volver al catálogo",
    backToAdmin: "Volver al panel",
    markReviewed: "Marcar como revisado",
    history: "Historial",
    cancel: "Cancelar",
    save: "Guardar",
    reviewedAndNext: "Revisado y siguiente",
    queueDone: "Cola completada",
    sectionDatos: "Datos",
    sectionMusculos: "Músculos",
    sectionPatrones: "Patrones",
    sectionArticulaciones: "Articulaciones",
    sectionMaterial: "Material",
    sectionEtiquetas: "Etiquetas",
    jointsHint:
        "Registra articulación y acción de movimiento tal como usa el motor de lesiones. Una acción incorrecta o genérica impide avisar al entrenador cuando un ejercicio coincide con la lesión activa del cliente.",
    jointsBridgeHint:
        "Las acciones se listan con búsqueda (todas las activas). El filtro por articulación válida llegará cuando exista la tabla joint_valid_movements.",
    musclesPmHint: "Arrastra los prime movers para definir la prioridad (1…n al guardar).",
    exerciseIdReadonly: "ID de negocio",
    conflictTitle: "La ficha cambió en el servidor",
    conflictBody:
        "Otro cambio se guardó mientras editabas. Recarga la ficha para continuar. No se permite sobrescribir.",
    conflictReload: "Recargar ficha",
    conflictClose: "Cerrar",
    historyTitle: "Historial",
    historyEmpty: "Sin cambios registrados",
    historyLoading: "Cargando historial…",
    historyError: "No se pudo cargar el historial",
    reviewPending: "Pendiente de revisión",
    reviewDone: "Revisado",
    validationAlert: "Revisa los errores marcados en las secciones",
    discardConfirm: "Hay cambios sin guardar. ¿Salir sin guardar?",
    addMuscle: "Añadir músculo",
    addPattern: "Añadir patrón",
    addJoint: "Añadir articulación",
    addEquipment: "Añadir material",
    addTag: "Añadir etiqueta",
    removeRow: "Quitar",
    searchPlaceholder: "Buscar…",
    rolePrimeMover: "Prime mover",
    roleSynergist: "Sinergista",
    roleStabilizer: "Estabilizador",
    rolePrimary: "Primary",
    roleSecondary: "Secondary",
    savedToast: "Ejercicio guardado",
    reviewedToast: "Marcado como revisado",
    createdToast: "Ejercicio creado",
    deactivate: "Desactivar",
    reactivate: "Reactivar",
    deactivateTitle: "Desactivar ejercicio",
    deactivateBody:
        "Dejará de aparecer en los selectores de nuevas sesiones. Las sesiones y plantillas existentes mantienen la referencia.",
    deactivateConfirm: "Desactivar",
    deactivatedToast: "Ejercicio desactivado",
    deactivateError: "No se pudo desactivar el ejercicio",
    reactivateTitle: "Reactivar ejercicio",
    reactivateBody: "El ejercicio volverá a estar disponible en los selectores de sesión.",
    reactivateConfirm: "Reactivar",
    reactivatedToast: "Ejercicio reactivado",
    reactivateError: "No se pudo reactivar el ejercicio",
    saveBeforeToggleActive: "Guarda los cambios antes de cambiar el estado del ejercicio",
    importTitle: "Importar y exportar catálogo",
    importBackToList: "Volver al catálogo",
    importStep1: "Paso 1 — Origen",
    importStep2: "Paso 2 — Validar",
    importStep3: "Paso 3 — Confirmar",
    importExportCardTitle: "Exportar catálogo actual",
    importExportCardBody:
        "Descarga el catálogo en formato Excel v2 para editarlo y volver a importarlo.",
    importExportAction: "Exportar Excel v2",
    importExportIncludeInactive: "Incluir inactivos",
    importExportError: "No se pudo exportar el catálogo",
    importExportedToast: "Exportación descargada",
    importFileLabel: "Archivo Excel v2 (.xlsx)",
    importFileHint: "Tamaño máximo: 25 MB. Solo .xlsx (exportación Excel v2 del catálogo).",
    importValidateAction: "Validar archivo",
    importValidateError: "No se pudo validar el archivo",
    importNoFile: "Selecciona un archivo .xlsx",
    importViolationsTitle: "Errores que bloquean la importación",
    importOkTitle: "Archivo válido",
    importOkBody: "Revisa el resumen de cambios antes de confirmar. La importación es todo o nada.",
    importOverwriteWarning:
        "Estos ejercicios se sobrescribirán con el contenido del Excel. Los cambios hechos en la web después de tu exportación se perderán.",
    importOverwriteCodesLabel: "Códigos afectados",
    importSummaryTitle: "Resumen de cambios",
    importSummaryNew: "Nuevos",
    importSummaryUpdated: "Actualizados",
    importSummaryUnchanged: "Sin cambios",
    importSummaryNoDetail: "Sin detalle de campos",
    importConfirmAction: "Confirmar import",
    importConfirmError: "No se pudo confirmar la importación",
    importConfirmedTitle: "Importación completada",
    importConfirmedBody: (count: number) =>
        `${count} ejercicio(s) importados. Los que cambiaron vuelven a pendiente de revisión.`,
    importConfirmedToast: "Importación completada",
    importGoToList: "Ir al listado",
    importPendingValidation: "Valida el archivo antes de confirmar",
} as const;

/** Etiquetas §3.1 para los códigos `quality_flags` del backend. */
export const ADMIN_CATALOG_QUALITY_FLAG_LABELS: Record<string, string> = {
    OK: "OK",
    NO_PM: "Sin PM",
    PM_PRIORITY: "Prioridades PM",
    NO_PRIMARY_PATTERN: "Patrón",
    NO_EQUIPMENT: "Material",
    INCOMPLETE_JOINT_ACTIONS: "Articulaciones",
    VOLUME_MAPPING: "Mapeo volumen",
};

export function adminCatalogQualityFlagLabel(flag: string): string {
    return ADMIN_CATALOG_QUALITY_FLAG_LABELS[flag] ?? flag;
}

export const ADMIN_CATALOG_SECTIONS = [
    { id: "datos" as const, label: ADMIN_CATALOG_COPY.sectionDatos },
    { id: "musculos" as const, label: ADMIN_CATALOG_COPY.sectionMusculos },
    { id: "patrones" as const, label: ADMIN_CATALOG_COPY.sectionPatrones },
    { id: "articulaciones" as const, label: ADMIN_CATALOG_COPY.sectionArticulaciones },
    { id: "material" as const, label: ADMIN_CATALOG_COPY.sectionMaterial },
    { id: "etiquetas" as const, label: ADMIN_CATALOG_COPY.sectionEtiquetas },
];

/** Copy dashboard admin — aviso catálogo (§6.1). */
export const ADMIN_DASHBOARD_CATALOG_ALERT = {
    titleSingular: (n: number) => `Catálogo: ${n} ejercicio sin mapeo muscular`,
    titlePlural: (n: number) => `Catálogo: ${n} ejercicios sin mapeo muscular`,
    body: "Los entrenadores verán avisos al programar sesiones. Revisa y corrige el catálogo.",
    cta: "Ir al catálogo",
    catalogHintOk: "Mapeos musculares al día",
    catalogHintGaps: (n: number) =>
        `${n} ejercicio(s) sin mapeo muscular — requiere revisión`,
    catalogLabel: "Catálogo de ejercicios",
} as const;
