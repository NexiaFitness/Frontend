/**
 * AssignTemplateModal.tsx — Modal para asignar plantilla a cliente
 *
 * PR6: end_date solo desde assign-preview (BE autoridad). Sin cálculo en TS.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { NexiaPremiumModal } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { Input, FormCombobox, FormField } from "@/components/ui/forms";
import { PLATFORM_FORM_FOOTER_BTN } from "@/components/ui/forms/platformFormPresentation";
import { PlanOverlapModal } from "@/components/trainingPlans/modals";

const FORM_VARIANT = "premium" as const;
import { Alert, useToast } from "@/components/ui/feedback";
import { useAssignTemplate } from "@nexia/shared/hooks/training/useAssignTemplate";
import {
    findOverlappingTrainingPlanInstance,
    getMutationErrorMessage,
    overlapModalDisplayFromInstance,
    parseAssignmentOverlapApiDetail,
    type OverlapModalPlanDisplay,
} from "@nexia/shared";
import { useGetTrainingPlanInstancesQuery } from "@nexia/shared/api/trainingPlansApi";
import type { AssignTemplateToClientParams } from "@nexia/shared/types/training";
import {
    formatTemplateAssignEndDate,
    TEMPLATE_ASSIGN_MODAL_COPY,
} from "@nexia/shared";
import { usePreviewTemplateProgramAssignMutation } from "@nexia/shared/api/templateProgramApi";
import { useGetTrainerClientsQuery, useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { TemplateAssignPreviewOut } from "@nexia/shared/types/templateProgram";
import type { SelectOption } from "@/components/ui/forms";

interface AssignTemplateModalProps {
    open: boolean;
    onClose: () => void;
    templateId: number | null;
    templateName?: string;
    onSuccess?: () => void;
    clientId?: number;
    clientName?: string;
}

export const AssignTemplateModal: React.FC<AssignTemplateModalProps> = ({
    open,
    onClose,
    templateId,
    templateName,
    onSuccess,
    clientId: fixedClientId,
    clientName: fixedClientName,
}) => {
    const { showError } = useToast();
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined);
    const trainerId = trainerProfile?.id;

    const { data: clientData } = useGetClientQuery(fixedClientId ?? 0, {
        skip: !fixedClientId || !open,
    });
    const resolvedClientName =
        fixedClientName ??
        (clientData ? `${clientData.nombre} ${clientData.apellidos}` : null);

    const { data: clientsData } = useGetTrainerClientsQuery(
        {
            trainerId: trainerId!,
            filters: {},
            page: 1,
            per_page: 50,
        },
        {
            skip: !trainerId || !open || !!fixedClientId,
        },
    );

    const clients = clientsData?.items ?? [];
    const { assignTemplate, isAssigning, isError, error } = useAssignTemplate();
    const [previewAssign, { isLoading: isPreviewLoading }] =
        usePreviewTemplateProgramAssignMutation();

    const [formData, setFormData] = useState({
        client_id: "",
        start_date: "",
        name: templateName || "",
    });
    const [preview, setPreview] = useState<TemplateAssignPreviewOut | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isOverlapModalOpen, setIsOverlapModalOpen] = useState(false);
    const [overlappingPlan, setOverlappingPlan] = useState<OverlapModalPlanDisplay | null>(
        null
    );
    const [pendingAssign, setPendingAssign] =
        useState<AssignTemplateToClientParams | null>(null);

    const resolvedClientId = useMemo(() => {
        if (fixedClientId != null) return fixedClientId;
        const parsed = Number(formData.client_id);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }, [fixedClientId, formData.client_id]);

    const { data: existingInstances = [] } = useGetTrainingPlanInstancesQuery(
        { clientId: resolvedClientId ?? 0, trainerId: trainerId ?? 0 },
        {
            skip: !open || !resolvedClientId || !trainerId,
        },
    );

    useEffect(() => {
        if (open) {
            setFormData({
                client_id: fixedClientId != null ? String(fixedClientId) : "",
                start_date: "",
                name: templateName || "",
            });
            setPreview(null);
            setPreviewError(null);
            setErrors({});
        }
    }, [open, templateName, fixedClientId]);

    useEffect(() => {
        if (!open || !templateId || !resolvedClientId || !formData.start_date) {
            setPreview(null);
            setPreviewError(null);
            return;
        }

        let cancelled = false;
        const load = async () => {
            try {
                const result = await previewAssign({
                    templateId,
                    data: {
                        client_id: resolvedClientId,
                        start_date: formData.start_date,
                    },
                }).unwrap();
                if (!cancelled) {
                    setPreview(result);
                    setPreviewError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setPreview(null);
                    setPreviewError(
                        err && typeof err === "object" && "data" in err
                            ? String((err as { data: unknown }).data ?? "Error en preview")
                            : "No se pudo calcular la duración del programa",
                    );
                }
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [open, templateId, resolvedClientId, formData.start_date, previewAssign]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!resolvedClientId) {
            newErrors.client_id = "Debes seleccionar un cliente";
        }
        if (!formData.start_date) {
            newErrors.start_date = "La fecha de inicio es obligatoria";
        }
        if (!preview?.end_date) {
            newErrors.start_date =
                newErrors.start_date ?? "Espera el cálculo de fin desde el servidor";
        }
        if (preview && !preview.assignable) {
            newErrors.assign = preview.block_reasons[0] ?? "La plantilla no es asignable";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const performAssign = useCallback(
        async (params: AssignTemplateToClientParams) => {
            try {
                await assignTemplate(params);

                if (onSuccess) {
                    onSuccess();
                } else {
                    onClose();
                }
            } catch (err) {
                const overlapDetail = parseAssignmentOverlapApiDetail(err);
                if (overlapDetail && !params.confirm_assignment_overlap) {
                    const firstId =
                        overlapDetail.overlapping_instances[0]?.instance_id;
                    const fromList =
                        firstId != null
                            ? existingInstances.find((i) => i.id === firstId)
                            : undefined;
                    const fallback =
                        preview?.end_date != null
                            ? findOverlappingTrainingPlanInstance(
                                  existingInstances,
                                  params.start_date,
                                  preview.end_date,
                                  null,
                              )
                            : undefined;
                    const row = fromList ?? fallback;
                    if (row) {
                        setOverlappingPlan(overlapModalDisplayFromInstance(row));
                        setPendingAssign(params);
                        setIsOverlapModalOpen(true);
                        return;
                    }
                }
                showError(getMutationErrorMessage(err));
            }
        },
        [
            assignTemplate,
            existingInstances,
            onClose,
            onSuccess,
            preview?.end_date,
            showError,
        ],
    );

    const handleSubmit = async () => {
        if (!validate() || !templateId || !preview?.end_date || !resolvedClientId) {
            return;
        }

        const params: AssignTemplateToClientParams = {
            template_id: templateId,
            client_id: resolvedClientId,
            start_date: formData.start_date,
            name: formData.name || undefined,
        };

        const overlapping = findOverlappingTrainingPlanInstance(
            existingInstances,
            formData.start_date,
            preview.end_date,
            null,
        );
        if (overlapping) {
            setOverlappingPlan(overlapModalDisplayFromInstance(overlapping));
            setPendingAssign(params);
            setIsOverlapModalOpen(true);
            return;
        }

        await performAssign(params);
    };

    const handleConfirmOverlap = () => {
        setIsOverlapModalOpen(false);
        if (pendingAssign) {
            void performAssign({
                ...pendingAssign,
                confirm_assignment_overlap: true,
            });
            setPendingAssign(null);
        }
        setOverlappingPlan(null);
    };

    const handleCancelOverlap = () => {
        setIsOverlapModalOpen(false);
        setPendingAssign(null);
        setOverlappingPlan(null);
    };

    const clientOptions: SelectOption[] = clients.map((client) => ({
        value: client.id.toString(),
        label: `${client.nombre} ${client.apellidos}`,
    }));

    const today = new Date().toISOString().split("T")[0];

    return (
        <>
        <NexiaPremiumModal
            isOpen={open}
            onClose={onClose}
            title={TEMPLATE_ASSIGN_MODAL_COPY.title}
            description={TEMPLATE_ASSIGN_MODAL_COPY.description}
            closeOnBackdrop={!isAssigning}
            closeOnEsc={!isAssigning}
            isLoading={isAssigning}
        >
            <div className="space-y-4">
                {isError ? (
                    <Alert variant="error">
                        {error &&
                        typeof error === "object" &&
                        "data" in error &&
                        typeof error.data === "object" &&
                        error.data &&
                        "detail" in error.data
                            ? String(error.data.detail)
                            : "Error al asignar la plantilla. Intenta de nuevo."}
                    </Alert>
                ) : null}

                {previewError ? <Alert variant="error">{previewError}</Alert> : null}

                {preview && !preview.assignable ? (
                    <Alert variant="warning">
                        <ul className="list-disc space-y-1 pl-4 text-sm">
                            {preview.block_reasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                            ))}
                        </ul>
                    </Alert>
                ) : null}

                {preview?.warnings?.length ? (
                    <Alert variant="warning">
                        <ul className="list-disc space-y-1 pl-4 text-sm">
                            {preview.warnings.map((w) => (
                                <li key={w.code}>{w.message}</li>
                            ))}
                        </ul>
                    </Alert>
                ) : null}

                {clients.length === 0 && fixedClientId == null ? (
                    <Alert variant="warning">
                        No tienes clientes disponibles. Crea un cliente primero.
                    </Alert>
                ) : null}

                <div className="space-y-4">
                    {fixedClientId != null ? (
                        <div>
                            <span className="mb-1.5 block text-sm font-medium text-foreground">
                                Cliente
                            </span>
                            <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                                Asignando a: {resolvedClientName ?? `Cliente #${fixedClientId}`}
                            </p>
                        </div>
                    ) : (
                        <FormField label="Cliente" required variant={FORM_VARIANT}>
                            <FormCombobox
                                size="sm"
                                variant={FORM_VARIANT}
                                options={clientOptions}
                                placeholder="Selecciona un cliente"
                                value={formData.client_id}
                                onChange={(next) => {
                                    setFormData((prev) => ({ ...prev, client_id: next }));
                                    if (errors.client_id) {
                                        setErrors((prev) => ({ ...prev, client_id: "" }));
                                    }
                                }}
                                disabled={clients.length === 0 || isAssigning}
                                ariaLabel="Cliente"
                            />
                            {errors.client_id ? (
                                <p className="text-sm text-destructive">{errors.client_id}</p>
                            ) : null}
                        </FormField>
                    )}

                    <FormField label="Nombre personalizado (opcional)" variant={FORM_VARIANT}>
                        <Input
                            variant={FORM_VARIANT}
                            type="text"
                            placeholder={templateName || "Nombre del plan para este cliente"}
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            disabled={isAssigning}
                        />
                    </FormField>

                    <FormField label="Fecha de inicio" required variant={FORM_VARIANT}>
                        <Input
                            variant={FORM_VARIANT}
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, start_date: e.target.value }));
                                if (errors.start_date) {
                                    setErrors((prev) => ({ ...prev, start_date: "" }));
                                }
                            }}
                            error={errors.start_date}
                            min={today}
                            disabled={isAssigning}
                        />
                    </FormField>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            Fecha de fin del plan
                        </label>
                        <div
                            className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium text-foreground"
                            aria-live="polite"
                        >
                            {isPreviewLoading
                                ? TEMPLATE_ASSIGN_MODAL_COPY.endDateLoading
                                : preview?.end_date
                                  ? formatTemplateAssignEndDate(
                                        preview.end_date,
                                        preview.program_week_count,
                                    )
                                  : TEMPLATE_ASSIGN_MODAL_COPY.endDateHint}
                        </div>
                    </div>

                    {errors.assign ? (
                        <p className="text-sm text-destructive">{errors.assign}</p>
                    ) : null}
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline-primary"
                        onClick={onClose}
                        disabled={isAssigning}
                        className={PLATFORM_FORM_FOOTER_BTN}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isAssigning || isPreviewLoading}
                        disabled={
                            (fixedClientId == null && clients.length === 0) ||
                            isAssigning ||
                            isPreviewLoading ||
                            !preview?.assignable
                        }
                        className={PLATFORM_FORM_FOOTER_BTN}
                    >
                        {isAssigning ? "Asignando…" : "Asignar plantilla"}
                    </Button>
                </div>
            </div>
        </NexiaPremiumModal>
            <PlanOverlapModal
                isOpen={isOverlapModalOpen}
                onClose={handleCancelOverlap}
                onConfirm={handleConfirmOverlap}
                planName={overlappingPlan?.name ?? ""}
                planStartDate={overlappingPlan?.start_date ?? ""}
                planEndDate={overlappingPlan?.end_date ?? ""}
                isLoading={isAssigning}
                variant="create"
                conflictPhase={overlappingPlan?.conflictPhase ?? "current"}
            />
        </>
    );
};
