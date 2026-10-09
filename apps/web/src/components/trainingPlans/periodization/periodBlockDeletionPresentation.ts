/**
 * periodBlockDeletionPresentation.ts — Copy de borrar / archivar bloque (D-BLQ-2).
 *
 * Contexto: textos de NexiaPremiumConfirmModal y toasts para usePeriodBlockDeletion.
 * Decisión de Nelson: lo entrenado no se borra (se archiva); lo planificado se borra
 * con aviso y recuento.
 *
 * Notas de mantenimiento: sin estado ni red.
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import type { BlockRemovalVariant } from "@nexia/shared";
import type { BlockDeletionPreview } from "@nexia/shared/types/planningCargas";

export interface BlockRemovalCopy {
    title: string;
    description: string;
    confirmLabel: string;
    loadingConfirmLabel: string;
    confirmVariant: "destructive" | "primary";
}

function sessions(count: number, adjective: string): string {
    return `${count} ${count === 1 ? "sesión" : "sesiones"} ${adjective}${count === 1 ? "" : "s"}`;
}

export function buildBlockRemovalCopy(
    variant: BlockRemovalVariant,
    preview: Pick<BlockDeletionPreview, "planned_sessions" | "protected_sessions">,
    blockLabel: string,
): BlockRemovalCopy {
    if (variant === "archive") {
        const planned =
            preview.planned_sessions > 0
                ? ` Se borrarán ${sessions(preview.planned_sessions, "planificada")}.`
                : "";
        return {
            title: "Archivar bloque",
            description: `«${blockLabel}» tiene ${sessions(preview.protected_sessions, "entrenada")}, así que no se puede eliminar. Al archivarlo se conservan con su fase.${planned}`,
            confirmLabel: "Archivar bloque",
            loadingConfirmLabel: "Archivando…",
            confirmVariant: "primary",
        };
    }
    const planned =
        variant === "delete-planned"
            ? ` Se borrarán ${sessions(preview.planned_sessions, "planificada")}.`
            : "";
    return {
        title: "Eliminar bloque",
        description: `¿Eliminar «${blockLabel}»?${planned} No se puede deshacer.`,
        confirmLabel: "Eliminar bloque",
        loadingConfirmLabel: "Eliminando…",
        confirmVariant: "destructive",
    };
}

export function buildBlockRemovalSuccessMessage(
    variant: BlockRemovalVariant,
    removedSessions: number,
): string {
    const removed =
        removedSessions > 0 ? ` Se borraron ${sessions(removedSessions, "planificada")}.` : "";
    return variant === "archive"
        ? `Bloque archivado.${removed}`
        : `Bloque de periodización eliminado.${removed}`;
}
