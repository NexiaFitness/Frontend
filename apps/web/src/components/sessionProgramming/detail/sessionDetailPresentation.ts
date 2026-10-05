/**
 * sessionDetailPresentation.ts — Tokens cabecera detalle de sesión (plan + suelta).
 *
 * Contexto: mobile-first 375px; compartido por SessionDetail y StandaloneSessionDetail.
 * Sin lógica de negocio — solo layout y tipografía de cabecera.
 *
 * @author Frontend Team
 * @since v9.2.4
 */

import { cn } from "@/lib/utils";
import { PLATFORM_PAGE_TITLE_H1 } from "@/components/ui/surface/platformPremiumPresentation";

/** Breadcrumb + bloque identidad + volver (stack en estrecho). */
export const SESSION_DETAIL_MOBILE_BLOCK = "flex flex-col gap-3";

export const SESSION_DETAIL_BREADCRUMB =
    "flex min-w-0 items-center gap-1 text-sm text-muted-foreground";

export const SESSION_DETAIL_BREADCRUMB_LINK = "hover:text-foreground";

export const SESSION_DETAIL_BREADCRUMB_CURRENT =
    "min-w-0 truncate font-medium text-foreground";

export const SESSION_DETAIL_HEADER = cn(
    "flex flex-col gap-3",
    "md:flex-row md:items-start md:justify-between md:gap-4",
);

export const SESSION_DETAIL_IDENTITY = cn("flex min-w-0 flex-1 items-start gap-4");

export const SESSION_DETAIL_AVATAR =
    "relative flex h-14 w-14 shrink-0 overflow-hidden rounded-full";

export const SESSION_DETAIL_AVATAR_INNER =
    "flex h-full w-full items-center justify-center rounded-full bg-success/20 text-lg font-bold text-success";

export const SESSION_DETAIL_BODY = "min-w-0 flex-1";

export const SESSION_DETAIL_TITLE_GROUP = cn(
    "flex flex-col gap-2",
    "sm:flex-row sm:flex-wrap sm:items-center sm:gap-3",
);

export const SESSION_DETAIL_TITLE = cn(PLATFORM_PAGE_TITLE_H1, "text-xl font-bold");

export const SESSION_DETAIL_BADGE_ROW = "flex flex-wrap items-center gap-2";

export const SESSION_DETAIL_CLIENT = "mt-1 text-sm text-muted-foreground";

export const SESSION_DETAIL_PLAN = "mt-1 text-xs text-muted-foreground";

export const SESSION_DETAIL_PLAN_EMPHASIS = "font-medium text-foreground";

export const SESSION_DETAIL_META = cn(
    "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground",
);

export const SESSION_DETAIL_META_ITEM = "flex items-center gap-1.5";

/** Volver + acciones secundarias: columna en móvil, fila desde md. */
export const SESSION_DETAIL_TOOLBAR = cn(
    "flex w-full flex-col gap-2",
    "md:w-auto md:shrink-0 md:flex-row md:flex-wrap md:items-center md:justify-end",
);
