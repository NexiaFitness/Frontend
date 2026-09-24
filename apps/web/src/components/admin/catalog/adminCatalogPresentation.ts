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

export const ADMIN_CATALOG_LIST_STUB_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-4 p-5 sm:p-6"
);

/** Copy UI — textos fijos de la ficha / listado stub. */
export const ADMIN_CATALOG_COPY = {
    listTitle: "Catálogo de ejercicios",
    listStubTitle: "Listado admin en el siguiente bloque",
    listStubBody:
        "Cuando M4 cierre listado, desactivar/reactivar e import/export, esta pantalla tendrá cola de revisión, filtros y progreso. Mientras tanto puedes crear o abrir una ficha por URL.",
    listStubNew: "Nuevo ejercicio",
    listStubBack: "Volver al panel",
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
} as const;

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
