/**
 * EditProgressModal.tsx — Modal para editar registros de progreso del cliente.
 *
 * Contexto:
 * - Permite modificar métricas físicas (peso, altura, notas, unidad, etc.)
 * - Usa BaseModal para consistencia visual y accesibilidad (como DeleteClientModal)
 * - Reutiliza ClientMetricsFields (layout y tipografía idénticos al Figma)
 * - Calcula automáticamente el IMC al modificar peso/altura
 * - Controla unidad cm ↔ m (frontend ↔ backend)
 *
 * Flujo:
 * - Recibe progressRecord con datos existentes
 * - Prellena formulario
 * - Envía PUT /progress/{id} al guardar
 * - Cierra modal y actualiza UI tras éxito
 *
 * @author Nelson
 * @since v4.4.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { BaseModal } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { TYPOGRAPHY } from "@/utils/typography";
import { ClientMetricsFields } from "../metrics/ClientMetricsFields";
import { useUpdateClientProgress } from "@nexia/shared/hooks/clients/useUpdateClientProgress";
import { calculateBMI } from "@nexia/shared";
import type { ClientProgress } from "@nexia/shared/types/progress";
import type { UpdateClientProgressData } from "@nexia/shared/types/progress";
import type { ClientFormData } from "@nexia/shared/types/client";

interface EditProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number;
    progressRecord: ClientProgress;
    onSuccess?: () => void;
}

export const EditProgressModal: React.FC<EditProgressModalProps> = ({
    isOpen,
    onClose,
    clientId,
    progressRecord,
    onSuccess,
}) => {
    // =========================================================
    // ESTADO LOCAL
    // =========================================================
    const [formData, setFormData] = useState<UpdateClientProgressData>({
        peso: progressRecord?.peso ?? null,
        altura: progressRecord?.altura ?? null,
        unidad: (progressRecord?.unidad ?? "metric") as "metric" | "imperial",
        imc: progressRecord?.imc ?? null,
        notas: progressRecord?.notas ?? null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Hook de mutación (PUT)
    const { updateProgressRecord, isLoading, error } =
        useUpdateClientProgress({ clientId });


    // =========================================================
    // HANDLERS
    // =========================================================

    const updateField = <K extends keyof UpdateClientProgressData>(
        field: K,
        value: UpdateClientProgressData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.peso) newErrors.peso = "El peso es obligatorio.";
        if (!formData.altura) newErrors.altura = "La altura es obligatoria.";
        // Validar altura en metros (backend espera 0.5-3.0 m)
        if (formData.altura && (formData.altura <= 0 || formData.altura < 0.5 || formData.altura > 3.0)) {
            newErrors.altura = "La altura debe estar entre 0.5 y 3.0 metros.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            // Calcular IMC usando la función centralizada
            // La altura ya está en metros en este modal (según diseño)
            const imc = formData.peso && formData.altura
                ? calculateBMI(formData.peso, formData.altura)
                : null;

            await updateProgressRecord(progressRecord.id, {
                ...formData,
                imc,
                // conversión UI → backend: la altura ya está en metros (según diseño)
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error("[EditProgressModal] Error actualizando progreso:", err);
        }
    };

    // Reset de formulario al cerrar modal
    useEffect(() => {
        if (!isOpen) {
            setErrors({});
            setFormData({
                peso: progressRecord?.peso ?? null,
                altura: progressRecord?.altura ?? null,
                unidad: (progressRecord?.unidad ?? "metric") as "metric" | "imperial",
                imc: progressRecord?.imc ?? null,
                notas: progressRecord?.notas ?? null,
            });
        }
    }, [isOpen, progressRecord]);

    // =========================================================
    // RENDER
    // =========================================================

    // Preparar formData compatible con ClientMetricsFields
    const compatibleFormData = useMemo<Partial<ClientFormData & {
        fecha_registro?: string;
        unidad?: "metric" | "imperial";
        notas?: string | null;
    }>>(() => ({
        ...formData,
        unidad: (formData.unidad ?? "metric") as "metric" | "imperial",
    }), [formData]);

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar métricas del progreso"
            description="Modifica los valores del registro seleccionado. El IMC se recalcula automáticamente."
            iconType="info"
            isLoading={isLoading}
            titleId="edit-progress-title"
            descriptionId="edit-progress-description"
        >
            <div className="space-y-6">
                {/* Fecha readonly (no editable) */}
                <div>
                    <label className={TYPOGRAPHY.inputLabel}>Fecha del registro</label>
                    <input
                        type="text"
                        value={
                            progressRecord?.fecha_registro
                                ? new Date(progressRecord.fecha_registro).toLocaleDateString()
                                : "-"
                        }
                        readOnly
                        className="w-full border rounded-lg p-2 bg-gray-100 text-gray-700"
                    />
                </div>

                {/* Campos de métricas físicas */}
                <ClientMetricsFields
                    formData={compatibleFormData}
                    errors={errors}
                    updateField={(field, value) => {
                        // Wrapper para compatibilidad con UniversalMetricsFormData
                        // Solo actualizar campos que están en UpdateClientProgressData
                        const validFields: Array<keyof UpdateClientProgressData> = ["peso", "altura", "unidad", "imc", "notas"];
                        if (validFields.includes(field as keyof UpdateClientProgressData)) {
                            const key = field as keyof UpdateClientProgressData;
                            updateField(key, value as UpdateClientProgressData[keyof UpdateClientProgressData]);
                        }
                    }}
                    heightUnit="meters"
                    includeProgressFields={false}
                    includeAnthropometric={false}
                    requiredFields={["peso", "altura"]}
                />

                {/* Mensaje de error general */}
                {(() => {
                    if (error && typeof error === "object") {
                        return (
                            <p className={`${TYPOGRAPHY.errorText} text-center text-red-600`}>
                                Ocurrió un error al guardar los cambios.
                            </p>
                        );
                    }
                    return null;
                })()}


                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className={BUTTON_PRESETS.modalEqual}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        disabled={isLoading}
                        className={BUTTON_PRESETS.modalEqual}
                    >
                        Guardar cambios
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
