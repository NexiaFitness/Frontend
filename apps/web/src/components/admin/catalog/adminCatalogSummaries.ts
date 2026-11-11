/**
 * adminCatalogSummaries.ts — Resumen de una línea de cada tarjeta plegada de la ficha (móvil).
 *
 * Contexto: H10 (DISENO_H10_FICHA_ADMIN §2). Una tarjeta cerrada dice lo esencial sin
 * abrirla: «Fuerza · Principiante», «3 músculos», «Flexión de codo · Codo», «4 pasos · 2
 * consejos». Funciones puras: se prueban sin React.
 * Notas de mantenimiento: los textos están en las presentaciones de cada tarjeta.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { formatCatalogMultiplier, techniqueFromDraft } from "@nexia/shared";
import type { CatalogPreviewOut } from "@nexia/shared/types/adminCatalog";
import { NIVEL_OPTIONS, OBJETIVO_OPTIONS } from "./adminCatalogFieldOptions";
import type { AdminCatalogFormDraft } from "./adminCatalogFormTypes";
import {
    FICHA_COPY,
    MATERIAL_COPY,
    MOVEMENT_COPY,
    MUSCLE_COPY,
    RELATIONS_COPY,
    type AdminCatalogCardId,
} from "./adminCatalogFichaPresentation";
import { ADMIN_CATALOG_TECHNIQUE_COPY } from "./adminCatalogTechniquePresentation";
import type { AdminCatalogOptions } from "./useAdminCatalogOptions";

function label(options: ReadonlyArray<{ value: string; label: string }>, value: string | null): string | null {
    return options.find((option) => option.value === value)?.label ?? null;
}

export function fichaSummaries(
    draft: AdminCatalogFormDraft,
    options: AdminCatalogOptions,
    preview: CatalogPreviewOut | undefined,
    alternatives: number
): Record<AdminCatalogCardId, string> {
    const datos = [label(OBJETIVO_OPTIONS, draft.core.objetivo_entrenamiento), label(NIVEL_OPTIONS, draft.core.nivel)]
        .filter(Boolean)
        .join(" · ");
    const primaryPattern = draft.patterns.find((p) => p.role === "primary");
    const firstJoint = draft.joints[0];
    const movement = [
        primaryPattern ? options.patterns.name(primaryPattern.movement_pattern_id) : null,
        firstJoint ? options.joints.name(firstJoint.joint_id) : null,
    ]
        .filter(Boolean)
        .join(" · ");
    const firstGroup = preview?.volume_per_set.groups[0];
    const technique = techniqueFromDraft(draft.technique);
    return {
        datos: datos || FICHA_COPY.none,
        musculos: draft.muscles.length === 0 ? FICHA_COPY.none : MUSCLE_COPY.summary(draft.muscles.length),
        cuenta: firstGroup ? `${firstGroup.name} ${formatCatalogMultiplier(firstGroup.multiplier)}` : "",
        movimiento: movement || MOVEMENT_COPY.noPattern,
        material: MATERIAL_COPY.summary(draft.equipment_ids.length, draft.tag_ids.length),
        tecnica:
            technique.steps.length === 0
                ? ADMIN_CATALOG_TECHNIQUE_COPY.summaryNone
                : ADMIN_CATALOG_TECHNIQUE_COPY.summary(technique.steps.length, technique.tips.length),
        relaciones: RELATIONS_COPY.summary(alternatives),
    };
}
