/**
 * AdminTaxonomyDeactivateModal.tsx — Confirmación desactivar / reactivar (T2).
 */

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/buttons";
import { NexiaPremiumModal } from "@/components/ui/modals";
import {
    NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS,
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS,
} from "@/components/ui/modals";
import {
    useDeactivateAdminTaxonomyMutation,
    useGetAdminTaxonomyQuery,
    useReactivateAdminTaxonomyMutation,
} from "@nexia/shared/api/adminTaxonomiesApi";
import {
    parseAdminTaxonomiesApiError,
    parseTaxonomyDeactivateConflict,
} from "@nexia/shared/utils/adminTaxonomies/parseAdminTaxonomiesApiError";
import type { TaxonomyItemOut, TaxonomyKind } from "@nexia/shared/types/adminTaxonomies";
import {
    ADMIN_TAX_BREAKDOWN,
    ADMIN_TAX_COPY,
    ADMIN_TAX_HINT,
    formatUsageBreakdown,
    taxonomyDisplayName,
} from "./adminTaxonomiesPresentation";

export interface AdminTaxonomyDeactivateModalProps {
    isOpen: boolean;
    kind: TaxonomyKind;
    item: TaxonomyItemOut | null;
    mode: "deactivate" | "reactivate";
    onClose: () => void;
    onDone: () => void;
}

export const AdminTaxonomyDeactivateModal: React.FC<AdminTaxonomyDeactivateModalProps> = ({
    isOpen,
    kind,
    item,
    mode,
    onClose,
    onDone,
}) => {
    const [formError, setFormError] = useState<string | null>(null);
    const [conflictBreakdown, setConflictBreakdown] = useState<Record<string, number> | null>(
        null
    );

    const { data: detail } = useGetAdminTaxonomyQuery(
        { kind, id: item?.id ?? 0 },
        { skip: !isOpen || !item || mode !== "deactivate" }
    );

    const [deactivate, { isLoading: deactivating }] = useDeactivateAdminTaxonomyMutation();
    const [reactivate, { isLoading: reactivating }] = useReactivateAdminTaxonomyMutation();
    const isLoading = deactivating || reactivating;

    useEffect(() => {
        if (!isOpen) {
            setFormError(null);
            setConflictBreakdown(null);
        }
    }, [isOpen]);

    if (!item) return null;

    const usageCount = detail?.usage_count ?? item.usage_count;
    const breakdown =
        conflictBreakdown ??
        detail?.usage_breakdown ??
        (usageCount > 0 ? { total: usageCount } : null);
    const breakdownRows = formatUsageBreakdown(breakdown);
    const blocked = mode === "deactivate" && usageCount > 0;

    const handleConfirm = async () => {
        if (blocked) return;
        setFormError(null);
        try {
            if (mode === "deactivate") {
                await deactivate({ kind, id: item.id }).unwrap();
            } else {
                await reactivate({ kind, id: item.id }).unwrap();
            }
            onDone();
        } catch (error: unknown) {
            const conflict = parseTaxonomyDeactivateConflict(error);
            if (conflict) {
                setConflictBreakdown(conflict.usage_breakdown);
                setFormError(ADMIN_TAX_COPY.deactivateBlocked);
                return;
            }
            setFormError(parseAdminTaxonomiesApiError(error).form ?? "Error");
        }
    };

    const title =
        mode === "deactivate" ? ADMIN_TAX_COPY.deactivateTitle : ADMIN_TAX_COPY.reactivateTitle;
    const body =
        mode === "deactivate" ? ADMIN_TAX_COPY.deactivateBody : ADMIN_TAX_COPY.reactivateBody;
    const confirmLabel =
        mode === "deactivate"
            ? ADMIN_TAX_COPY.deactivateConfirm
            : ADMIN_TAX_COPY.reactivateConfirm;

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={() => {
                if (!isLoading) onClose();
            }}
            title={title}
            description={`${taxonomyDisplayName(item)} — ${body}`}
            maxWidth="md"
            isLoading={isLoading}
            data-testid="admin-taxonomy-deactivate-modal"
            footer={
                <div className={NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS}>
                    <div className={NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {ADMIN_TAX_COPY.cancel}
                        </Button>
                        <Button
                            type="button"
                            variant={mode === "deactivate" ? "outline-destructive" : "ghost-primary"}
                            onClick={handleConfirm}
                            disabled={blocked || isLoading}
                            isLoading={isLoading}
                            data-testid="admin-taxonomy-deactivate-confirm"
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-3">
                {blocked || conflictBreakdown ? (
                    <p className="text-sm text-destructive" role="alert">
                        {ADMIN_TAX_COPY.deactivateBlocked}
                    </p>
                ) : null}
                {formError && !blocked ? (
                    <p className="text-sm text-destructive" role="alert">
                        {formError}
                    </p>
                ) : null}
                {breakdownRows.length > 0 ? (
                    <div>
                        <p className={ADMIN_TAX_HINT}>{ADMIN_TAX_COPY.usageBreakdownTitle}</p>
                        <ul className={ADMIN_TAX_BREAKDOWN}>
                            {breakdownRows.map((row) => (
                                <li key={row.table}>
                                    {row.table}: {row.count}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </NexiaPremiumModal>
    );
};
