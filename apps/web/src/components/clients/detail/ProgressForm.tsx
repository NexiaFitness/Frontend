/**
 * ProgressForm.tsx — Formulario para añadir registros de progreso del cliente.
 *
 * Contexto:
 * - Se renderiza dentro del tab "Progress" de ClientDetail.
 * - Permite al entrenador registrar nuevos datos de métricas físicas.
 * - Usa ClientMetricsFields para reutilizar lógica y validaciones.
 * - Envía los datos al backend vía RTK Query.
 * - Tras crear el registro, refresca los gráficos y métricas del cliente.
 *
 * Campos del backend (POST /api/v1/progress/):
 * - client_id: int (requerido, se inyecta automáticamente)
 * - fecha_registro: date (requerido)
 * - peso: Optional[float] (20-300 kg)
 * - altura: Optional[float] (100-250 cm) - backend recibe en centímetros
 * - unidad: str (default "metric")
 * - imc: Optional[float] (calculado automáticamente por el backend)
 * - notas: Optional[str]
 * 
 * NOTA: La altura se maneja y envía en centímetros (100-250 cm).
 * El backend calcula el IMC automáticamente.
 *
 * @author Frontend Team
 * @since v4.3.0
 * @updated v4.4.0 - Refactor para usar ClientMetricsFields
 * @updated v4.5.0 - Eliminada conversión cm→m y cálculo de IMC (backend lo hace)
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
 * - altura (cm, 100-250)
 * - fecha_registro
 * - unidad (metric/imperial)
 * - notas
 * 
 * El backend calcula automáticamente el IMC.
 * NO incluye campos antropométricos (skinfolds/girths/diameters).
 * 
 * NOTA: La altura se maneja y envía en centímetros (100-250 cm).
 * El backend calcula el IMC automáticamente.
 */
export const ProgressForm: React.FC<ProgressFormProps> = ({ clientId }) => {
    const [formData, setFormData] = useState<Partial<CreateClientProgressData>>({
        fecha_registro: new Date().toISOString().split("T")[0],
        unidad: "metric" as "metric" | "imperial",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<boolean>(false);

    const { createProgressRecord, isLoading, error, isSuccess } = useCreateClientProgress(clientId);
    const { data: client } = useGetClientQuery(clientId);

    // Prellenar altura desde el perfil del cliente (en cm)
    useEffect(() => {
        if (client?.altura) {
            setFormData(prev => {
                // Solo prellenar si no hay altura ya establecida (evitar sobrescribir si el usuario ya editó)
                if (prev.altura === undefined || prev.altura === null) {
                    return {
                        ...prev,
                        altura: client.altura, // Altura en cm
                    };
                }
                return prev;
            });
        }
    }, [client?.altura]);

    const updateField = <K extends keyof Partial<CreateClientProgressData>>(
        field: K,
        value: Partial<CreateClientProgressData>[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field as string]) {
            setErrors(prev => ({ ...prev, [field as string]: "" }));
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

        // Altura es obligatoria
        if (!formData.altura) {
            newErrors.altura = "La altura es requerida";
        } else if (formData.altura < 100 || formData.altura > 250) {
            newErrors.altura = "La altura debe estar entre 100 y 250 cm";
        }

        // Validar fecha de registro
        if (!formData.fecha_registro) {
            newErrors.fecha_registro = "La fecha de medición es requerida";
        } else {
            const fechaRegistro = new Date(formData.fecha_registro);
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999); // Fin del día de hoy
            
            // No permitir fechas futuras
            if (fechaRegistro > hoy) {
                newErrors.fecha_registro = "La fecha de medición no puede ser futura";
            }
            
            // No permitir fechas anteriores a fecha_alta del cliente
            if (client?.fecha_alta) {
                const fechaAlta = new Date(client.fecha_alta);
                fechaAlta.setHours(0, 0, 0, 0);
                if (fechaRegistro < fechaAlta) {
                    newErrors.fecha_registro = `La fecha de medición no puede ser anterior a la fecha de alta del cliente (${new Date(client.fecha_alta).toLocaleDateString()})`;
                }
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // Enviar datos directamente al backend (altura en cm, IMC lo calcula el backend)
            await createProgressRecord({
                fecha_registro: formData.fecha_registro!,
                peso: formData.peso!,
                altura: formData.altura!, // Enviar en cm (100-250)
                unidad: formData.unidad || "metric",
                notas: formData.notas || null,
            });

            setSuccess(true);
            
            setFormData({
                fecha_registro: new Date().toISOString().split("T")[0],
                unidad: "metric" as "metric" | "imperial",
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
                    - Altura (cm) - REQUERIDO (se prellena automáticamente desde perfil si existe)
                    - IMC (calculado por backend, se muestra después de guardar)
                    - Fecha de registro - REQUERIDO (default hoy)
                    - Unidad de medida - REQUERIDO (default "metric")
                    - Notas - OPCIONAL
                    
                    Campos NO mostrados:
                    - Edad (no aceptado por backend de progreso)
                    - Antropometría (skinfolds/girths/diameters) - solo en onboarding
                */}
                <ClientMetricsFields
                    formData={{
                        ...formData,
                        unidad: formData.unidad as "metric" | "imperial" | undefined,
                    }}
                    errors={errors}
                    updateField={(field, value) => {
                        // Wrapper para compatibilidad con UniversalMetricsFormData
                        const key = field as keyof Partial<CreateClientProgressData>;
                        updateField(key, value as Partial<CreateClientProgressData>[keyof Partial<CreateClientProgressData>]);
                    }}
                    heightUnit="cm" // Altura en cm (100-250)
                    includeProgressFields={false}
                    includeAnthropometric={false}
                    requiredFields={["peso", "altura"]}
                />

                {/* Fecha de registro */}
                <div>
                    <label className={TYPOGRAPHY.inputLabel}>
                        Fecha de medición *
                    </label>
                    <input
                        type="date"
                        value={formData.fecha_registro ?? new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                            updateField("fecha_registro", e.target.value);
                            // Validar en tiempo real
                            if (e.target.value) {
                                const fechaRegistro = new Date(e.target.value);
                                const hoy = new Date();
                                hoy.setHours(23, 59, 59, 999);
                                
                                if (fechaRegistro > hoy) {
                                    setErrors(prev => ({
                                        ...prev,
                                        fecha_registro: "La fecha de medición no puede ser futura"
                                    }));
                                } else if (client?.fecha_alta && fechaRegistro < new Date(client.fecha_alta)) {
                                    setErrors(prev => ({
                                        ...prev,
                                        fecha_registro: `La fecha no puede ser anterior a la fecha de alta (${new Date(client.fecha_alta).toLocaleDateString()})`
                                    }));
                                } else {
                                    setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.fecha_registro;
                                        return newErrors;
                                    });
                                }
                            }
                        }}
                        max={new Date().toISOString().split("T")[0]} // No permitir fechas futuras
                        min={client?.fecha_alta ? new Date(client.fecha_alta).toISOString().split("T")[0] : undefined} // No permitir fechas anteriores a fecha_alta
                        className="w-full border rounded-lg p-2 bg-white text-slate-800"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Fecha en que se realizó la medición (no puede ser futura)
                    </p>
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