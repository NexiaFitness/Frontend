/**
 * adminCatalogFichaPresentation.ts — Copy y clases de la ficha admin del ejercicio (H10).
 *
 * Contexto: DISENO_H10_FICHA_ADMIN. Tres columnas de tarjetas en escritorio (Datos y
 * Material | Músculos y Movimiento | Cómo cuenta y Relaciones) y la Técnica debajo; una
 * pila de tarjetas plegables en móvil, en el orden en que se trabaja.
 * Notas de mantenimiento:
 * - Jerarquía de tres niveles: h1 de página, título de tarjeta, etiqueta de grupo.
 * - Vocabulario del Excel y de la vista previa: Objetivo, Sinergista, Estabilizador;
 *   Primario, Secundario. «Objetivo de entrenamiento» es el campo de Datos.
 * - adminCatalogPresentation.ts supera 400 líneas y no crece: lo nuevo va aquí.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { cn } from "@/lib/utils";
import type { CatalogMuscleRole } from "@nexia/shared/types/adminCatalog";
import {
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    PLATFORM_PAGE_TITLE_H1,
    PLATFORM_SECTION_LABEL,
} from "@/components/ui/surface/platformPremiumPresentation";
import { NEXIA_DIVIDER_SUBTLE } from "@/components/ui/surface/nexiaDividerPresentation";

export type AdminCatalogCardId =
    | "datos"
    | "musculos"
    | "cuenta"
    | "movimiento"
    | "material"
    | "tecnica"
    | "relaciones";

/* ------------------------------------ Copy ------------------------------------ */

export const FICHA_COPY = {
    eyebrow: "Catálogo de ejercicios",
    queueEyebrow: (position: number, total: number) =>
        `Catálogo · Revisión ${position} de ${total}`,
    createTitle: "Nuevo ejercicio",
    createLead: "Rellena lo obligatorio (*) y guarda. Las alternativas se añaden después.",
    idLabel: "ID",
    reviewed: "Revisado",
    history: "Historial",
    back: "Volver al catálogo",
    inactive: "Inactivo",
    save: "Guardar",
    saveAndNext: "Guardar y siguiente",
    deactivate: "Desactivar",
    reactivate: "Reactivar",
    required: "*",
    none: "Ninguno",
    noneFeminine: "Ninguna",
    taken: "Ya añadido",
    errorSummary: (count: number) =>
        count === 1
            ? "Hay 1 dato que corregir antes de guardar."
            : `Hay ${count} datos que corregir antes de guardar.`,
    savedAndNextDone: "Revisión completada: no quedan ejercicios en la cola.",
} as const;

export const CARD_TITLES: Record<AdminCatalogCardId, string> = {
    datos: "Datos",
    musculos: "Músculos",
    cuenta: "Cómo cuenta",
    movimiento: "Movimiento",
    material: "Material y etiquetas",
    tecnica: "Técnica",
    relaciones: "Alternativas y variantes",
};

export const DATOS_COPY = {
    nombre: "Nombre",
    nombrePlaceholder: "Ej.: Curl de bíceps con mancuernas",
    nombreIngles: "Nombre en inglés",
    nombreInglesPlaceholder: "Opcional",
    objetivo: "Objetivo de entrenamiento",
    tipo: "Tipo",
    nivel: "Nivel",
    lateralidad: "Lateralidad",
    cargaAxial: "Carga axial",
} as const;

export const MUSCLE_COPY = {
    groups: {
        prime_mover: "Objetivo",
        synergist: "Sinergistas",
        stabilizer: "Estabilizadores",
    } satisfies Record<CatalogMuscleRole, string>,
    primeHint: "El orden es la prioridad",
    taken: {
        prime_mover: "Ya es objetivo",
        synergist: "Ya es sinergista",
        stabilizer: "Ya es estabilizador",
    } satisfies Record<CatalogMuscleRole, string>,
    addPrime: "Añadir objetivo",
    add: "Añadir",
    pickerTitle: {
        prime_mover: "Añadir músculo objetivo",
        synergist: "Añadir sinergista",
        stabilizer: "Añadir estabilizador",
    } satisfies Record<CatalogMuscleRole, string>,
    search: "Buscar músculo",
    empty: "Ningún músculo con ese nombre",
    moveUp: (name: string) => `Subir prioridad de ${name}`,
    moveDown: (name: string) => `Bajar prioridad de ${name}`,
    remove: (name: string) => `Quitar ${name}`,
    summary: (count: number) => (count === 1 ? "1 músculo" : `${count} músculos`),
} as const;

export const MOVEMENT_COPY = {
    patterns: "Patrón",
    joints: "Articulaciones",
    primary: "primario",
    secondary: "secundario",
    makePrimary: (name: string) => `Hacer primario: ${name}`,
    addPattern: "Añadir patrón",
    patternSearch: "Buscar patrón",
    patternEmpty: "Ningún patrón con ese nombre",
    addJoint: "Añadir articulación",
    jointSearch: "Buscar articulación",
    jointEmpty: "Ninguna articulación con ese nombre",
    actionTitle: (joint: string) => `${joint}: elige el movimiento`,
    actionSearch: "Buscar movimiento",
    actionEmpty: "Ningún movimiento con ese nombre",
    remove: (name: string) => `Quitar ${name}`,
    noPattern: "Sin patrón",
} as const;

export const MATERIAL_COPY = {
    material: "Material",
    tags: "Etiquetas",
    addMaterial: "Añadir material",
    materialSearch: "Buscar material",
    materialEmpty: "Ningún material con ese nombre",
    addTag: "Añadir etiqueta",
    tagSearch: "Buscar etiqueta",
    tagEmpty: "Ninguna etiqueta con ese nombre",
    remove: (name: string) => `Quitar ${name}`,
    summary: (materials: number, tags: number) =>
        materials === 0 && tags === 0
            ? "Sin material"
            : `${materials === 1 ? "1 material" : `${materials} materiales`} · ${
                  tags === 1 ? "1 etiqueta" : `${tags} etiquetas`
              }`,
} as const;

export const COUNT_COPY = {
    aside: "Volumen por serie",
    axial: "Carga axial",
    axialWeight: (weight: number) => `peso ${weight} de 3`,
    sessions: "Sesiones",
} as const;

export const RELATIONS_COPY = {
    alternatives: "Alternativas",
    savedOnAdd: "Se guardan al añadirlas",
    alternativesEmpty: "Ninguna. El entrenador verá aquí con qué sustituirlo.",
    variants: "Variantes",
    variantsEmpty: "Ninguna. Se crean desde la variante, eligiendo este como ejercicio base.",
    saveFirst: "Guarda el ejercicio para añadir alternativas.",
    add: "Añadir alternativa",
    pickerTitle: "Añadir alternativa",
    search: "Buscar ejercicio",
    empty: "Ningún ejercicio con ese nombre",
    remove: (name: string) => `Quitar ${name}`,
    summary: (alternatives: number) =>
        alternatives === 0 ? "Ninguna" : alternatives === 1 ? "1 alternativa" : `${alternatives} alternativas`,
} as const;

/* ---------------------------------- Clases ----------------------------------- */

export const FICHA_HEADER = "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4";

export const FICHA_HEADING = "flex min-w-0 flex-1 flex-col gap-1.5";

export const FICHA_EYEBROW = NEXIA_PORTAL_PAGE_EYEBROW;

export const FICHA_TITLE = PLATFORM_PAGE_TITLE_H1;

export const FICHA_LEAD = "mt-1 text-sm text-muted-foreground";

export const FICHA_META = "mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground";

export const FICHA_META_STRONG = "font-medium text-foreground";

export const FICHA_META_DIVIDER = "h-4 w-px bg-border";

export const FICHA_META_LINK = "-ml-2 min-h-touch sm:min-h-0";

/**
 * Filas (DISENO_H10 v2, Nelson 2026-11-11): Datos a todo el ancho; Músculos | Cómo cuenta y
 * Relaciones; Material y etiquetas | Movimiento; Técnica. Las celdas de una fila se estiran
 * a la misma altura (grid stretch) y la última tarjeta de una pila rellena lo que falta.
 * El orden del HTML es el de móvil.
 */
export const FICHA_ROWS = "flex flex-col gap-4 lg:gap-5";

export const FICHA_ROW_TWO = "grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5";

export const FICHA_STACK = "flex flex-col gap-4 lg:gap-5";

export const FICHA_CARD_FILL = "flex-1";

export const FICHA_GROUP = "space-y-2.5";

export const FICHA_GROUP_HEAD = "flex items-baseline justify-between gap-3";

export const FICHA_GROUP_LABEL = PLATFORM_SECTION_LABEL;

export const FICHA_GROUP_HINT = "text-xs text-muted-foreground";

export const FICHA_CHIPS = "flex flex-wrap items-center gap-2";

export const FICHA_EMPTY = "text-sm text-muted-foreground";

export const FICHA_ERRORS = "space-y-1 text-sm text-destructive";

/** Datos a todo el ancho: nombre e inglés en dos columnas; los cinco selects en una fila (lg). */
export const FICHA_NAME_GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-x-4";

export const FICHA_FIELD_GRID = "grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-5 lg:gap-x-4";

/** Objetivo de entrenamiento: fila propia en móvil, una celda más en lg. */
export const FICHA_FIELD_LEAD = "col-span-2 lg:col-span-1";

/** Fila completa dentro de la rejilla de selects (propuestas por confirmar). */
export const FICHA_FIELD_ROW = "col-span-2 lg:col-span-5";

export const FICHA_FIELD_NOTE = "text-xs leading-relaxed text-muted-foreground";

export const FICHA_ADD = "min-h-touch sm:min-h-0";

export const FICHA_PM_LIST = "space-y-2";

export const FICHA_PM_ROW = cn(
    "flex items-center gap-1 rounded-lg border border-border/60 bg-surface-2/40 py-1 pl-3 pr-1"
);

export const FICHA_PM_INDEX = "w-5 shrink-0 text-sm font-semibold tabular-nums text-primary";

export const FICHA_PM_NAME = "min-w-0 flex-1 truncate text-sm font-medium text-foreground";

const ICON_BUTTON = cn(
    "inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground",
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    "disabled:pointer-events-none disabled:opacity-30 sm:size-8 [&_svg]:size-4"
);

export const FICHA_ICON_BUTTON = cn(ICON_BUTTON, "hover:bg-accent hover:text-foreground");

export const FICHA_ICON_BUTTON_DANGER = cn(ICON_BUTTON, "hover:bg-destructive/15 hover:text-destructive");

export const FICHA_ROLE_TAG = "shrink-0 text-[11px] font-medium opacity-80";

export const FICHA_ROLE_BUTTON = cn(
    "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground",
    "transition-colors hover:bg-primary/10 hover:text-primary",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const FICHA_DIVIDER = NEXIA_DIVIDER_SUBTLE;

export const FICHA_COUNT_LIST = "space-y-3";

export const FICHA_COUNT_ROW = "grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_1.5rem] items-center gap-3";

export const FICHA_COUNT_LABEL = "min-w-0";

export const FICHA_COUNT_NAME = "block truncate text-sm font-medium text-foreground";

export const FICHA_COUNT_ROLE = "block text-xs text-muted-foreground";

export const FICHA_COUNT_VALUE = "text-right text-sm font-semibold tabular-nums text-foreground";

export const FICHA_FACTS = "grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-sm";

export const FICHA_FACT_TERM = "text-muted-foreground";

export const FICHA_FACT_VALUE = "font-medium text-foreground";

export const FICHA_FACT_VALUE_MUTED = "font-normal text-muted-foreground";

export const FICHA_FACT_OK = "flex items-center gap-1.5 font-medium text-success [&_svg]:size-4";

export const FICHA_FACT_WARN = "flex items-center gap-1.5 font-medium text-warning [&_svg]:size-4";

export const FICHA_NOTE = "text-xs leading-relaxed text-muted-foreground";

export const FICHA_RELATION_ROW = cn(
    "flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface-2/40",
    "py-1 pl-3 pr-1 text-sm"
);

export const FICHA_RELATION_LINK = "min-w-0 truncate font-medium text-primary underline-offset-4 hover:underline";

export const FICHA_SUMMARY_LINKS = "mt-1.5 flex flex-wrap gap-x-4 gap-y-1";

export const FICHA_SUMMARY_LINK = cn(
    "text-sm font-medium text-primary underline-offset-4 hover:underline",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const FICHA_FOOTER_PRIMARY = "sm:min-w-[11rem]";

export const FICHA_SERVER_ERRORS = "list-disc space-y-1 pl-4";

