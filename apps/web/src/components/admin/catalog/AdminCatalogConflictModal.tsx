/**
 * AdminCatalogConflictModal.tsx — 409 optimistic lock: solo recargar (13 §3.2.4).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { NexiaPremiumModal } from "@/components/ui/modals";
import type { CatalogConcurrencyErrorOut } from "@nexia/shared/types/adminCatalog";
import { ADMIN_CATALOG_COPY, ADMIN_CATALOG_FOOTER_BTN } from "./adminCatalogPresentation";

export interface AdminCatalogConflictModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReload: () => void;
    conflict: CatalogConcurrencyErrorOut | null;
}

export const AdminCatalogConflictModal: React.FC<AdminCatalogConflictModalProps> = ({
    isOpen,
    onClose,
    onReload,
    conflict,
}) => {
    const summaryKeys =
        conflict?.diff_summary && typeof conflict.diff_summary === "object"
            ? Object.keys(conflict.diff_summary)
            : [];

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={onClose}
            title={ADMIN_CATALOG_COPY.conflictTitle}
            maxWidth="md"
            data-testid="admin-catalog-conflict-modal"
            footer={
                <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={ADMIN_CATALOG_FOOTER_BTN}
                        onClick={onClose}
                    >
                        {ADMIN_CATALOG_COPY.conflictClose}
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className={ADMIN_CATALOG_FOOTER_BTN}
                        onClick={onReload}
                    >
                        {ADMIN_CATALOG_COPY.conflictReload}
                    </Button>
                </div>
            }
        >
            <p className="text-sm leading-relaxed text-muted-foreground">
                {ADMIN_CATALOG_COPY.conflictBody}
            </p>
            {summaryKeys.length > 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                    Campos en servidor: {summaryKeys.join(", ")}
                </p>
            ) : null}
        </NexiaPremiumModal>
    );
};
