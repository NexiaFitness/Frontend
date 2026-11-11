/**
 * useAdminCatalogOptions.ts — Listas de referencia de la ficha admin, listas para buscar y nombrar.
 *
 * Contexto: H10. Los selectores con búsqueda y los chips de la ficha necesitan las mismas
 * listas (músculos, patrones, articulaciones, movimientos, material y etiquetas) con su
 * nombre en español, en mayúscula inicial (la base guarda «bíceps braquial») y en orden
 * alfabético español. Una sola carga para toda la ficha.
 * Notas de mantenimiento: un id que no esté en la lista (ref. inactiva) se nombra «#id»
 * para no esconder el dato.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { useMemo } from "react";
import {
    useGetActionsQuery,
    useGetEquipmentQuery,
    useGetMovementPatternsQuery,
    useGetTagsQuery,
} from "@nexia/shared/api/exercisesApi";
import { useGetJointsQuery, useGetMusclesQuery } from "@nexia/shared/api/injuriesApi";
import { sentenceCaseLabel, type SearchOption } from "@nexia/shared/utils/text/searchText";

export interface CatalogOptionList {
    options: SearchOption<number>[];
    name: (id: number) => string;
}

function optionList<T extends { id: number }>(rows: readonly T[], label: (row: T) => string | null | undefined): CatalogOptionList {
    const options = rows
        .map((row) => ({ value: row.id, label: sentenceCaseLabel(label(row) ?? `#${row.id}`) }))
        .sort((a, b) => a.label.localeCompare(b.label, "es"));
    const byId = new Map(options.map((option) => [option.value, option.label]));
    return { options, name: (id) => byId.get(id) ?? `#${id}` };
}

export function useAdminCatalogOptions() {
    const { data: muscles = [] } = useGetMusclesQuery();
    const { data: patterns = [] } = useGetMovementPatternsQuery({ limit: 200, is_active: true });
    const { data: equipment = [] } = useGetEquipmentQuery({ limit: 200, is_active: true });
    const { data: tags = [] } = useGetTagsQuery({ limit: 200, is_active: true });
    const { data: joints = [] } = useGetJointsQuery();
    const { data: actions = [] } = useGetActionsQuery({ limit: 200, is_active: true });

    return useMemo(() => {
        const bucketById = new Map(patterns.map((p) => [p.id, p.ui_bucket]));
        return {
            muscles: optionList(muscles, (m) => m.name_es || m.name),
            patterns: optionList(patterns, (p) => p.name_es || p.name_en),
            patternBucket: (id: number) => bucketById.get(id) ?? null,
            joints: optionList(joints, (j) => j.name_es || j.name),
            actions: optionList(actions, (a) => a.name_es || a.name_en || a.name),
            equipment: optionList(equipment, (e) => e.name_es || e.name_en),
            tags: optionList(tags, (t) => t.name_es || t.name_en),
        };
    }, [actions, equipment, joints, muscles, patterns, tags]);
}

export type AdminCatalogOptions = ReturnType<typeof useAdminCatalogOptions>;
