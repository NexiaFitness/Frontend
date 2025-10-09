/**
 * TrainingGoals.tsx — Paso del wizard de Onboarding: Objetivos
 *
 * Contexto:
 * - Step 3 del wizard de alta de clientes.
 * - Captura: objetivo principal de entrenamiento.
 * - Opciones: weight_loss, muscle_gain, performance, health.
 * - Campo obligatorio: objetivo.
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v2.4.1 - Props renombradas (data→formData, onChange→updateField)
 */

import React from "react";
import type { TrainingGoalsStepProps } from "@nexia/shared/types/clientOnboarding";
import { CLIENT_GOALS } from "@nexia/shared";
import { TYPOGRAPHY } from "@/utils/typography";

export const TrainingGoals: React.FC<TrainingGoalsStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div className="space-y-6">
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Objetivo principal *</label>
                <select
                    value={formData.objetivo || ""}
                    onChange={(e) =>
                        updateField("objetivo", e.target.value as typeof formData.objetivo)
                    }
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                >
                    <option value="">Selecciona un objetivo</option>
                    <option value={CLIENT_GOALS.WEIGHT_LOSS}>Pérdida de peso</option>
                    <option value={CLIENT_GOALS.MUSCLE_GAIN}>Ganancia muscular</option>
                    <option value={CLIENT_GOALS.PERFORMANCE}>Rendimiento deportivo</option>
                    <option value={CLIENT_GOALS.HEALTH}>Salud general</option>
                </select>
                {errors.objetivo && (
                    <p className="text-red-600 text-sm">{errors.objetivo}</p>
                )}
            </div>
        </div>
    );
};