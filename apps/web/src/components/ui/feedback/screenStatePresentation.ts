/**
 * screenStatePresentation.ts — Tokens de tarjeta de estado de pantalla.
 *
 * Contexto: DESIGN_PREMIUM.md §2 (glass), §5.2 (pantalla vs Alert). Compartida por
 * NotFound, ResourceQueryState y cuerpo del ErrorBoundary.
 *
 * Criterio: si quitando el mensaje no queda contenido útil → esta tarjeta;
 * si queda contenido → Alert inline.
 *
 * @author Frontend Team
 * @since v9.2.2
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export const SCREEN_STATE_PAGE_CLASS =
    "flex min-h-screen items-center justify-center bg-background px-4 py-10";

export const SCREEN_STATE_INLINE_CLASS =
    "flex w-full items-center justify-center px-4 py-8";

export function screenStateCardClass(options?: {
    minHeight?: "route" | "root" | "none";
}): string {
    const min =
        options?.minHeight === "root"
            ? "min-h-[50vh] justify-center"
            : options?.minHeight === "route"
              ? "min-h-[40vh] justify-center"
              : "";
    return cn(
        NEXIA_GLASS_CARD,
        "relative mx-auto flex w-full max-w-md flex-col items-center gap-5 px-6 py-8 text-center",
        min,
    );
}

export const SCREEN_STATE_CODE_CLASS =
    "text-sm font-semibold tracking-[0.2em] text-primary/80";

export const SCREEN_STATE_TITLE_CLASS = "text-lg font-semibold text-foreground";

export const SCREEN_STATE_BODY_CLASS =
    "max-w-sm text-sm leading-relaxed text-muted-foreground";

export const SCREEN_STATE_ACTIONS_CLASS =
    "flex w-full max-w-xs flex-col items-stretch gap-3";
