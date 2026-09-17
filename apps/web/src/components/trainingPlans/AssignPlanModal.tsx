/**
 * AssignPlanModal.tsx — Modal para asignar plan a cliente
 *
 * Contexto:
 * - Permite seleccionar cliente y fechas para asignar un plan existente a un cliente.
 * - Misma UX que AssignTemplateModal: cliente, nombre opcional, fechas.
 * - Solape: confirmación + confirm_assignment_overlap (POST query, CRUD canónico).
 *
 * @author Frontend Team
 * @since v6.1.0
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
    parseAssignmentOverlapApiDetail,
} from "@nexia/shared";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useGetTrainingPlanInstancesQuery } from "@nexia/shared/api/trainingPlansApi";
import type { AssignPlanToClientParams } from "@nexia/shared/types/training";
import type { SelectOption } from "@/components/ui/forms";

interface AssignPlanModalProps {
    open: boolean;
    onClose: () => void;
    planId: number | null;
    planName?: string;
    onSuccess?: () => void;
}

export const AssignPlanModal: React.FC<AssignPlanModalProps> = ({
    open,
    onClose,
    planId,
    planName,
    onSuccess,
}) => {
    const { showError } = useToast();
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined);
    const trainerId = trainerProfile?.id;

    const { data: clientsData } = useGetTrainerClientsQuery(
        {
            trainerId: trainerId!,
            filters: {},
            page: 1,
            per_page: 50,
        },
        { skip: !trainerId || !open },
    );

    const clients = clientsData?.items ?? [];
    const { assignPlan, isAssigning, isError, error } = useAssignTemplate();

    const [formData, setFormData] = useState({
        client_id: "",
        start_date: "",
        end_date: "",
        name: planName || "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isOverlapModalOpen, setIsOverlapModalOpen] = useState(false);
    const [overlappingPlan, setOverlappingPlan] = useState<{
        name: string;
        start_date: string;
        end_date: string;
    } | null>(null);
    const [pendingAssign, setPendingAssign] = useState<AssignPlanToClientParams | null>(null);

    const resolvedClientId = useMemo(() => {
        const parsed = Number(formData.client_id);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }, [formData.client_id]);

    const { data: existingInstances = [] } = useGetTrainingPlanInstancesQuery(
        { clientId: resolvedClientId ?? 0, trainerId: trainerId ?? 0 },
        { skip: !open || !resolvedClientId || !trainerId },
    );

    useEffect(() => {
        if (open) {
            setFormData({
                client_id: "",
                start_date: "",
                end_date: "",
                name: planName || "",
            });
            setErrors({});
            setPendingAssign(null);
            setOverlappingPlan(null);
            setIsOverlapModalOpen(false);
        }
    }, [open, planName]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.client_id) newErrors.client_id = "Debes seleccionar un cliente";
        if (!formData.start_date) newErrors.start_date = "La fecha de inicio es obligatoria";
        if (!formData.end_date) newErrors.end_date = "La fecha de fin es obligatoria";
        if (
            formData.start_date &&
            formData.end_date &&
            formData.start_date > formData.end_date
        ) {
            newErrors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatOverlapDate = (s: string | null | undefined) =>
        s
            ? new Date(s).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
              })
            : "—";

    const performAssign = useCallback(
        async (params: AssignPlanToClientParams) => {
            try {
                await assignPlan(params);
                if (onSuccess) onSuccess();
                else onClose();
            } catch (err) {
                const overlapDetail = parseAssignmentOverlapApiDetail(err);
                if (overlapDetail && !params.confirm_assignment_overlap) {
                    const firstId = overlapDetail.overlapping_instances[0]?.instance_id;
                    const fromList =
                        firstId != null
                            ? existingInstances.find((i) => i.id === firstId)
                            : undefined;
                    const fallback = findOverlappingTrainingPlanInstance(
                        existingInstances,
                        params.start_date,
                        params.end_date,
                        null,
                    );
                    const row = fromList ?? fallback;
                    if (row) {
                        setOverlappingPlan({
                            name: row.name,
                            start_date: formatOverlapDate(row.start_date),
                            end_date: formatOverlapDate(row.end_date),
                        });
                        setPendingAssign(params);
                        setIsOverlapModalOpen(true);
                        return;
                    }
                }
                showError(getMutationErrorMessage(err));
            }
        },
        [assignPlan, existingInstances, onClose, onSuccess, showError],
    );

    const handleSubmit = async () => {
        if (!validate() || !planId || !trainerId) return;

        const params: AssignPlanToClientParams = {
            plan_id: planId,
            client_id: Number(formData.client_id),
            trainer_id: trainerId,
            start_date: formData.start_date,
            end_date: formData.end_date,
            name: formData.name || undefined,
        };

        const overlapping = findOverlappingTrainingPlanInstance(
            existingInstances,
            formData.start_date,
            formData.end_date,
            null,
        );
        if (overlapping) {
            setOverlappingPlan({
                name: overlapping.name,
                start_date: formatOverlapDate(overlapping.start_date),
                end_date: formatOverlapDate(overlapping.end_date),
            });
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

    const clientOptions: SelectOption[] = clients.map((c) => ({
        value: c.id.toString(),
        label: `${c.nombre} ${c.apellidos}`,
    }));
    const today = new Date().toISOString().split("T")[0];

    return (
        <>
            <NexiaPremiumModal
                isOpen={open}
                onClose={onClose}
                title="Asignar plan a cliente"
                description={
                    planName
                        ? `Asignar "${planName}" a un cliente`
                        : "Selecciona un cliente y las fechas para asignar este plan"
                }
                closeOnBackdrop={!isAssigning}
                closeOnEsc={!isAssigning}
                isLoading={isAssigning}
            >
                <div className="space-y-4">
                    {isError && (
                        <Alert variant="error">
                            {error &&
                            typeof error === "object" &&
                            "data" in error &&
                            typeof (error as { data?: unknown }).data === "object" &&
                            (error as { data?: { detail?: string } }).data?.detail
                                ? String((error as { data: { detail?: string } }).data.detail)
                                : "Error al asignar el plan. Intenta de nuevo."}
                        </Alert>
                    )}

                    {clients.length === 0 && (
                        <Alert variant="warning">
                            No tienes clientes disponibles. Crea un cliente primero.
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <FormField label="Cliente" required variant={FORM_VARIANT}>
                            <FormCombobox
                                id="assign-plan-client"
                                size="sm"
                                variant={FORM_VARIANT}
                                options={clientOptions}
                                placeholder="Selecciona un cliente"
                                value={formData.client_id}
                                onChange={(next) => {
                                    setFormData((prev) => ({ ...prev, client_id: next }));
                                    if (errors.client_id)
                                        setErrors((prev) => ({ ...prev, client_id: "" }));
                                }}
                                disabled={clients.length === 0 || isAssigning}
                                ariaLabel="Cliente"
                            />
                            {errors.client_id ? (
                                <p className="text-sm text-destructive">{errors.client_id}</p>
                            ) : null}
                        </FormField>

                        <FormField label="Nombre personalizado (opcional)" variant={FORM_VARIANT}>
                            <Input
                                id="assign-plan-name"
                                variant={FORM_VARIANT}
                                type="text"
                                placeholder={planName || "Nombre del plan para este cliente"}
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                }
                                disabled={isAssigning}
                            />
                        </FormField>

                        <FormField label="Fecha de inicio" required variant={FORM_VARIANT}>
                            <Input
                                id="assign-plan-start-date"
                                variant={FORM_VARIANT}
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        start_date: e.target.value,
                                    }));
                                    if (errors.start_date)
                                        setErrors((prev) => ({ ...prev, start_date: "" }));
                                }}
                                error={errors.start_date}
                                min={today}
                                disabled={isAssigning}
                            />
                        </FormField>

                        <FormField label="Fecha de fin" required variant={FORM_VARIANT}>
                            <Input
                                id="assign-plan-end-date"
                                variant={FORM_VARIANT}
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => {
                                    setFormData((prev) => ({ ...prev, end_date: e.target.value }));
                                    if (errors.end_date)
                                        setErrors((prev) => ({ ...prev, end_date: "" }));
                                }}
                                error={errors.end_date}
                                min={formData.start_date || today}
                                disabled={isAssigning}
                            />
                        </FormField>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
                        <Button
                            variant="outline-primary"
                            onClick={onClose}
                            disabled={isAssigning}
                            className={PLATFORM_FORM_FOOTER_BTN}
                        >
                            Cancelar
                        </Button>
                        <Button
                            id="assign-plan-submit"
                            variant="primary"
                            onClick={handleSubmit}
                            isLoading={isAssigning}
                            disabled={!trainerId || clients.length === 0 || isAssigning}
                            className={PLATFORM_FORM_FOOTER_BTN}
                        >
                            {isAssigning ? "Asignando…" : "Asignar plan"}
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
            />
        </>
    );
};
