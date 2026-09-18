/**
 * generateReportsPresentation — Copy + tokens premium (DESIGN_PREMIUM §5.3).
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
    PLATFORM_FORM_DIVIDER,
    PLATFORM_FORM_FOOTER_ACTIONS,
    PLATFORM_FORM_SECTION,
    PLATFORM_FORM_SECTION_TITLE,
    PLATFORM_FORM_SHELL,
} from "@/components/ui/forms/platformFormPresentation";
import { NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS } from "@/components/ui/modals/nexiaPremiumModalPresentation";
import { REPORT_FORMAT, REPORT_TYPE } from "@nexia/shared/types/reports";

export const GENERATE_REPORTS_PAGE = cn(
    "relative mx-auto w-full max-w-2xl lg:max-w-3xl",
    DASHBOARD_FIXED_FOOTER_PADDING_CLASS,
);

export const GENERATE_REPORTS_GLOW =
    "pointer-events-none absolute inset-x-0 -top-4 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_70%)]";

export const GENERATE_REPORTS_HEADER = PLATFORM_PAGE_HEADER;
export const GENERATE_REPORTS_TITLE_WRAP = PLATFORM_PAGE_TITLE_WRAP;
export const GENERATE_REPORTS_BACK_BUTTON = PLATFORM_BACK_BUTTON;
export const GENERATE_REPORTS_ICON_SM = PLATFORM_ICON_SM;
export const GENERATE_REPORTS_ICON_BACK_GAP = PLATFORM_ICON_BACK_GAP;

export const GENERATE_REPORTS_FORM_CARD = PLATFORM_FORM_SHELL;
export const GENERATE_REPORTS_FORM_BODY = PLATFORM_FORM_BODY;
export const GENERATE_REPORTS_FORM_DIVIDER = PLATFORM_FORM_DIVIDER;
export const GENERATE_REPORTS_SECTION = PLATFORM_FORM_SECTION;
export const GENERATE_REPORTS_SECTION_TITLE = PLATFORM_FORM_SECTION_TITLE;
export const GENERATE_REPORTS_DATE_GRID = cn(PLATFORM_SPEC_GRID, "gap-4");

export const GENERATE_REPORTS_FOOTER_ACTIONS = cn(
    "pointer-events-auto mx-auto w-full max-w-2xl lg:max-w-3xl",
    PLATFORM_FORM_FOOTER_ACTIONS,
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD,
);

export const GENERATE_REPORTS_FOOTER_BTN = PLATFORM_DASHBOARD_FOOTER_BTN;
export const GENERATE_REPORTS_SUBMIT_CTA = NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS;

export const GENERATE_REPORTS_PAGE_TITLE = "Generar reportes";
export const GENERATE_REPORTS_PAGE_SUBTITLE =
    "Exporta progreso o resumen de entrenamientos por cliente y rango de fechas.";

export const GENERATE_REPORTS_BACK_LABEL = "Volver";
export const GENERATE_REPORTS_SECTION_CONFIG = "Configuración";
export const GENERATE_REPORTS_SECTION_RESULT = "Resultado";

export const GENERATE_REPORTS_TYPE_LABEL = "Tipo de reporte";
export const GENERATE_REPORTS_CLIENT_LABEL = "Cliente";
export const GENERATE_REPORTS_CLIENT_PLACEHOLDER = "Seleccionar cliente";
export const GENERATE_REPORTS_FORMAT_LABEL = "Formato";
export const GENERATE_REPORTS_START_LABEL = "Fecha inicio";
export const GENERATE_REPORTS_END_LABEL = "Fecha fin";

export const GENERATE_REPORTS_SUBMIT = "Generar reporte";
export const GENERATE_REPORTS_CANCEL = "Cancelar";
export const GENERATE_REPORTS_UPCOMING_HINT = cn(PLATFORM_BODY_MUTED, "text-xs");

export const GENERATE_REPORTS_TYPE_OPTIONS = [
    { value: REPORT_TYPE.CLIENT_PROGRESS, label: "Progreso del cliente" },
    { value: REPORT_TYPE.TRAINING_SUMMARY, label: "Resumen de entrenamientos" },
];

export const GENERATE_REPORTS_FORMAT_OPTIONS = [{ value: REPORT_FORMAT.JSON, label: "JSON" }];

export const GENERATE_REPORTS_ERROR_CLIENT =
    "Selecciona un cliente para el reporte de progreso.";
