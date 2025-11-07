/**
 * ProgressForm.tsx — Formulario para añadir registros de progreso del cliente.
 *
 * Contexto:
 * - Se renderiza dentro del tab "Progress" de ClientDetail.
 * - Permite al entrenador registrar nuevos datos de métricas físicas.
 * - Usa ClientMetricsFields para reutilizar lógica y validaciones.
 * - Calcula el IMC automáticamente y envía los datos al backend vía RTK Query.
 * - Tras crear el registro, refresca los gráficos y métricas del cliente.
 *
 * Campos del backend (POST /api/v1/progress/):
 * - client_id: int (requerido, se inyecta automáticamente)
 * - fecha_registro: date (requerido)
 * - peso: Optional[float] (20-300 kg)
 * - altura: Optional[float] (0.5-3.0 metros) - se convierte de cm a m al enviar
 * - unidad: str (default "metric")
 * - imc: Optional[float] (calculado automáticamente, NO se envía)
 * - notas: Optional[str]
 * 
 * NOTA: La altura se maneja en cm en el estado (más intuitivo para el usuario),
 * pero se convierte a metros antes de enviar al backend.
 *
 * @author Frontend Team
 * @since v4.3.0
 * @updated v4.4.0 - Refactor para usar ClientMetricsFields
 */

import React, { useState, useEffect } from "react";
import { useCreateClientProgress } from "@nexia/shared/hooks/clients/useCreateClientProgress";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import type { CreateClientProgressData } from "@nexia/shared/types/progress";
import { ClientMetricsFields } from "@/components/clients/metrics/ClientMetricsFields";
import { TYPOGRAPHY } from "@/utils/typography";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";

interface ProgressFormProps {
    clientId: number;
}

/**
 * Formulario para añadir un nuevo registro de progreso de un cliente.
 * Solo incluye campos soportados por el backend:
 * - peso (kg)
 * - altura (cm en UI, se convierte a metros al enviar)
 * - fecha_registro
 * - unidad (metric/imperial)
 * - notas
 * 
 * El backend calcula automáticamente el IMC.
 * NO incluye campos antropométricos (skinfolds/girths/diameters).
 * 
 * NOTA: La altura se maneja en cm en el estado (más intuitivo para el usuario),
 * pero se convierte a metros antes de enviar al backend (que espera 0.5-3.0 m).
 */
export const ProgressForm: React.FC<ProgressFormProps> = ({ clientId }) => {
    const [formData, setFormData] = useState<Partial<CreateClientProgressData>>({
        fecha_registro: new Date().toISOString().split("T")[0],
        unidad: "metric",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<boolean>(false);

    const { createProgressRecord, isLoading, error, isSuccess } = useCreateClientProgress(clientId);
    const { data: client } = useGetClientQuery(clientId);

    // Prellenar altura desde el perfil del cliente (mantener en cm para UI, convertir a metros al enviar)
    useEffect(() => {
        if (client?.altura) {
            // Altura del cliente está en cm, mantener en cm en el estado (más intuitivo para el usuario)
            // La conversión a metros se hará solo al enviar al backend
            setFormData(prev => {
                // Solo prellenar si no hay altura ya establecida (evitar sobrescribir si el usuario ya editó)
                if (prev.altura === undefined || prev.altura === null) {
                    return {
                        ...prev,
                        altura: client.altura, // Mantener en cm
                    };
                }
                return prev;
            });
        }
    }, [client?.altura]);

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);

        const newErrors: Record<string, string> = {};

        if (!formData.peso) {
            newErrors.peso = "El peso es requerido";
        } else if (formData.peso < 20 || formData.peso > 300) {
            newErrors.peso = "El peso debe estar entre 20 y 300 kg";
        }

        // Altura es obligatoria para calcular IMC
        if (!formData.altura) {
            newErrors.altura = "La altura es requerida para calcular el IMC";
        } else if (formData.altura < 100 || formData.altura > 250) {
            newErrors.altura = "La altura debe estar entre 100 y 250 cm";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // Convertir altura de cm a metros antes de enviar al backend
            const alturaEnMetros = formData.altura !== undefined && formData.altura !== null
                ? formData.altura / 100 // Convertir cm → m
                : null;

            await createProgressRecord({
                fecha_registro: formData.fecha_registro!,
                peso: formData.peso!,
                altura: alturaEnMetros, // Enviar en metros (backend espera 0.5-3.0 m)
                unidad: formData.unidad || "metric",
                notas: formData.notas || null,
            });

            setSuccess(true);
            
            setFormData({
                fecha_registro: new Date().toISOString().split("T")[0],
                unidad: "metric",
            });
            setErrors({});
        } catch (err) {
            console.error("Error al crear registro de progreso:", err);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-6`}>
                Añadir nuevo registro de progreso
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 
                    ClientMetricsFields configurado para POST /api/v1/progress/
                    
                    Campos mostrados:
                    - Peso (kg) - REQUERIDO
                    - Altura (cm) - OPCIONAL (se prellena automáticamente desde perfil si existe, se convierte a metros al enviar)
                    - IMC (calculado en frontend, se envía pero backend lo recalcula)
                    - Fecha de registro - REQUERIDO (default hoy)
                    - Unidad de medida - REQUERIDO (default "metric")
                    - Notas - OPCIONAL
                    
                    Campos NO mostrados:
                    - Edad (no aceptado por backend de progreso)
                    - Antropometría (skinfolds/girths/diameters) - solo en onboarding
                */}
                <ClientMetricsFields
                    formData={formData}
                    errors={errors}
                    updateField={updateField}
                    heightUnit="cm" // Mostrar en cm (más intuitivo), convertir a metros al enviar
                    includeProgressFields={false}
                    includeAnthropometric={false}
                    requiredFields={["peso", "altura"]}
                />

                {/* Fecha de registro */}
                <div>
                    <label className={TYPOGRAPHY.inputLabel}>
                        Fecha de registro *
                    </label>
                    <input
                        type="date"
                        value={formData.fecha_registro ?? new Date().toISOString().split("T")[0]}
                        onChange={(e) => updateField("fecha_registro", e.target.value)}
                        className="w-full border rounded-lg p-2 bg-white text-slate-800"
                        required
                    />
                    {errors.fecha_registro && (
                        <p className="text-red-600 text-sm mt-1">{errors.fecha_registro}</p>
                    )}
                </div>

                {/* Notas */}
                <div>
                    <label className={TYPOGRAPHY.inputLabel}>
                        Notas (opcional)
                    </label>
                    <textarea
                        value={formData.notas ?? ""}
                        onChange={(e) => updateField("notas", e.target.value || null)}
                        rows={3}
                        className="w-full border rounded-lg p-2 bg-white text-slate-800 resize-none"
                        placeholder="Observaciones sobre este registro..."
                    />
                    {errors.notas && (
                        <p className="text-red-600 text-sm mt-1">{errors.notas}</p>
                    )}
                </div>

                {isLoading && (
                    <div className="flex justify-center py-2">
                        <LoadingSpinner size="md" />
                    </div>
                )}

                {!!error && (
                    <Alert variant="error">
                        Error al guardar el registro. Por favor, inténtalo de nuevo.
                    </Alert>
                )}

                {(success || isSuccess) && (
                    <Alert variant="success">
                        Registro creado correctamente. Los gráficos se actualizarán en breve.
                    </Alert>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Guardando..." : "Guardar registro"}
                    </button>
                </div>
            </form>
        </div>
    );
};