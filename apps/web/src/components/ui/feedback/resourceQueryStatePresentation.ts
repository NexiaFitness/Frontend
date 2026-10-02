/**
 * resourceQueryStatePresentation.ts — Copy de estados de recurso por tipo.
 *
 * Contexto: DESIGN_PREMIUM.md §5.2 (pantalla vs Alert). Textos ES por recurso.
 *
 * @author Frontend Team
 * @since v9.2.2
 */

import type {
    ResourceQueryKind,
    ResourceQueryResource,
} from "./resourceQueryStateContract";

type Copy = { title: string; body: string };

const COPY: Record<ResourceQueryResource, Record<ResourceQueryKind, Copy>> = {
    plan: {
        not_found: {
            title: "Plan no encontrado",
            body: "El plan no existe o ya no está disponible.",
        },
        forbidden: {
            title: "Sin permiso para este plan",
            body: "No tienes acceso a este plan de entrenamiento.",
        },
        load_failed: {
            title: "No se pudo cargar el plan",
            body: "Ha ocurrido un fallo al obtener el plan. Prueba de nuevo.",
        },
    },
    client: {
        not_found: {
            title: "Cliente no encontrado",
            body: "El cliente no existe o ya no está disponible.",
        },
        forbidden: {
            title: "Sin permiso para este cliente",
            body: "Este cliente no está asignado a tu cuenta o no tienes permisos.",
        },
        load_failed: {
            title: "No se pudo cargar el cliente",
            body: "Ha ocurrido un fallo al obtener los datos. Prueba de nuevo.",
        },
    },
    session: {
        not_found: {
            title: "Sesión no encontrada",
            body: "La sesión no existe o ya no está disponible.",
        },
        forbidden: {
            title: "Sin permiso para esta sesión",
            body: "No tienes acceso a esta sesión de entrenamiento.",
        },
        load_failed: {
            title: "No se pudo cargar la sesión",
            body: "Ha ocurrido un fallo al obtener la sesión. Prueba de nuevo.",
        },
    },
    block: {
        not_found: {
            title: "Bloque no encontrado",
            body: "El bloque no existe o ya no está disponible.",
        },
        forbidden: {
            title: "Sin permiso para este bloque",
            body: "No tienes acceso a este bloque de periodización.",
        },
        load_failed: {
            title: "No se pudo cargar el bloque",
            body: "Ha ocurrido un fallo al obtener el bloque. Prueba de nuevo.",
        },
    },
    generic: {
        not_found: {
            title: "Recurso no encontrado",
            body: "No existe o ya no está disponible.",
        },
        forbidden: {
            title: "Sin permiso",
            body: "No tienes acceso a este recurso.",
        },
        load_failed: {
            title: "No se pudo cargar",
            body: "Ha ocurrido un fallo. Prueba de nuevo.",
        },
    },
};

export function resourceQueryCopy(
    resource: ResourceQueryResource,
    kind: ResourceQueryKind,
): Copy {
    return COPY[resource][kind];
}

export const RESOURCE_QUERY_ACTION = {
    retry: "Reintentar",
    back: "Volver",
    home: "Ir al inicio",
} as const;
