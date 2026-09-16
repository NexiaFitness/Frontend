/**
 * clientInvitePresentation.ts — Invitar atleta (mobile-first + desktop §6.7 atleta).
 * @see docs/audits/portal-atleta/DESIGN_MOBILE_FIRST_ATLETA.md §2, §6.7
 */

import { cn } from "@/lib/utils";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";
import {
    ATHLETE_BACK_LINK,
    ATHLETE_SECTION_LABEL,
    ATHLETE_SETTINGS_CARD,
    ATHLETE_TRAINER_QUOTE_BLOCK,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    PLATFORM_FORM_FOOTER_ACTIONS,
    PLATFORM_FORM_FOOTER_BTN,
} from "@/components/ui/forms/platformFormPresentation";
import { NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS } from "@/components/ui/modals/nexiaPremiumModalPresentation";
import { NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";

/** Shell página — estrecho móvil, ancho centrado desktop. */
export const CLIENT_INVITE_PAGE = cn(
    ATHLETE_PAGE_X,
    "relative mx-auto w-full max-w-lg pb-12 pt-2",
    "lg:max-w-4xl lg:pb-16 lg:pt-4",
);

/** Glow sutil desktop (paridad AuthLayout / portal atleta). */
export const CLIENT_INVITE_PAGE_GLOW =
    "pointer-events-none absolute inset-0 -z-10 hidden opacity-40 lg:block";

/** Form + tips: columna móvil, fila desktop — misma altura en lg+. */
export const CLIENT_INVITE_BODY =
    "flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-6";

export const CLIENT_INVITE_MAIN =
    "flex min-w-0 w-full flex-1 flex-col lg:max-w-2xl";

export const CLIENT_INVITE_ASIDE = "flex w-full flex-col lg:w-80 lg:shrink-0";

/** Card principal del formulario. */
export const CLIENT_INVITE_GLASS_CARD = cn(
    ATHLETE_SETTINGS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex min-h-0 flex-1 flex-col p-5 sm:p-6 lg:h-full lg:p-6",
);

/** Card secundaria (consejos). */
export const CLIENT_INVITE_TIPS_CARD = cn(
    ATHLETE_SETTINGS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex min-h-0 flex-1 flex-col p-5 sm:p-6 lg:h-full lg:p-6",
);

export const CLIENT_INVITE_CARD_INNER = "relative flex flex-1 flex-col gap-4";

/** Copy aside — breve, sin duplicar el subtítulo de página. */
export const CLIENT_INVITE_TIPS_LEAD =
    "Enlace por email (7 días). En la lista verás «Pendiente de aceptar» hasta que complete el registro.";

export const CLIENT_INVITE_TIPS_NOTE =
    "Si no llega el correo, revisa spam o reenvía desde la ficha del cliente.";

/** Grid campos — 1 col móvil, 2 cols desktop. */
export const CLIENT_INVITE_FIELDS_GRID =
    "grid grid-cols-1 gap-5 lg:grid-cols-2";

export const CLIENT_INVITE_FIELD_FULL = "lg:col-span-2";

/** Acciones formulario (card estrecha — botones centrados en desktop). */
export const CLIENT_INVITE_ACTIONS = cn(
    PLATFORM_FORM_FOOTER_ACTIONS,
    "border-t border-border/50 pt-5 sm:justify-center",
);

/** Cancelar / secundarios — mismo ancho que primary en desktop. */
export const CLIENT_INVITE_FOOTER_BTN = PLATFORM_FORM_FOOTER_BTN;

/** @deprecated usar CLIENT_INVITE_FOOTER_BTN */
export const CLIENT_INVITE_SUBMIT_DESKTOP = "";

export const CLIENT_INVITE_SUBMIT = cn(
    PLATFORM_FORM_FOOTER_BTN,
    NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS,
);

/** Éxito tras enviar. */
export const CLIENT_INVITE_SUCCESS_CARD = cn(
    CLIENT_INVITE_GLASS_CARD,
    "border-success/25 bg-success/5",
);

export const CLIENT_INVITE_BACK_LINK = ATHLETE_BACK_LINK;

export const CLIENT_INVITE_SECTION_LABEL = ATHLETE_SECTION_LABEL;

export const CLIENT_INVITE_TIP_BLOCK = ATHLETE_TRAINER_QUOTE_BLOCK;
