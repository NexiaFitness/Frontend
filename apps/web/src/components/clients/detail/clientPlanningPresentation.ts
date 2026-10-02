/**
 * clientPlanningPresentation.ts — Tokens del tab Planificación (cliente).
 *
 * Footer partido §2.3 B — misma receta que sessionProgrammingPresentation
 * (CreateSession / EditSession). DESIGN_PREMIUM · 05_ACTION_HIERARCHY.
 *
 * @author Frontend Team
 * @since v9.2.4
 */

import { cn } from "@/lib/utils";
import {
    PLATFORM_DASHBOARD_FOOTER_BTN,
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD,
} from "@/components/ui/forms/platformFormPresentation";

/** Fila footer partido: secundaria izq · cluster dcha (md+ una fila). */
export const CLIENT_PLANNING_FOOTER_ROW = cn(
    "pointer-events-auto flex w-full min-w-0 max-w-full flex-col gap-3",
    "md:flex-row md:flex-nowrap md:items-center md:justify-between",
);

/** Cluster derecha: destructivo · auxiliar · primary. */
export const CLIENT_PLANNING_FOOTER_ACTIONS = cn(
    "flex w-full min-w-0 flex-col-reverse gap-2",
    "sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3",
    "md:w-auto md:shrink-0",
    PLATFORM_DASHBOARD_FOOTER_BTN_CHILD,
);

export const CLIENT_PLANNING_FOOTER_SECONDARY = PLATFORM_DASHBOARD_FOOTER_BTN;
export const CLIENT_PLANNING_FOOTER_PRIMARY = PLATFORM_DASHBOARD_FOOTER_BTN;
export const CLIENT_PLANNING_FOOTER_BTN = PLATFORM_DASHBOARD_FOOTER_BTN;
