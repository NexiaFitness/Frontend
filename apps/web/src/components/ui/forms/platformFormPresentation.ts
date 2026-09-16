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

export const PLATFORM_FORM_FOOTER_BTN = cn(
    "w-full min-h-touch sm:min-h-0 sm:w-[10rem]",
);

/** Sub-panel (p. ej. crear ítem custom dentro del formulario). */
export const PLATFORM_FORM_NESTED_PANEL = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-4 border border-dashed border-primary/25 bg-black/40 p-4 sm:p-5",
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
