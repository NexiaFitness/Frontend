/**
 * Experience.tsx — Paso del wizard de Onboarding: Experiencia y Frecuencia
 *
 * Contexto:
 * - Step 4 del wizard de alta de clientes.
 * - Captura: nivel de experiencia y frecuencia semanal de entrenamiento.
 * - Campo obligatorio: nivel_experiencia.
 * - Campo opcional: frecuencia_semanal.
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v2.4.1 - Props renombradas (data→formData, onChange→updateField)
 */

import React from "react";
import type { ExperienceStepProps } from "@shared/types/clientOnboarding";
import { CLIENT_EXPERIENCE_LEVELS } from "@shared/types/client";
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
                    value={formData.nivel_experiencia || ""}
                    onChange={(e) =>
                        updateField(
                            "nivel_experiencia",
                            e.target.value as typeof formData.nivel_experiencia
                        )
                    }
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                >
                    <option value="">Selecciona una opción</option>
                    <option value={CLIENT_EXPERIENCE_LEVELS.BEGINNER}>Principiante</option>
                    <option value={CLIENT_EXPERIENCE_LEVELS.INTERMEDIATE}>Intermedio</option>
                    <option value={CLIENT_EXPERIENCE_LEVELS.ADVANCED}>Avanzado</option>
                </select>
                {errors.nivel_experiencia && (
                    <p className="text-red-600 text-sm">{errors.nivel_experiencia}</p>
                )}
            </div>

            {/* Frecuencia semanal */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Frecuencia semanal</label>
                <select
                    value={formData.frecuencia_semanal || ""}
                    onChange={(e) => updateField("frecuencia_semanal", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                >
                    <option value="">Selecciona una opción</option>
                    <option value="baja">1-2 veces por semana</option>
                    <option value="media">3-5 veces por semana</option>
                    <option value="alta">6-7 veces por semana</option>
                </select>
                {errors.frecuencia_semanal && (
                    <p className="text-red-600 text-sm">{errors.frecuencia_semanal}</p>
                )}
            </div>
        </div>
    );
};