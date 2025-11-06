/**
 * Experience.tsx — Paso del wizard de Onboarding: Experiencia y Frecuencia
 *
 * Contexto:
 * - Step 4 del wizard de alta de clientes.
 * - Captura: nivel de experiencia y frecuencia semanal de entrenamiento.
 * - Campo obligatorio: experiencia.
 * - Campo opcional: frecuencia_semanal.
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v2.4.1 - Props renombradas (data→formData, onChange→updateField)
 */

import React from "react";
import type { ExperienceStepProps } from "@nexia/shared/types/clientOnboarding";
import { EXPERIENCE_ENUM, WEEKLY_FREQUENCY_ENUM, SESSION_DURATION_ENUM } from "@nexia/shared";
import { TYPOGRAPHY } from "@/utils/typography";

export const Experience: React.FC<ExperienceStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div className="space-y-6">
            {/* Nivel de experiencia */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Nivel de experiencia *</label>
                <select
                    value={formData.experiencia || ""}
                    onChange={(e) =>
                        updateField(
                            "experiencia",
                            e.target.value as typeof formData.experiencia
                        )
                    }
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                >
                    <option value="">Selecciona una opción</option>
                    <option value={EXPERIENCE_ENUM.BAJA}>Principiante (Baja)</option>
                    <option value={EXPERIENCE_ENUM.MEDIA}>Intermedio (Media)</option>
                    <option value={EXPERIENCE_ENUM.ALTA}>Avanzado (Alta)</option>
                </select>
                {errors.experiencia && (
                    <p className="text-red-600 text-sm">{errors.experiencia}</p>
                )}
            </div>

            {/* Frecuencia semanal */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Frecuencia semanal</label>
                <select
                    value={formData.frecuencia_semanal || ""}
                    onChange={(e) => updateField("frecuencia_semanal", e.target.value as typeof formData.frecuencia_semanal)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                >
                    <option value="">Selecciona una opción</option>
                    <option value={WEEKLY_FREQUENCY_ENUM.BAJA}>1-2 veces por semana</option>
                    <option value={WEEKLY_FREQUENCY_ENUM.MEDIA}>3-5 veces por semana</option>
                    <option value={WEEKLY_FREQUENCY_ENUM.ALTA}>6-7 veces por semana</option>
                </select>
                {errors.frecuencia_semanal && (
                    <p className="text-red-600 text-sm">{errors.frecuencia_semanal}</p>
                )}
            </div>

            {/* Duración típica de sesión */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Duración típica de sesión (opcional)</label>
                <select
                    value={formData.session_duration || ""}
                    onChange={(e) => updateField("session_duration", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                >
                    <option value="">Selecciona una opción</option>
                    <option value={SESSION_DURATION_ENUM.SHORT_LT_1H}>30-45 minutos</option>
                    <option value={SESSION_DURATION_ENUM.MEDIUM_1H_TO_1H30}>60 minutos</option>
                    <option value={SESSION_DURATION_ENUM.LONG_GT_1H30}>90+ minutos</option>
                </select>
                {errors.session_duration && (
                    <p className="text-red-600 text-sm">{errors.session_duration}</p>
                )}
            </div>
        </div>
    );
};