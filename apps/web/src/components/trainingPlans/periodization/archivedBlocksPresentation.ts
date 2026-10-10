/**
 * archivedBlocksPresentation.ts — Copy y clases de «Bloques archivados» (D-BLQ-5).
 *
 * Contexto: lista mínima con «Reactivar» en el hub de planificación y textos del
 * NexiaPremiumConfirmModal. Decisión de Nelson: las sesiones planificadas borradas
 * al archivar no se recuperan y el modal lo dice (R-20 de 08_SPEC_REGLAS_Y_CASOS_LIMITE.md).
 *
 * Notas de mantenimiento: sin estado ni red; tokens del hub (planningShellPresentation)
 * y jerarquía de acciones (design/platform/05_ACTION_HIERARCHY.md: auxiliar en card).
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";

import { NEXIA_PORTAL_CARD_DESCRIPTION } from "@/components/athlete/account/athleteSettingsPresentation";

import {
    PLANNING_ACTIVE_PLAN_CARD_CLASS,
    PLANNING_ACTIVE_PLAN_LABEL,
} from "./planningShellPresentation";
import { formatRangeShort } from "./periodizationWeeklyStructureUtils";

export const ARCHIVED_BLOCKS_SECTION_TITLE = "Bloques archivados";
export const ARCHIVED_BLOCKS_REACTIVATE_LABEL = "Reactivar";

export const ARCHIVED_BLOCKS_CARD_CLASS = PLANNING_ACTIVE_PLAN_CARD_CLASS;
export const ARCHIVED_BLOCKS_LABEL_CLASS = PLANNING_ACTIVE_PLAN_LABEL;
export const ARCHIVED_BLOCKS_LIST_CLASS = "divide-y divide-border/40";
export const ARCHIVED_BLOCKS_ROW_CLASS =
    "flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0";
export const ARCHIVED_BLOCKS_ROW_NAME_CLASS = "text-sm font-medium text-foreground";
export const ARCHIVED_BLOCKS_ROW_META_CLASS = NEXIA_PORTAL_CARD_DESCRIPTION;

/** Nombre visible: nombre, objetivo o rango de fechas. */
export function archivedBlockLabel(block: PlanPeriodBlock): string {
    const name = (block.name ?? block.goal ?? "").trim();
    return name || formatRangeShort(block.start_date, block.end_date);
}

export function archivedBlockRange(block: PlanPeriodBlock): string {
    return formatRangeShort(block.start_date, block.end_date);
}

export interface ReactivateBlockCopy {
    title: string;
    description: string;
    confirmLabel: string;
    loadingConfirmLabel: string;
}

export function buildReactivateBlockCopy(block: PlanPeriodBlock): ReactivateBlockCopy {
    return {
        title: "Reactivar bloque",
        description: `«${archivedBlockLabel(block)}» (${archivedBlockRange(block)}) vuelve a estar activo con sus sesiones entrenadas. Las sesiones planificadas que se borraron al archivarlo no se recuperan.`,
        confirmLabel: "Reactivar bloque",
        loadingConfirmLabel: "Reactivando…",
    };
}

export const REACTIVATE_BLOCK_SUCCESS = "Bloque reactivado.";
