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

export const TrainingGoals: React.FC<TrainingGoalsStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div>
            {/* Sección: Parámetros de Entrenamiento */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Parámetros de Entrenamiento</h3>
                    <div className="flex-1 h-0.5 bg-gray-900"></div>
                </div>
                
                {/* Objetivo y Fecha en dos columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Objetivo principal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Objetivo <span className="text-white">*</span></label>
                        <select
                            value={formData.objetivo_entrenamiento || ""}
                            onChange={(e) =>
                                updateField("objetivo_entrenamiento", e.target.value as typeof formData.objetivo_entrenamiento)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Selecciona un objetivo</option>
                            <option value={TRAINING_GOAL_ENUM.PERDIDA_PESO}>Pérdida de peso</option>
                            <option value={TRAINING_GOAL_ENUM.AUMENTAR_MASA}>Ganancia muscular</option>
                            <option value={TRAINING_GOAL_ENUM.RENDIMIENTO}>Rendimiento deportivo</option>
                        </select>
                        {errors.objetivo_entrenamiento && (
                            <p className="text-red-600 text-sm mt-1">{errors.objetivo_entrenamiento}</p>
                        )}
                    </div>

                    {/* Fecha de definición del objetivo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de definición del objetivo (opcional)</label>
                        <input
                            type="date"
                            value={formData.fecha_definicion_objetivo || ""}
                            onChange={(e) => updateField("fecha_definicion_objetivo", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            max={new Date().toISOString().split('T')[0]}
                        />
                        {errors.fecha_definicion_objetivo && (
                            <p className="text-red-600 text-sm mt-1">{errors.fecha_definicion_objetivo}</p>
                        )}
                    </div>
                </div>

                {/* Descripción detallada de objetivos (ancho completo) */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción detallada de objetivos (opcional)</label>
                    <textarea
                        value={formData.descripcion_objetivos || ""}
                        onChange={(e) => updateField("descripcion_objetivos", e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Describe con más detalle tus objetivos..."
                        rows={4}
                        maxLength={1000}
                    />
                    {formData.descripcion_objetivos && (
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.descripcion_objetivos.length}/1000 caracteres
                        </p>
                    )}
                    {errors.descripcion_objetivos && (
                        <p className="text-red-600 text-sm mt-1">{errors.descripcion_objetivos}</p>
                    )}
                </div>
            </div>
        </div>
    );
};


