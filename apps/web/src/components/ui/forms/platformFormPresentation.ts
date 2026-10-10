/**
 * platformFormPresentation.ts — Tokens canónicos formularios premium (dashboard / modales).
 *
 * Paridad visual con NexiaPremiumModal. Usar con `variant="premium"` en Input, Textarea,
 * FormCombobox y DatePickerButton — no duplicar clases en páginas.
 *
 * Doc: DESIGN_PREMIUM.md §5.3 · design/platform/04_REGISTRY_CODIGO_FUENTE.md
 */

import { cn } from "@/lib/utils";
import { NEXIA_DIVIDER_GLOW } from "@/components/ui/surface/nexiaDividerPresentation";
import { NEXIA_PORTAL_PAGE_EYEBROW } from "@/components/athlete/account/athleteSettingsPresentation";
import {
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
} from "@/components/ui/surface/glassSurfacePresentation";
import { PLATFORM_ALT_DIVIDER } from "@/components/ui/surface/platformPremiumPresentation";

export type PlatformFormControlVariant = "default" | "premium";

/** Contenedor página / card principal del formulario. */
export const PLATFORM_FORM_SHELL = cn(
    "relative overflow-hidden rounded-xl border border-primary/30 bg-black",
    "shadow-[0_28px_90px_-18px] shadow-black/90 shadow-primary/15",
    "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[2] before:h-px",
    "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
);

export const PLATFORM_FORM_BODY = cn(
    "relative z-[1] space-y-6 px-5 py-5 sm:px-6 sm:py-6",
);

export const PLATFORM_FORM_DIVIDER = cn("py-0.5", NEXIA_DIVIDER_GLOW);

export const PLATFORM_FORM_SECTION = "space-y-4";

export const PLATFORM_FORM_SECTION_TITLE = cn(
    NEXIA_PORTAL_PAGE_EYEBROW,
    "text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/85",
);

export const PLATFORM_FORM_FIELD_STACK = "space-y-1.5";

export const PLATFORM_FORM_FIELD_LABEL = cn(
    NEXIA_PORTAL_PAGE_EYEBROW,
    "mb-1.5 block text-[11px] font-medium normal-case tracking-wide text-muted-foreground",
);

export const PLATFORM_FORM_CONTROL = cn(
    "border-primary/20 bg-surface-2/40 backdrop-blur-sm",
    "placeholder:text-muted-foreground/50",
    "focus:border-primary/45 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]",
);

export const PLATFORM_FORM_CONTROL_READONLY = cn(
    PLATFORM_FORM_CONTROL,
    "cursor-default text-muted-foreground",
);

export const PLATFORM_FORM_OPTIONAL_BLOCK = cn(PLATFORM_ALT_DIVIDER, "space-y-4");

/** Pie de formulario (card / modal): stack móvil, fila desktop; **mismo ancho** en sm+ (paridad `BUTTON_PRESETS.modalEqual`). */
export const PLATFORM_FORM_FOOTER_ACTIONS = cn(
    "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3",
);

/** Modales y footers con pares de botones **igual ancho** (`sm:w-[10rem]`). No usar en `DashboardFixedFooter`. */
export const PLATFORM_FORM_FOOTER_BTN = cn(
    "w-full min-h-touch sm:min-h-0 sm:w-[10rem]",
);

/**
 * Botones en `DashboardFixedFooter` (entrenador/admin): full-width táctil en móvil;
 * desde `sm` ancho auto + `Button size="sm"` (h-9) — misma altura que el bloque usuario del sidebar.
 * @see design/platform/05_ACTION_HIERARCHY.md §2.3
 */
export const PLATFORM_DASHBOARD_FOOTER_BTN = cn(
    "w-full min-h-touch sm:min-h-0 sm:w-auto",
);

/** Aplica `PLATFORM_DASHBOARD_FOOTER_BTN` a todos los `<button>` hijos (filas partidas / clusters). */
export const PLATFORM_DASHBOARD_FOOTER_BTN_CHILD =
    "[&_button]:w-full [&_button]:min-h-touch sm:[&_button]:min-h-0 sm:[&_button]:w-auto";

/**
 * Footer simple (§2.3.1 A): acciones alineadas a la derecha; móvil stack táctil, sm+ fila `size="sm"`.
 */
export const PLATFORM_DASHBOARD_FOOTER_ROW = cn(
    "pointer-events-auto flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3",
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD,
);

/** Sub-panel (p. ej. crear ítem custom dentro del formulario). */
export const PLATFORM_FORM_NESTED_PANEL = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-4 border border-dashed border-primary/25 bg-black/40 p-4 sm:p-5",
);

/** Onboarding cliente / completar perfil entrenador — cards de sección (paridad modal premium). */
export const PLATFORM_ONBOARDING_SECTION = cn(
    PLATFORM_FORM_SHELL,
    "border-primary/25 shadow-primary/10",
);

export const PLATFORM_ONBOARDING_SECTION_BODY = cn(
    "relative z-[1] space-y-4 p-5 sm:p-6",
);

export const PLATFORM_ONBOARDING_SECTION_HEADER = cn(
    "mb-5 flex items-start gap-3 border-b border-primary/15 pb-4",
);

export const PLATFORM_ONBOARDING_SECTION_ICON = cn(
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
    "border border-primary/30 bg-primary/10 text-primary",
    "shadow-[0_0_20px_-8px] shadow-primary/45",
);

export const PLATFORM_ONBOARDING_SECTION_TITLE = cn(
    "text-base font-semibold tracking-tight text-foreground sm:text-lg",
);

export const PLATFORM_ONBOARDING_SECTION_FOOTER = cn(
    "mt-6 flex justify-end border-t border-primary/15 pt-4",
);

export const PLATFORM_ONBOARDING_SIDEBAR_CARD = cn(
    PLATFORM_ONBOARDING_SECTION,
    "p-4 sm:p-5",
);

export const PLATFORM_ONBOARDING_PAGE_EYEBROW = cn(
    NEXIA_PORTAL_PAGE_EYEBROW,
    "text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/90",
);

export const PLATFORM_ONBOARDING_PAGE_TITLE = cn(
    "text-xl font-bold tracking-tight text-foreground sm:text-2xl",
);

export const PLATFORM_ONBOARDING_PAGE_SUBTITLE = "mt-1 text-sm text-muted-foreground";

export const PLATFORM_ONBOARDING_PROGRESS_DIVIDER = cn(
    "h-px flex-1 bg-gradient-to-r from-transparent via-primary/35 to-transparent",
);

export const PLATFORM_ONBOARDING_DANGER_ZONE = cn(
    "relative overflow-hidden rounded-xl border border-destructive/35 bg-destructive/5 p-6",
    "shadow-[0_12px_40px_-16px] shadow-destructive/20",
    "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px",
    "before:bg-gradient-to-r before:from-transparent before:via-destructive/30 before:to-transparent",
);

export const PLATFORM_ONBOARDING_LIST_ITEM = cn(
    "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/15",
    "bg-black/35 px-3 py-2 backdrop-blur-sm",
);

export function platformFormLabelClass(
    variant: PlatformFormControlVariant,
): string {
    return variant === "premium"
        ? PLATFORM_FORM_FIELD_LABEL
        : "block text-sm font-medium text-foreground mb-1";
}

export function platformFormControlClass(
    variant: PlatformFormControlVariant,
): string {
    return variant === "premium" ? PLATFORM_FORM_CONTROL : "";
}

export function platformFormReadonlyControlClass(
    variant: PlatformFormControlVariant,
): string {
    return variant === "premium" ? PLATFORM_FORM_CONTROL_READONLY : "";
}
