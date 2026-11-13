/**
 * adminCatalogHistoryPresentation.ts — Tokens, copy y formato del historial de la ficha.
 *
 * Contexto: QA_H8_P_2026-11-07. El diálogo pintaba field_path, actor_label y el JSON del
 * registro. El servidor (`catalog_change_log_readable`) ya entrega cada cambio legible: los
 * valores con las palabras del Excel, las relaciones como elementos con nombre en español,
 * quién lo hizo (`actor_kind`) y si hay algo que enseñar (`detail`). La procedencia no llega.
 * Aquí solo se pone el copy de la pantalla y se arma cada tarjeta.
 * Notas de mantenimiento: las frases de los elementos son las del resumen del import
 * (`catalogImportItemLine`), una sola forma de leer un cambio. Ningún campo se pinta con su
 * ruta interna: uno nuevo sin etiqueta se lee como «Otro dato del ejercicio».
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import type {
    ExerciseChangeLogActorKind,
    ExerciseChangeLogEntryOut,
} from "@nexia/shared/types/adminCatalog";

import {
    ADMIN_CATALOG_IMPORT_CHANGE_COPY,
    catalogImportItemLine,
} from "./adminCatalogImportChangePresentation";

/* ---------------------------------------------------------------------------
 * Tokens (glass + rim, DESIGN_PREMIUM §2 y §5.1; base 375 px).
 * ------------------------------------------------------------------------- */

export const ADMIN_CATALOG_HISTORY_LIST = "flex flex-col gap-3";

export const ADMIN_CATALOG_HISTORY_ITEM = cn(NEXIA_GLASS_CARD, "relative min-w-0 space-y-2 p-4 pt-5");

export const ADMIN_CATALOG_HISTORY_META = "text-xs leading-relaxed text-muted-foreground";

export const ADMIN_CATALOG_HISTORY_TITLE = "text-sm font-medium text-foreground";

export const ADMIN_CATALOG_HISTORY_LINES = "space-y-1";

export const ADMIN_CATALOG_HISTORY_LINE =
    "min-w-0 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground";

export const ADMIN_CATALOG_HISTORY_STATUS = "flex items-center gap-3 py-8";

export const ADMIN_CATALOG_HISTORY_STATUS_TEXT = "text-sm text-muted-foreground";

export const ADMIN_CATALOG_HISTORY_EMPTY = "py-6 text-sm text-muted-foreground";

export const ADMIN_CATALOG_HISTORY_FOOTER = "flex w-full sm:justify-end";

export const ADMIN_CATALOG_HISTORY_CLOSE = "min-h-touch w-full sm:w-auto sm:min-w-[7.5rem]";

/* ---------------------------------------------------------------------------
 * Copy.
 * ------------------------------------------------------------------------- */

const FIELD_LABELS: Record<string, string> = {
    "core.nombre": "Nombre",
    "core.nombre_ingles": "Nombre en inglés",
    "core.tipo": "Tipo",
    "core.nivel": "Nivel",
    "core.laterality": "Lateralidad",
    "core.axial_load": "Carga axial",
    "core.objetivo_entrenamiento": "Objetivo",
    "core.axial_load_review": "Revisión de la carga axial",
    "core.nivel_review": "Revisión del nivel",
    // Retired in H8-B; history rows from before still carry them.
    "core.descripcion": "Descripción",
    "core.instrucciones": "Instrucciones",
    "core.notas": "Notas",
    "core.is_active": "Estado",
    "derived.tipo_carga": "Tipo de carga",
    "derived.musculatura_principal": "Musculatura principal",
    "derived.patron_movimiento": "Patrón principal",
    "derived.equipo": "Material (resumen)",
    "review.catalog_review_note": "Nota de revisión",
    "review.axial_load_tiebreak": "Desempate de la carga axial",
    "review.nivel_tiebreak": "Desempate del nivel",
    catalog_review: "Revisión de la ficha",
    // SPEC_H10 R7: la técnica se registra por partes.
    "technique.description": "Técnica · Descripción",
    "technique.steps": "Técnica · Ejecución",
    "technique.tips": "Técnica · Consejos",
    muscles: "Músculos",
    movement_patterns: "Patrones",
    joint_actions: "Acciones articulares",
    equipment_ids: "Material",
    tag_ids: "Etiquetas",
};

const ACTOR_LABELS: Record<Exclude<ExerciseChangeLogActorKind, "batch" | "batch_rollback">, string> = {
    import: "Importación Excel",
    admin: "Administración",
    bulk_review: "Revisión masiva",
    decision_nelson: "Decisión de Nelson",
    decision_adrian: "Decisión de Adrián",
    migration: "Ajuste automático del catálogo",
    other: "Sistema",
};

export const ADMIN_CATALOG_HISTORY_COPY = {
    unknownField: "Otro dato del ejercicio",
    batch: (n: number | null | undefined) => (n == null ? "Tanda RepDB" : `Tanda RepDB ${n}`),
    batchRollback: (n: number | null | undefined) =>
        n == null ? "Tanda RepDB deshecha" : `Tanda RepDB ${n} deshecha`,
    detailSame: "Sin diferencias visibles (mismo contenido)",
    detailUnreadable: "Cambio registrado; su detalle no se puede mostrar",
} as const;

/* ---------------------------------------------------------------------------
 * Formato de una entrada.
 * ------------------------------------------------------------------------- */

export interface CatalogHistoryEntryView {
    id: number;
    when: string;
    actor: string;
    title: string;
    lines: string[];
}

const whenFormat = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export function formatCatalogHistoryWhen(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : whenFormat.format(date);
}

export function catalogHistoryActor(entry: Pick<ExerciseChangeLogEntryOut, "actor_kind" | "batch_number">): string {
    if (entry.actor_kind === "batch") return ADMIN_CATALOG_HISTORY_COPY.batch(entry.batch_number);
    if (entry.actor_kind === "batch_rollback") {
        return ADMIN_CATALOG_HISTORY_COPY.batchRollback(entry.batch_number);
    }
    return ACTOR_LABELS[entry.actor_kind];
}

export function catalogHistoryFieldLabel(fieldPath: string): string {
    return FIELD_LABELS[fieldPath] ?? ADMIN_CATALOG_HISTORY_COPY.unknownField;
}

function changeLines(entry: ExerciseChangeLogEntryOut): string[] {
    if (entry.detail === "same") return [ADMIN_CATALOG_HISTORY_COPY.detailSame];
    if (entry.detail === "unreadable") return [ADMIN_CATALOG_HISTORY_COPY.detailUnreadable];
    const items = entry.change.items ?? [];
    if (items.length > 0) return items.map(catalogImportItemLine);
    const { arrow } = ADMIN_CATALOG_IMPORT_CHANGE_COPY;
    return [`${entry.change.before} ${arrow} ${entry.change.after}`];
}

/** Una tarjeta del historial: cuándo, quién, qué campo y las frases del cambio. */
export function catalogHistoryEntryView(entry: ExerciseChangeLogEntryOut): CatalogHistoryEntryView {
    return {
        id: entry.id,
        when: formatCatalogHistoryWhen(entry.created_at),
        actor: catalogHistoryActor(entry),
        title: catalogHistoryFieldLabel(entry.field_path),
        lines: changeLines(entry),
    };
}
