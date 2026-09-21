/**
 * structureDriftPresentation.ts — Copy y tokens G26 (hub planificación / edit sesión).
 */

import { STRUCTURE_DRIFT_WARNING_COPY } from "@nexia/shared";
import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export const STRUCTURE_DRIFT_CALLOUT_SHELL = cn(
    NEXIA_GLASS_CARD,
    "relative border-warning/30 bg-warning/5 p-4 pt-5",
);

export const STRUCTURE_DRIFT_CALLOUT_TITLE = "Deriva estructura ↔ sesiones";

export const STRUCTURE_DRIFT_CALLOUT_BODY = STRUCTURE_DRIFT_WARNING_COPY;

export const STRUCTURE_DRIFT_CALLOUT_LIST_CLASS = "mt-3 space-y-2";

export const STRUCTURE_DRIFT_CALLOUT_LINK_CLASS =
    "text-sm font-medium text-primary underline-offset-2 hover:underline";

export const STRUCTURE_DRIFT_BADGE_CLASS =
    "ml-2 inline-flex items-center rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning";

export function formatStructureDriftBadgeLabel(count: number): string {
    if (count <= 0) return "";
    return count === 1 ? "1 deriva" : `${count} derivas`;
}

export function structureDriftBadgeAriaLabel(count: number): string {
    if (count <= 0) return "";
    return count === 1
        ? "1 sesión planificada con deriva de estructura"
        : `${count} sesiones planificadas con deriva de estructura`;
}

export function buildEditSessionPath(sessionId: number): string {
    return `/dashboard/session-programming/edit-session/${sessionId}`;
}

export const STRUCTURE_DRIFT_EDIT_BANNER_TITLE = "Deriva de estructura semanal";

export const STRUCTURE_DRIFT_EDIT_BANNER_BODY =
    "Esta sesión está planificada en un día que ya no tiene entreno en la semana tipo del bloque. Puedes editarla o replanificar; las sesiones completadas no se marcan como error.";
