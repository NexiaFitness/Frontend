/**
 * errorBoundaryPresentation.ts — Copy del fallback ErrorBoundary.
 *
 * Contexto: Mensajes tranquilizadores; UI vía ScreenStateCard
 * (screenStatePresentation). DESIGN_PREMIUM.md §2, §5.2.
 *
 * Notas: el aviso PWA «Hay una versión nueva de NEXIA» (stale_chunk) no se
 * migra ni se modifica — patrón conservado a petición de Nelson.
 *
 * @author Frontend Team
 * @since 2026-10-02
 * @updated v9.2.2 — copy + ScreenStateCard
 */

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
