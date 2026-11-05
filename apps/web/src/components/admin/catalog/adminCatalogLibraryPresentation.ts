/**
 * adminCatalogLibraryPresentation.ts — Textos y reglas de la biblioteca RepDB.
 *
 * SPEC_H5 §2.3 (2026-11-05): una fila de tanda no ofrece escritura.
 * El motivo de descarte coincide con el mínimo del servidor (10).
 */

import type { LibraryCandidateOut } from "@nexia/shared/types/adminCatalogLibrary";

export const LIBRARY_DISCARD_MIN = 10;

export const LIBRARY_COPY = {
    title: "Biblioteca RepDB",
    backToCatalog: "Volver a ejercicios",
    openFromCatalog: "Biblioteca",
    banner:
        "Los candidatos de las tandas 0 a 6 se muestran en solo lectura. Emparejar, descartar y adoptar es para un candidato que no esté en esas tandas.",
    counts: (batch: number, library: number, versioned: number) =>
        `${batch} de tanda en esta base · ${library} fuera de las tandas · ${versioned} referencias versionadas`,
    searchPlaceholder: "Buscar por nombre o referencia",
    filterAll: "Todos",
    filterBatch: "Tandas",
    filterLibrary: "Fuera de las tandas",
    emptyTitle: "No hay candidatos con este filtro",
    emptyBody: "Prueba con otro texto o con otro filtro.",
    loadError: "No se pudo cargar la biblioteca.",
    retry: "Reintentar",
    scopeBatch: "Tanda",
    scopeLibrary: "Biblioteca",
    status: {
        new: "Nuevo",
        matched: "Emparejado",
        adopted: "Adoptado",
        discarded: "Descartado",
    } as Record<string, string>,
    match: "Emparejar",
    discard: "Descartar",
    adopt: "Adoptar",
    discardTitle: "Descartar candidato",
    discardHint: "El motivo se guarda en la nota y no se puede deshacer desde aquí.",
    discardPlaceholder: "Por qué se descarta",
    discardConfirm: "Confirmar descarte",
    matchTitle: "Emparejar con un ejercicio",
    matchHint: "Escribe al menos dos letras y elige el ejercicio de NEXIA.",
    matchPlaceholder: "Nombre del ejercicio",
    matchConfirm: "Confirmar emparejamiento",
    cancel: "Cancelar",
    discardedToast: "Candidato descartado",
    matchedToast: "Candidato emparejado",
    adoptedToast: "Ejercicio creado desde la biblioteca",
    readonlyAdopt:
        "Este candidato pertenece a una tanda cargada. La biblioteca no lo adopta.",
    saveError: "No se pudo guardar el cambio",
    colName: "Candidato",
    colStatus: "Estado",
    colScope: "Origen",
    colActions: "Acciones",
};

export function libraryRowCanWrite(item: Pick<LibraryCandidateOut, "writable" | "status">): boolean {
    return item.writable && item.status === "new";
}

export function libraryStatusLabel(status: string): string {
    return LIBRARY_COPY.status[status] ?? status;
}

export function libraryRefusalMessage(error: unknown): string | null {
    if (typeof error !== "object" || error === null || !("data" in error)) return null;
    const data = (error as { data?: unknown }).data;
    if (typeof data !== "object" || data === null || !("detail" in data)) return null;
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail !== "object" || detail === null || !("message" in detail)) return null;
    const message = (detail as { message?: unknown }).message;
    return typeof message === "string" && message.trim() !== "" ? message : null;
}
