/**
 * Review.tsx — Paso final del wizard de Onboarding
 *
 * Contexto:
 * - Step 6 (final) del wizard de alta de clientes.
 * - Muestra resumen completo de todos los datos capturados.
 * - Readonly (no permite edición, solo visualización).
 * - Usuario debe volver atrás si quiere modificar algo.
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v2.4.1 - Props renombradas (data→formData)
 */

import React from "react";
import type { ReviewStepProps } from "@nexia/shared/types/clientOnboarding";
import { TYPOGRAPHY } from "@/utils/typography";

export const Review: React.FC<ReviewStepProps> = ({ formData }) => {
    // Helper para mostrar valores opcionales
    const display = (value: string | number | undefined | null) => value || "—";

    // Helper para formatear fechas
    const formatDate = (dateStr: string | undefined | null) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    // Helper para formatear session_duration
    const formatSessionDuration = (duration: string | undefined | null) => {
        if (!duration) return "—";
        const durationMap: Record<string, string> = {
            short_lt_1h: "30-45 minutos",
            medium_1h_to_1h30: "60 minutos",
            long_gt_1h30: "90+ minutos",
        };
        return durationMap[duration] || duration;
    };

    return (
        <div className="space-y-6">
            <h2 className={`${TYPOGRAPHY.sectionTitle} text-slate-800 mb-6`}>
                Revisión de datos
            </h2>

            {/* Datos personales */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Datos personales</h3>
                <div className="space-y-2 text-slate-700">
                    <p>
                        <span className="font-medium">Nombre completo:</span>{" "}
                        {formData.nombre} {formData.apellidos}
                    </p>
                    <p>
                        <span className="font-medium">Email:</span> {formData.mail}
                    </p>
                    <p>
                        <span className="font-medium">Teléfono:</span>{" "}
                        {display(formData.telefono)}
                    </p>
                    <p>
                        <span className="font-medium">Sexo:</span> {display(formData.sexo)}
                    </p>
                    {formData.id_passport && (
                        <p>
                            <span className="font-medium">DNI/Pasaporte:</span>{" "}
                            {formData.id_passport}
                        </p>
                    )}
                    {formData.birthdate && (
                        <p>
                            <span className="font-medium">Fecha de nacimiento:</span>{" "}
                            {formatDate(formData.birthdate)}
                        </p>
                    )}
                </div>
            </div>

            {/* Métricas físicas */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Métricas físicas</h3>
                <div className="space-y-2 text-slate-700">
                    <p>
                        <span className="font-medium">Edad:</span> {display(formData.edad)} años
                    </p>
                    <p>
                        <span className="font-medium">Peso:</span> {display(formData.peso)} kg
                    </p>
                    <p>
                        <span className="font-medium">Altura:</span> {display(formData.altura)}{" "}
                        cm
                    </p>
                </div>
            </div>

            {/* Objetivo de entrenamiento */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Objetivo de entrenamiento</h3>
                <div className="space-y-2 text-slate-700">
                    <p>
                        <span className="font-medium">Objetivo principal:</span>{" "}
                        {display(formData.objetivo_entrenamiento)}
                    </p>
                    {formData.fecha_definicion_objetivo && (
                        <p>
                            <span className="font-medium">Fecha de definición:</span>{" "}
                            {formatDate(formData.fecha_definicion_objetivo)}
                        </p>
                    )}
                    {formData.descripcion_objetivos && (
                        <div>
                            <span className="font-medium">Descripción detallada:</span>
                            <p className="mt-1 text-slate-600 whitespace-pre-wrap">
                                {formData.descripcion_objetivos}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Experiencia y frecuencia */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Experiencia y frecuencia</h3>
                <div className="space-y-2 text-slate-700">
                    <p>
                        <span className="font-medium">Nivel de experiencia:</span>{" "}
                        {display(formData.experiencia)}
                    </p>
                    <p>
                        <span className="font-medium">Frecuencia semanal:</span>{" "}
                        {display(formData.frecuencia_semanal)}
                    </p>
                    {formData.session_duration && (
                        <p>
                            <span className="font-medium">Duración típica de sesión:</span>{" "}
                            {formatSessionDuration(formData.session_duration)}
                        </p>
                    )}
                </div>
            </div>

            {/* Información de salud */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Información de salud</h3>
                <div className="space-y-2 text-slate-700">
                    <p>
                        <span className="font-medium">Lesiones relevantes:</span>{" "}
                        {display(formData.lesiones_relevantes)}
                    </p>
                    <p>
                        <span className="font-medium">Observaciones:</span>{" "}
                        {display(formData.observaciones)}
                    </p>
                </div>
            </div>
        </div>
    );
};