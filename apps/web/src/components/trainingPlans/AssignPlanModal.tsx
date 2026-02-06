/**
 * AssignPlanModal.tsx — Modal para asignar plan a cliente
 *
 * Contexto:
 * - Permite seleccionar cliente y fechas para asignar un plan existente a un cliente.
 * - Misma UX que AssignTemplateModal: cliente, nombre opcional, fechas.
 * - Lógica de asignación en shared (useAssignTemplate.assignPlan).
 *
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useState, useEffect } from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import { Input, FormSelect } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import { useAssignTemplate } from "@nexia/shared/hooks/training/useAssignTemplate";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
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
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined);
    const trainerId = trainerProfile?.id;

    const { data: clientsData } = useGetTrainerClientsQuery(
        {
            trainerId: trainerId!,
            filters: {},
            page: 1,
            per_page: 50,
        },
        { skip: !trainerId || !open }
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

    useEffect(() => {
        if (open) {
            setFormData({
                client_id: "",
                start_date: "",
                end_date: "",
                name: planName || "",
            });
            setErrors({});
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

    const handleSubmit = async () => {
        if (!validate() || !planId || !trainerId) return;

        try {
            await assignPlan({
                plan_id: planId,
                client_id: Number(formData.client_id),
                trainer_id: trainerId,
                start_date: formData.start_date,
                end_date: formData.end_date,
                name: formData.name || undefined,
            });
            if (onSuccess) onSuccess();
            else onClose();
        } catch (err) {
            console.error("Error assigning plan:", err);
        }
    };

    const clientOptions: SelectOption[] = clients.map((c) => ({
        value: c.id.toString(),
        label: `${c.nombre} ${c.apellidos}`,
    }));
    const today = new Date().toISOString().split("T")[0];

    return (
        <BaseModal
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
            titleId="assign-plan-modal-title"
            descriptionId="assign-plan-modal-description"
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
                    <FormSelect
                        id="assign-plan-client"
                        label="Cliente"
                        isRequired
                        options={clientOptions}
                        placeholder="Selecciona un cliente"
                        value={formData.client_id}
                        onChange={(e) => {
                            setFormData((prev) => ({ ...prev, client_id: e.target.value }));
                            if (errors.client_id) setErrors((prev) => ({ ...prev, client_id: "" }));
                        }}
                        error={errors.client_id}
                        disabled={clients.length === 0 || isAssigning}
                    />

                    <div>
                        <label
                            htmlFor="assign-plan-name"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Nombre personalizado (opcional)
                        </label>
                        <Input
                            id="assign-plan-name"
                            type="text"
                            placeholder={planName || "Nombre del plan para este cliente"}
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            disabled={isAssigning}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="assign-plan-start-date"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Fecha de inicio <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="assign-plan-start-date"
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, start_date: e.target.value }));
                                if (errors.start_date)
                                    setErrors((prev) => ({ ...prev, start_date: "" }));
                            }}
                            error={errors.start_date}
                            min={today}
                            disabled={isAssigning}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="assign-plan-end-date"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Fecha de fin <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="assign-plan-end-date"
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
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isAssigning}
                        className="flex-1 sm:flex-none"
                    >
                        Cancelar
                    </Button>
                    <Button
                        id="assign-plan-submit"
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isAssigning}
                        disabled={!trainerId || clients.length === 0 || isAssigning}
                        className="flex-1 sm:flex-none"
                    >
                        {isAssigning ? "Asignando…" : "Asignar plan"}
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
