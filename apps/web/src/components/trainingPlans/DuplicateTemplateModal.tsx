/**
 * DuplicateTemplateModal — Confirmación para duplicar plantilla (programa completo).
 *
 * POST duplicate → redirect al editor de la copia en borrador.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import { Alert, useToast } from "@/components/ui/feedback";
import { useDuplicateTrainingPlanTemplate } from "@nexia/shared/hooks/training/useDuplicateTrainingPlanTemplate";
import {
    DUPLICATE_TEMPLATE_MODAL_COPY,
    getMutationErrorMessage,
} from "@nexia/shared";

interface DuplicateTemplateModalProps {
    open: boolean;
    onClose: () => void;
    templateId: number | null;
    templateName: string | undefined;
}

export const DuplicateTemplateModal: React.FC<DuplicateTemplateModalProps> = ({
    open,
    onClose,
    templateId,
    templateName,
}) => {
    const navigate = useNavigate();
    const { showSuccess } = useToast();
    const { duplicateTemplate, isDuplicating, isError, error } =
        useDuplicateTrainingPlanTemplate();
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setActionError(null);
        }
    }, [open]);

    if (templateId == null) {
        return null;
    }

    const displayName = templateName?.trim() || "esta plantilla";
    const resolvedError =
        actionError ??
        (isError && error ? getMutationErrorMessage(error) : null);

    const handleConfirm = async () => {
        setActionError(null);
        try {
            const copy = await duplicateTemplate(templateId);
            onClose();
            showSuccess(DUPLICATE_TEMPLATE_MODAL_COPY.successToast);
            navigate(`/dashboard/training-plans/templates/${copy.id}/edit`);
        } catch (err: unknown) {
            setActionError(getMutationErrorMessage(err));
        }
    };

    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title={DUPLICATE_TEMPLATE_MODAL_COPY.title}
            description={DUPLICATE_TEMPLATE_MODAL_COPY.description(displayName)}
            closeOnBackdrop={!isDuplicating}
            closeOnEsc={!isDuplicating}
            isLoading={isDuplicating}
        >
            <div className="space-y-4">
                {resolvedError ? (
                    <Alert variant="error">{resolvedError}</Alert>
                ) : null}

                <p className="text-sm text-muted-foreground">
                    {DUPLICATE_TEMPLATE_MODAL_COPY.body}
                </p>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isDuplicating}
                    >
                        {DUPLICATE_TEMPLATE_MODAL_COPY.cancel}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => void handleConfirm()}
                        isLoading={isDuplicating}
                        disabled={isDuplicating}
                    >
                        {isDuplicating
                            ? DUPLICATE_TEMPLATE_MODAL_COPY.confirming
                            : DUPLICATE_TEMPLATE_MODAL_COPY.confirm}
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
