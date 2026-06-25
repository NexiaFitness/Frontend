/**
 * clientInvitePresentation.ts — Invitar atleta (mobile-first + desktop §6.7 atleta).
 * @see docs/audits/portal-atleta/DESIGN_MOBILE_FIRST_ATLETA.md §2, §6.7
 */

import { cn } from "@/lib/utils";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";
import {
    ATHLETE_BACK_LINK,
    ATHLETE_PRIMARY_CTA,
    ATHLETE_SECTION_LABEL,
    ATHLETE_SETTINGS_CARD,
    ATHLETE_TRAINER_QUOTE_BLOCK,
} from "@/components/athlete/account/athleteSettingsPresentation";
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

/** Form + tips: columna móvil, fila desktop (DESIGN §2). */
export const CLIENT_INVITE_BODY = "flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8";

export const CLIENT_INVITE_MAIN = "min-w-0 w-full flex-1 lg:max-w-2xl";

export const CLIENT_INVITE_ASIDE = "w-full lg:w-80 lg:shrink-0";

/** Card principal del formulario. */
export const CLIENT_INVITE_GLASS_CARD = cn(
    ATHLETE_SETTINGS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-5 p-5 sm:p-6 lg:p-8",
);

/** Card secundaria (consejos). */
export const CLIENT_INVITE_TIPS_CARD = cn(
    ATHLETE_SETTINGS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-3 p-4 sm:p-5 lg:sticky lg:top-6 lg:p-6",
);

/** Grid campos — 1 col móvil, 2 cols desktop. */
export const CLIENT_INVITE_FIELDS_GRID =
    "grid grid-cols-1 gap-5 lg:grid-cols-2";

export const CLIENT_INVITE_FIELD_FULL = "lg:col-span-2";

/** Acciones formulario. */
export const CLIENT_INVITE_ACTIONS =
    "flex flex-col gap-3 border-t border-border/50 pt-5 lg:flex-row lg:items-center";

export const CLIENT_INVITE_SUBMIT_DESKTOP = "lg:w-auto lg:min-w-[12rem]";

/** Éxito tras enviar. */
export const CLIENT_INVITE_SUCCESS_CARD = cn(
    CLIENT_INVITE_GLASS_CARD,
    "border-success/25 bg-success/5",
);

export const CLIENT_INVITE_BACK_LINK = ATHLETE_BACK_LINK;

export const CLIENT_INVITE_SUBMIT = ATHLETE_PRIMARY_CTA;

export const CLIENT_INVITE_SECTION_LABEL = ATHLETE_SECTION_LABEL;

export const CLIENT_INVITE_TIP_BLOCK = ATHLETE_TRAINER_QUOTE_BLOCK;

/** Solo `pnpm dev`: enlace mágico en UI para QA/E2E. Nunca en build Vercel. */
export const SHOW_INVITATION_DEV_LINK = import.meta.env.DEV;
