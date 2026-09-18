/**
 * exerciseFormPresentation — Copy + tokens premium (DESIGN_PREMIUM §5.3).
 */

import { cn } from "@/lib/utils";
import { DASHBOARD_FIXED_FOOTER_PADDING_CLASS } from "@/lib/dashboardScroll";
import {
    PLATFORM_BACK_BUTTON,
    PLATFORM_BODY_MUTED,
    PLATFORM_ICON_BACK_GAP,
    PLATFORM_ICON_SM,
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
    PLATFORM_SPEC_GRID,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    PLATFORM_DASHBOARD_FOOTER_BTN,
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD,
    PLATFORM_FORM_BODY,
    PLATFORM_FORM_FOOTER_ACTIONS,
    PLATFORM_FORM_SECTION,
    PLATFORM_FORM_SECTION_TITLE,
    PLATFORM_FORM_SHELL,
} from "@/components/ui/forms/platformFormPresentation";
import { NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS } from "@/components/ui/modals/nexiaPremiumModalPresentation";

export const EXERCISE_FORM_PAGE = cn(
    "relative mx-auto w-full max-w-3xl lg:max-w-4xl",
    DASHBOARD_FIXED_FOOTER_PADDING_CLASS,
);

export const EXERCISE_FORM_GLOW =
    "pointer-events-none absolute inset-x-0 -top-4 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_70%)]";

export const EXERCISE_FORM_HEADER = PLATFORM_PAGE_HEADER;
export const EXERCISE_FORM_TITLE_WRAP = PLATFORM_PAGE_TITLE_WRAP;
export const EXERCISE_FORM_BACK_BUTTON = PLATFORM_BACK_BUTTON;
export const EXERCISE_FORM_ICON_SM = PLATFORM_ICON_SM;
export const EXERCISE_FORM_ICON_BACK_GAP = PLATFORM_ICON_BACK_GAP;

export const EXERCISE_FORM_CARD = PLATFORM_FORM_SHELL;
export const EXERCISE_FORM_BODY = PLATFORM_FORM_BODY;
export const EXERCISE_FORM_SECTION = PLATFORM_FORM_SECTION;
export const EXERCISE_FORM_SECTION_TITLE = PLATFORM_FORM_SECTION_TITLE;
export const EXERCISE_FORM_GRID_2 = cn(PLATFORM_SPEC_GRID, "gap-4 md:grid-cols-2");
export const EXERCISE_FORM_GRID_3 = cn(PLATFORM_SPEC_GRID, "gap-4 md:grid-cols-3");

export const EXERCISE_FORM_FOOTER_ACTIONS = cn(
    "pointer-events-auto mx-auto w-full max-w-3xl lg:max-w-4xl",
    PLATFORM_FORM_FOOTER_ACTIONS,
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD,
);

export const EXERCISE_FORM_FOOTER_BTN = PLATFORM_DASHBOARD_FOOTER_BTN;
export const EXERCISE_FORM_SUBMIT_CTA = NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS;

export const EXERCISE_FORM_BACK_LABEL = "Volver";
export const EXERCISE_FORM_PAGE_TITLE_CREATE = "Crear ejercicio";
export const EXERCISE_FORM_PAGE_TITLE_EDIT = "Editar ejercicio";
export const EXERCISE_FORM_PAGE_SUBTITLE_CREATE =
    "Añade un nuevo ejercicio a la base de datos.";
export const EXERCISE_FORM_PAGE_SUBTITLE_EDIT = "Modifica los datos del ejercicio.";

export const EXERCISE_FORM_SECTION_IDENTITY = "Identificación";
export const EXERCISE_FORM_SECTION_CLASSIFICATION = "Clasificación";
export const EXERCISE_FORM_SECTION_MUSCLES = "Músculos";
export const EXERCISE_FORM_SECTION_CONTENT = "Contenido";

export const EXERCISE_FORM_ID_LABEL = "ID de ejercicio";
export const EXERCISE_FORM_NAME_LABEL = "Nombre";
export const EXERCISE_FORM_NAME_EN_LABEL = "Nombre (inglés)";
export const EXERCISE_FORM_TYPE_LABEL = "Tipo";
export const EXERCISE_FORM_LEVEL_LABEL = "Nivel";
export const EXERCISE_FORM_CATEGORY_LABEL = "Categoría";
export const EXERCISE_FORM_EQUIPMENT_LABEL = "Equipo";
export const EXERCISE_FORM_PATTERN_LABEL = "Patrón de movimiento";
export const EXERCISE_FORM_LOAD_TYPE_LABEL = "Tipo de carga";
export const EXERCISE_FORM_PRIMARY_MUSCLES_LABEL = "Músculos principales";
export const EXERCISE_FORM_SECONDARY_MUSCLES_LABEL = "Músculos secundarios";
export const EXERCISE_FORM_QUALITIES_LABEL = "Cualidades físicas";
export const EXERCISE_FORM_QUALITIES_HINT = cn(
    PLATFORM_BODY_MUTED,
    "text-xs",
);
export const EXERCISE_FORM_QUALITIES_HINT_TEXT =
    "Relaciona el ejercicio con las cualidades del catálogo (planificación y coherencia).";
export const EXERCISE_FORM_DESCRIPTION_LABEL = "Descripción";
export const EXERCISE_FORM_INSTRUCTIONS_LABEL = "Instrucciones";
export const EXERCISE_FORM_NOTES_LABEL = "Notas";

export const EXERCISE_FORM_SUBMIT_CREATE = "Crear ejercicio";
export const EXERCISE_FORM_SUBMIT_EDIT = "Guardar cambios";
export const EXERCISE_FORM_CANCEL = "Cancelar";

export const EXERCISE_FORM_TYPE_OPTIONS = [
    { value: "monoarticular", label: "Monoarticular" },
    { value: "multiarticular", label: "Multiarticular" },
    { value: "complex", label: "Complejo" },
] as const;

export const EXERCISE_FORM_LEVEL_OPTIONS = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
] as const;

export const EXERCISE_FORM_COMBO_PLACEHOLDER = "Seleccionar";
