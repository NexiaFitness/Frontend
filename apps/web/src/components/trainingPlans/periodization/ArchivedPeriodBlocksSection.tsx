/**
 * ArchivedPeriodBlocksSection.tsx — Lista mínima «Bloques archivados» con «Reactivar» (D-BLQ-5).
 *
 * Contexto: hub de planificación, bajo las tarjetas de bloque. No se renderiza si el
 * plan no tiene bloques archivados. Confirmación con NexiaPremiumConfirmModal.
 *
 * Notas de mantenimiento: solo render; orquestación en useArchivedBlockReactivation.
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import React from "react";

import { Button } from "@/components/ui/buttons";
import { NexiaPremiumConfirmModal } from "@/components/ui/modals";

import {
    ARCHIVED_BLOCKS_CARD_CLASS,
    ARCHIVED_BLOCKS_LABEL_CLASS,
    ARCHIVED_BLOCKS_LIST_CLASS,
    ARCHIVED_BLOCKS_REACTIVATE_LABEL,
    ARCHIVED_BLOCKS_ROW_CLASS,
    ARCHIVED_BLOCKS_ROW_META_CLASS,
    ARCHIVED_BLOCKS_ROW_NAME_CLASS,
    ARCHIVED_BLOCKS_SECTION_TITLE,
    archivedBlockLabel,
    archivedBlockRange,
} from "./archivedBlocksPresentation";
import { useArchivedBlockReactivation } from "./useArchivedBlockReactivation";

interface Props {
    planId: number;
}

export const ArchivedPeriodBlocksSection: React.FC<Props> = ({ planId }) => {
    const reactivation = useArchivedBlockReactivation(planId);

    if (reactivation.archivedBlocks.length === 0 && !reactivation.isOpen) {
        return null;
    }

    return (
        <section
            className={ARCHIVED_BLOCKS_CARD_CLASS}
            aria-labelledby="archived-blocks-title"
            data-testid="archived-period-blocks"
        >
            <h3 id="archived-blocks-title" className={ARCHIVED_BLOCKS_LABEL_CLASS}>
                {ARCHIVED_BLOCKS_SECTION_TITLE}
            </h3>
            <ul className={ARCHIVED_BLOCKS_LIST_CLASS}>
                {reactivation.archivedBlocks.map((block) => (
                    <li key={block.id} className={ARCHIVED_BLOCKS_ROW_CLASS}>
                        <div className="min-w-0">
                            <p className={ARCHIVED_BLOCKS_ROW_NAME_CLASS}>
                                {archivedBlockLabel(block)}
                            </p>
                            <p className={ARCHIVED_BLOCKS_ROW_META_CLASS}>
                                {archivedBlockRange(block)}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            onClick={() => reactivation.requestReactivation(block)}
                            aria-label={`${ARCHIVED_BLOCKS_REACTIVATE_LABEL} ${archivedBlockLabel(block)}`}
                        >
                            {ARCHIVED_BLOCKS_REACTIVATE_LABEL}
                        </Button>
                    </li>
                ))}
            </ul>
            <NexiaPremiumConfirmModal
                isOpen={reactivation.isOpen}
                onClose={reactivation.cancel}
                onConfirm={() => void reactivation.confirm()}
                title={reactivation.copy?.title ?? ""}
                description={reactivation.copy?.description}
                confirmLabel={reactivation.copy?.confirmLabel ?? ""}
                loadingConfirmLabel={reactivation.copy?.loadingConfirmLabel}
                confirmVariant="primary"
                isLoading={reactivation.isLoading}
                data-testid="reactivate-block-modal"
            />
        </section>
    );
};
