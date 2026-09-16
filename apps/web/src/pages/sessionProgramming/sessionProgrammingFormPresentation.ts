/**
 * sessionProgrammingFormPresentation — Wizards sesión/plantilla (DESIGN_PREMIUM §5.3).
 */

import { cn } from "@/lib/utils";
import { DASHBOARD_FIXED_FOOTER_PADDING_CLASS } from "@/lib/dashboardScroll";
import {
    PLATFORM_BACK_BUTTON,
    PLATFORM_ICON_BACK_GAP,
    PLATFORM_ICON_SM,
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
    PLATFORM_SPEC_GRID,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    PLATFORM_FORM_BODY,
    PLATFORM_FORM_FOOTER_ACTIONS,
    PLATFORM_FORM_FOOTER_BTN,
    PLATFORM_FORM_SECTION,
    PLATFORM_FORM_SECTION_TITLE,
    PLATFORM_FORM_SHELL,
} from "@/components/ui/forms/platformFormPresentation";
import { NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS } from "@/components/ui/modals/nexiaPremiumModalPresentation";

export const SESSION_PROG_FORM_PAGE = cn(
    "relative mx-auto w-full max-w-2xl lg:max-w-3xl",
    DASHBOARD_FIXED_FOOTER_PADDING_CLASS,
);

export const SESSION_PROG_FORM_GLOW =
    "pointer-events-none absolute inset-x-0 -top-4 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_70%)]";

export const SESSION_PROG_FORM_HEADER = PLATFORM_PAGE_HEADER;
export const SESSION_PROG_FORM_TITLE_WRAP = PLATFORM_PAGE_TITLE_WRAP;
export const SESSION_PROG_FORM_BACK_BUTTON = PLATFORM_BACK_BUTTON;
export const SESSION_PROG_FORM_ICON_SM = PLATFORM_ICON_SM;
export const SESSION_PROG_FORM_ICON_BACK_GAP = PLATFORM_ICON_BACK_GAP;

export const SESSION_PROG_FORM_CARD = PLATFORM_FORM_SHELL;
export const SESSION_PROG_FORM_BODY = PLATFORM_FORM_BODY;
export const SESSION_PROG_FORM_SECTION = PLATFORM_FORM_SECTION;
export const SESSION_PROG_FORM_SECTION_TITLE = PLATFORM_FORM_SECTION_TITLE;
export const SESSION_PROG_FORM_GRID_2 = cn(PLATFORM_SPEC_GRID, "gap-4 md:grid-cols-2");

export const SESSION_PROG_FORM_FOOTER_ACTIONS = cn(
    "mx-auto w-full max-w-2xl lg:max-w-3xl",
    PLATFORM_FORM_FOOTER_ACTIONS,
);

export const SESSION_PROG_FORM_FOOTER_BTN = PLATFORM_FORM_FOOTER_BTN;
export const SESSION_PROG_FORM_SUBMIT_CTA = NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS;

export const SESSION_PROG_FORM_BACK_LABEL = "Volver";
export const SESSION_PROG_FORM_CANCEL = "Cancelar";

export const SESSION_PROG_FORM_INFO_PANEL = cn(
    "rounded-lg border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground",
);

export const CREATE_TEMPLATE_PAGE_TITLE = "Nuevo template";
export const CREATE_TEMPLATE_PAGE_SUBTITLE =
    "Crear un nuevo template de sesión de entrenamiento";
export const CREATE_TEMPLATE_SECTION = "Detalles del template";
export const CREATE_TEMPLATE_SUBMIT = "Crear template";
export const CREATE_TEMPLATE_INFO =
    "Después de crear el template, podrás agregar bloques y ejercicios desde la vista de edición.";

export const CREATE_SESSION_FROM_TEMPLATE_PAGE_TITLE = "Sesión desde plantilla";
export const CREATE_SESSION_FROM_TEMPLATE_PAGE_SUBTITLE =
    "Programa una sesión a partir de una plantilla existente.";
export const CREATE_SESSION_FROM_TEMPLATE_SECTION = "Programación";
export const CREATE_SESSION_FROM_TEMPLATE_SUBMIT = "Crear sesión";
