/**
 * trainingPlanHeaderPresentation.ts — Cabecera detalle de plan (paridad ClientHeader).
 *
 * Mobile-first: techo NEXIA_PORTAL; breadcrumbs → título ≥16px.
 * Doc: DESIGN_PREMIUM.md · 05_ACTION_HIERARCHY §2.1
 */

import { cn } from "@/lib/utils";
import {
    NEXIA_PORTAL_GREETING_H1,
    NEXIA_PORTAL_GREETING_SUBTITLE,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    PLATFORM_PAGE_BREADCRUMB,
    PLATFORM_PAGE_HEADING_STACK,
} from "@/components/ui/surface/platformPremiumPresentation";

export const TRAINING_PLAN_HEADER_SHELL = "flex flex-col gap-4 pt-1 sm:gap-5 sm:pt-0";

export const TRAINING_PLAN_HEADER_HEADING_BLOCK = PLATFORM_PAGE_HEADING_STACK;

/** Breadcrumbs → título (≥16px). */
export const TRAINING_PLAN_HEADER_BREADCRUMB = PLATFORM_PAGE_BREADCRUMB;

export const TRAINING_PLAN_HEADER_TITLE = cn(
    NEXIA_PORTAL_GREETING_H1,
    "min-w-0 whitespace-normal break-words",
);

export const TRAINING_PLAN_HEADER_META = cn(
    NEXIA_PORTAL_GREETING_SUBTITLE,
    "text-xs leading-relaxed sm:text-sm",
);
