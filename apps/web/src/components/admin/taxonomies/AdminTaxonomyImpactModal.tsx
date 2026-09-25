/**
 * AdminTaxonomyImpactModal.tsx — Confirmación de impacto ui_bucket / muscle_group (T2).
 */

import React, { useState } from "react";
import { NexiaPremiumConfirmModal } from "@/components/ui/modals";
import { useUpdateAdminTaxonomyMutation } from "@nexia/shared/api/adminTaxonomiesApi";
import { parseAdminTaxonomiesApiError } from "@nexia/shared/utils/adminTaxonomies/parseAdminTaxonomiesApiError";
import type { TaxonomyKind, TaxonomyUpdateIn } from "@nexia/shared/types/adminTaxonomies";
import { ADMIN_TAX_COPY } from "./adminTaxonomiesPresentation";

export interface AdminTaxonomyImpactPayload {
    kind: TaxonomyKind;
    id: number;
    body: TaxonomyUpdateIn;
    affectedCount: number;
}

export interface AdminTaxonomyImpactModalProps {
    payload: AdminTaxonomyImpactPayload | null;
    onClose: () => void;
    onDone: () => void;
}

export const AdminTaxonomyImpactModal: React.FC<AdminTaxonomyImpactModalProps> = ({
    payload,
    onClose,
    onDone,
}) => {
    const [error, setError] = useState<string | null>(null);
    const [updateItem, { isLoading }] = useUpdateAdminTaxonomyMutation();

    const handleConfirm = async () => {
        if (!payload) return;
        setError(null);
        try {
            await updateItem({
                kind: payload.kind,
                id: payload.id,
                body: payload.body,
            }).unwrap();
            onDone();
        } catch (err: unknown) {
            setError(parseAdminTaxonomiesApiError(err).form ?? "Error");
        }
    };

    return (
        <NexiaPremiumConfirmModal
            isOpen={payload != null}
            onClose={() => {
                if (!isLoading) onClose();
            }}
            onConfirm={handleConfirm}
            title={ADMIN_TAX_COPY.impactTitle}
            description={
                payload
                    ? ADMIN_TAX_COPY.impactBody(payload.affectedCount)
                    : undefined
            }
            bodyContent={
                error ? (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                ) : null
            }
            confirmLabel={ADMIN_TAX_COPY.impactConfirm}
            cancelLabel={ADMIN_TAX_COPY.cancel}
            confirmVariant="primary"
            isLoading={isLoading}
            data-testid="admin-taxonomy-impact-modal"
        />
    );
};
