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
import { inputClass, selectClass, textareaClass, labelClass, errorClass, helperClass, sectionHeadingClass, sectionDividerClass } from "./formFieldStyles";

interface TrainingGoalsProps extends TrainingGoalsStepProps {
    hideHeading?: boolean;
}

export const TrainingGoals: React.FC<TrainingGoalsProps> = ({
    formData,
    errors,
    updateField,
    hideHeading = false,
}) => {
    return (
        <div>
            {/* Sección: Parámetros de Entrenamiento */}
            <div>
                {!hideHeading && (
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className={sectionHeadingClass}>Parámetros de Entrenamiento</h3>
                        <div className={sectionDividerClass} />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Objetivo <span className="text-destructive">*</span></label>
                        <select
                            value={formData.objetivo_entrenamiento || ""}
                            onChange={(e) =>
                                updateField("objetivo_entrenamiento", e.target.value as typeof formData.objetivo_entrenamiento)
                            }
                            className={selectClass}
                        >
                            <option value="">Selecciona un objetivo</option>
                            <option value={TRAINING_GOAL_ENUM.HIPERTROFIA}>Hipertrofia muscular</option>
                            <option value={TRAINING_GOAL_ENUM.FUERZA}>Fuerza máxima</option>
                            <option value={TRAINING_GOAL_ENUM.POTENCIA}>Potencia / explosividad</option>
                            <option value={TRAINING_GOAL_ENUM.RESISTENCIA}>Resistencia cardiovascular</option>
                            <option value={TRAINING_GOAL_ENUM.PERDIDA_PESO}>Pérdida de peso / definición</option>
                            <option value={TRAINING_GOAL_ENUM.REHABILITACION}>Rehabilitación / readaptación</option>
                            <option value={TRAINING_GOAL_ENUM.FITNESS_GENERAL}>Fitness general / salud</option>
                            <option value={TRAINING_GOAL_ENUM.RENDIMIENTO_DEPORTIVO}>Rendimiento deportivo</option>
                        </select>
                        {errors.objetivo_entrenamiento && <p className={errorClass}>{errors.objetivo_entrenamiento}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Fecha de definición del objetivo (opcional)</label>
                        <input
                            type="date"
                            value={formData.fecha_definicion_objetivo || ""}
                            onChange={(e) => updateField("fecha_definicion_objetivo", e.target.value)}
                            className={inputClass}
                            max={new Date().toISOString().split("T")[0]}
                        />
                        {errors.fecha_definicion_objetivo && <p className={errorClass}>{errors.fecha_definicion_objetivo}</p>}
                    </div>
                </div>

                <div className="mt-4">
                    <label className={labelClass}>Descripción detallada de objetivos (opcional)</label>
                    <textarea
                        value={formData.descripcion_objetivos || ""}
                        onChange={(e) => updateField("descripcion_objetivos", e.target.value)}
                        className={textareaClass}
                        placeholder="Describe con más detalle tus objetivos..."
                        rows={4}
                        maxLength={1000}
                    />
                    {formData.descripcion_objetivos && (
                        <p className={helperClass}>{formData.descripcion_objetivos.length}/1000 caracteres</p>
                    )}
                    {errors.descripcion_objetivos && <p className={errorClass}>{errors.descripcion_objetivos}</p>}
                </div>
            </div>
        </div>
    );
};


