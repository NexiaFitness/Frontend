/**
 * TrainingGoals.tsx — Paso del wizard de Onboarding: Objetivos
 *
 * Contexto:
 * - Step 3 del wizard de alta de clientes.
 * - Captura: objetivo principal de entrenamiento.
 * - Opciones: weight_loss, muscle_gain, performance, health.
 * - Campo obligatorio: objetivo_entrenamiento.
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v2.4.1 - Props renombradas (data→formData, onChange→updateField)
 */

import React from "react";
import type { TrainingGoalsStepProps } from "@nexia/shared/types/clientOnboarding";
import { TRAINING_GOAL_ENUM } from "@nexia/shared";
import { TYPOGRAPHY } from "@/utils/typography";

export const TrainingGoals: React.FC<TrainingGoalsStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div className="space-y-6">
            {/* Objetivo principal y Fecha en dos columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna 1: Objetivo principal */}
                <div>
                    <label className={TYPOGRAPHY.inputLabel}>Objetivo principal *</label>
                    <select
                        value={formData.objetivo_entrenamiento || ""}
                        onChange={(e) =>
                            updateField("objetivo_entrenamiento", e.target.value as typeof formData.objetivo_entrenamiento)
                        }
                        className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    >
                        <option value="">Selecciona un objetivo</option>
                        <option value={TRAINING_GOAL_ENUM.PERDIDA_PESO}>Pérdida de peso</option>
                        <option value={TRAINING_GOAL_ENUM.AUMENTAR_MASA}>Ganancia muscular</option>
                        <option value={TRAINING_GOAL_ENUM.RENDIMIENTO}>Rendimiento deportivo</option>
                    </select>
                    {errors.objetivo_entrenamiento && (
                        <p className="text-red-600 text-sm">{errors.objetivo_entrenamiento}</p>
                    )}
                </div>

                {/* Columna 2: Fecha de definición del objetivo */}
                <div>
                    <label className={TYPOGRAPHY.inputLabel}>Fecha de definición del objetivo (opcional)</label>
                    <input
                        type="date"
                        value={formData.fecha_definicion_objetivo || ""}
                        onChange={(e) => updateField("fecha_definicion_objetivo", e.target.value)}
                        className="w-full border rounded-lg p-2 bg-white text-slate-800"
                        max={new Date().toISOString().split('T')[0]}
                    />
                    {errors.fecha_definicion_objetivo && (
                        <p className="text-red-600 text-sm">{errors.fecha_definicion_objetivo}</p>
                    )}
                </div>
            </div>

            {/* Descripción detallada de objetivos (ancho completo) */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Descripción detallada de objetivos (opcional)</label>
                <textarea
                    value={formData.descripcion_objetivos || ""}
                    onChange={(e) => updateField("descripcion_objetivos", e.target.value)}
                    className="w-full border rounded-lg p-3 bg-white text-slate-800 min-h-[100px]"
                    placeholder="Describe con más detalle tus objetivos..."
                    rows={4}
                    maxLength={1000}
                />
                {formData.descripcion_objetivos && (
                    <p className="text-xs text-slate-500 mt-1">
                        {formData.descripcion_objetivos.length}/1000 caracteres
                    </p>
                )}
                {errors.descripcion_objetivos && (
                    <p className="text-red-600 text-sm">{errors.descripcion_objetivos}</p>
                )}
            </div>
        </div>
    );
};


