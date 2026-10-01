/**
 * errorBoundaryPresentation.ts — Copy y estilos del fallback ErrorBoundary (B9 / premium).
 *
 * Contexto: Mensajes tranquilizadores, mobile-first; sin rojo de alarma en pantallas de error.
 *
 * Notas de mantenimiento: alinear con DESIGN_PREMIUM y portal atleta (375×812).
 *
 * @author Frontend Team
 * @since 2026-10-02
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export type ErrorBoundaryUiMode = "route" | "root" | "stale_chunk";

export const ERROR_BOUNDARY_COPY = {
    route: {
        title: "No hemos podido abrir esta pantalla",
        body: "Puede ser un fallo puntual. Prueba de nuevo; el resto de la app sigue disponible.",
        retry: "Reintentar",
        homeLink: "Ir al inicio",
    },
    routeAfterRetry: {
        title: "Sigue sin cargar",
        body: "Vuelve al inicio y entra otra vez en esta sección. Si persiste, avisa a tu entrenador.",
        retry: "Reintentar otra vez",
        homeLink: "Ir al inicio",
    },
    root: {
        title: "Algo no ha ido como esperábamos",
        body: "Prueba a recargar. Si sigues aquí, vuelve al inicio e inicia sesión de nuevo.",
        retry: "Reintentar",
        homeLink: "Ir al inicio",
    },
    stale_chunk: {
        title: "Hay una versión nueva de NEXIA",
        body: "Actualiza la app para continuar con la última versión.",
        primary: "Actualizar",
        homeLink: "Ir al inicio",
    },
} as const;

export function errorBoundaryShellClass(variant: "route" | "root"): string {
    return cn(
        NEXIA_GLASS_CARD,
        "mx-auto flex w-full max-w-md flex-col items-center gap-5 px-6 py-8 text-center",
        variant === "route" ? "min-h-[40vh] justify-center" : "min-h-[50vh] justify-center"
    );
}

export const errorBoundaryTitleClass = "text-lg font-semibold text-foreground";
export const errorBoundaryBodyClass = "max-w-sm text-sm leading-relaxed text-muted-foreground";
export const errorBoundaryHomeLinkClass =
    "text-sm font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm";
