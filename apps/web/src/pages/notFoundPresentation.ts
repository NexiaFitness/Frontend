/**
 * notFoundPresentation.ts — Copy y tokens de la pantalla 404 (NotFound).
 *
 * Contexto: DESIGN_PREMIUM.md §2 (glass), §4.4 (jerarquía: primary + ghost-primary).
 * Mismo lenguaje visual que errorBoundaryPresentation (techo atleta).
 *
 * Notas de mantenimiento: 404 es ruta catch-all, no ErrorBoundary de React.
 *
 * @author Frontend Team
 * @since v9.2.0
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export const NOT_FOUND_COPY = {
    code: "404",
    title: "No encontramos esta página",
    body: "La dirección no existe o ya no está disponible. Vuelve al inicio o a la pantalla anterior.",
    primaryHome: "Ir al inicio",
    secondaryBack: "Volver",
} as const;

export const NOT_FOUND_PAGE_CLASS =
    "flex min-h-screen items-center justify-center bg-background px-4 py-10";

export const NOT_FOUND_CARD_CLASS = cn(
    NEXIA_GLASS_CARD,
    "relative mx-auto flex w-full max-w-md flex-col items-center gap-5 px-6 py-8 text-center",
);

export const NOT_FOUND_CODE_CLASS =
    "text-sm font-semibold tracking-[0.2em] text-primary/80";

export const NOT_FOUND_TITLE_CLASS = "text-lg font-semibold text-foreground";

export const NOT_FOUND_BODY_CLASS =
    "max-w-sm text-sm leading-relaxed text-muted-foreground";

export const NOT_FOUND_ACTIONS_CLASS =
    "flex w-full max-w-xs flex-col items-stretch gap-3";
