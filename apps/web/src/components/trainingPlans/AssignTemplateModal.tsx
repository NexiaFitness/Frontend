/**
 * AssignTemplateModal.tsx — Modal para asignar plantilla a cliente
 *
 * Contexto:
 * - Permite seleccionar cliente y fechas para asignar una plantilla
 * - Validación de fechas
 * - Feedback visual con loading y errores
 *
 * @author Frontend Team
 * @since v5.0.0
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

interface AssignTemplateModalProps {
    open: boolean;
    onClose: () => void;
    templateId: number | null;
    templateName?: string;
    onSuccess?: () => void;
}

export const AssignTemplateModal: React.FC<AssignTemplateModalProps> = ({
    open,
    onClose,
    templateId,
    templateName,
    onSuccess,
}) => {
    // Obtener trainer_id
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined);
    const trainerId = trainerProfile?.id;

    // Obtener clientes
    const { data: clientsData } = useGetTrainerClientsQuery(
        {
            trainerId: trainerId!,
            filters: {},
            page: 1,
            per_page: 50,
        },
        {
            skip: !trainerId || !open,
        }
    );

    const clients = clientsData?.items ?? [];

    // Hook de asignación
    const { assignTemplate, isAssigning, isError, error } = useAssignTemplate();

    // Estado del formulario
    const [formData, setFormData] = useState({
        client_id: "",
        start_date: "",
        end_date: "",
        name: templateName || "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form cuando se abre/cierra
    useEffect(() => {
        if (open) {
            setFormData({
                client_id: "",
                start_date: "",
                end_date: "",
                name: templateName || "",
            });
            setErrors({});
        }
    }, [open, templateName]);

    // Validación
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.client_id) {
            newErrors.client_id = "Debes seleccionar un cliente";
        }

        if (!formData.start_date) {
            newErrors.start_date = "La fecha de inicio es obligatoria";
        }

        if (!formData.end_date) {
            newErrors.end_date = "La fecha de fin es obligatoria";
        }

        if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
            newErrors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handler de submit
    const handleSubmit = async () => {
        if (!validate() || !templateId || !trainerId) return;

        try {
            await assignTemplate({
                template_id: templateId,
                client_id: Number(formData.client_id),
                start_date: formData.start_date,
                end_date: formData.end_date,
                name: formData.name || undefined,
                trainer_id: trainerId, // Agregar trainer_id requerido por backend
            });

            // Éxito - cerrar modal y notificar
            if (onSuccess) {
                onSuccess();
            } else {
                onClose();
            }
        } catch (err) {
            console.error("Error assigning template:", err);
            // El error se muestra automáticamente por el Alert en el modal
        }
    };

    // Opciones de clientes
    const clientOptions: SelectOption[] = clients.map((client) => ({
        value: client.id.toString(),
        label: `${client.nombre} ${client.apellidos}`,
    }));

    // Calcular fecha mínima (hoy)
    const today = new Date().toISOString().split("T")[0];

    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title="Asignar Plantilla a Cliente"
            description={templateName ? `Asignar "${templateName}" a un cliente` : "Selecciona un cliente y las fechas para asignar esta plantilla"}
            closeOnBackdrop={!isAssigning}
            closeOnEsc={!isAssigning}
            isLoading={isAssigning}
        >
            <div className="space-y-4">
                {/* Error general */}
                {isError && (
                    <Alert variant="error">
                        {error && typeof error === "object" && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data
                            ? String(error.data.detail)
                            : "Error al asignar la plantilla. Intenta de nuevo."}
                    </Alert>
                )}

                {/* Warning si no hay clientes */}
                {clients.length === 0 && (
                    <Alert variant="warning">
                        No tienes clientes disponibles. Por favor, crea un cliente primero.
                    </Alert>
                )}

                {/* Formulario */}
                <div className="space-y-4">
                    {/* Cliente */}
                    <FormSelect
                        label="Cliente"
                        isRequired
                        options={clientOptions}
                        placeholder="Selecciona un cliente"
                        value={formData.client_id}
                        onChange={(e) => {
                            setFormData((prev) => ({ ...prev, client_id: e.target.value }));
                            if (errors.client_id) {
                                setErrors((prev) => ({ ...prev, client_id: "" }));
                            }
                        }}
                        error={errors.client_id}
                        disabled={clients.length === 0 || isAssigning}
                    />

                    {/* Nombre personalizado (opcional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Nombre personalizado (opcional)
                        </label>
                        <Input
                            type="text"
                            placeholder={templateName || "Nombre del plan para este cliente"}
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            disabled={isAssigning}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Si no especificas un nombre, se usará el nombre de la plantilla
                        </p>
                    </div>

                    {/* Fecha de inicio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Fecha de Inicio <span className="text-red-500">*</span>
                        </label>
                        <Input
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
                    </div>

                    {/* Fecha de fin */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Fecha de Fin <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, end_date: e.target.value }));
                                if (errors.end_date) {
                                    setErrors((prev) => ({ ...prev, end_date: "" }));
                                }
                            }}
                            error={errors.end_date}
                            min={formData.start_date || today}
                            disabled={isAssigning}
                        />
                    </div>
                </div>

                {/* Botones */}
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
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isAssigning}
                        disabled={clients.length === 0 || isAssigning}
                        className="flex-1 sm:flex-none"
                    >
                        {isAssigning ? "Asignando..." : "Asignar Plantilla"}
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};

