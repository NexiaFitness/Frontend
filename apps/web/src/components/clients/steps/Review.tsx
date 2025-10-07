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
import type { ReviewStepProps } from "@shared/types/clientOnboarding";
import { TYPOGRAPHY } from "@/utils/typography";

export const Review: React.FC<ReviewStepProps> = ({ formData }) => {
    // Helper para mostrar valores opcionales
    const display = (value: string | number | undefined | null) => value || "—";

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
                        <span className="font-medium">Email:</span> {formData.email}
                    </p>
                    <p>
                        <span className="font-medium">Teléfono:</span>{" "}
                        {display(formData.telefono)}
                    </p>
                    <p>
                        <span className="font-medium">Sexo:</span> {display(formData.sexo)}
                    </p>
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
                        {display(formData.objetivo)}
                    </p>
                </div>
            </div>

            {/* Experiencia y frecuencia */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Experiencia y frecuencia</h3>
                <div className="space-y-2 text-slate-700">
                    <p>
                        <span className="font-medium">Nivel de experiencia:</span>{" "}
                        {display(formData.nivel_experiencia)}
                    </p>
                    <p>
                        <span className="font-medium">Frecuencia semanal:</span>{" "}
                        {display(formData.frecuencia_semanal)}
                    </p>
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