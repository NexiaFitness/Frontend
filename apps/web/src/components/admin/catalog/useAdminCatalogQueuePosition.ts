/**
 * useAdminCatalogQueuePosition.ts — Dónde está el ejercicio dentro de la cola de revisión.
 *
 * Contexto: H10. La ficha dice «Catálogo · Revisión 3 de 386» y su único botón primario
 * pasa a «Guardar y siguiente» cuando el ejercicio está en la cola (sustituye a «Revisado y
 * siguiente» sin añadir botón, 05_ACTION_HIERARCHY §1). La cola la crea el listado.
 * Notas de mantenimiento: la cola vive en sessionStorage (catalogQueue, shared); se lee al
 * montar y al cambiar de ejercicio.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { useMemo } from "react";
import { getAdminCatalogQueue, getNextCatalogQueuePk } from "@nexia/shared";

export interface AdminCatalogQueuePosition {
    inQueue: boolean;
    position: number;
    total: number;
    nextPk: number | null;
}

export function useAdminCatalogQueuePosition(pk: number | null): AdminCatalogQueuePosition {
    return useMemo(() => {
        if (pk == null) return { inQueue: false, position: 0, total: 0, nextPk: null };
        const queue = getAdminCatalogQueue();
        const index = queue.indexOf(pk);
        return {
            inQueue: index >= 0,
            position: index + 1,
            total: queue.length,
            nextPk: index >= 0 ? getNextCatalogQueuePk(pk) : null,
        };
    }, [pk]);
}
