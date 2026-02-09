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
import {
    EXPERIENCE_ENUM,
    WEEKLY_FREQUENCY_ENUM,
    SESSION_DURATION_ENUM,
    TRAINING_DAY_VALUES,
    TRAINING_DAY_LABELS,
    type TrainingDayValue,
} from "@nexia/shared";

export const Experience: React.FC<ExperienceStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div className="space-y-8">
            {/* Nivel de experiencia con botones segmentados */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nivel de Experiencia <span className="text-white">*</span></label>
                <div className="flex gap-2 mt-2">
                    <button
                        type="button"
                        onClick={() => updateField("experiencia", EXPERIENCE_ENUM.BAJA)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                            formData.experiencia === EXPERIENCE_ENUM.BAJA
                                ? "bg-primary-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Baja
                    </button>
                    <button
                        type="button"
                        onClick={() => updateField("experiencia", EXPERIENCE_ENUM.MEDIA)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                            formData.experiencia === EXPERIENCE_ENUM.MEDIA
                                ? "bg-primary-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Media
                    </button>
                    <button
                        type="button"
                        onClick={() => updateField("experiencia", EXPERIENCE_ENUM.ALTA)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                            formData.experiencia === EXPERIENCE_ENUM.ALTA
                                ? "bg-primary-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Alta
                    </button>
                </div>
                {errors.experiencia && (
                    <p className="text-red-600 text-sm mt-1">{errors.experiencia}</p>
                )}
            </div>

            {/* Frecuencia de entrenamiento con botones segmentados */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Frecuencia de Entrenamiento (Sesiones/semana)</label>
                <div className="flex gap-2 mt-2">
                    <button
                        type="button"
                        onClick={() => updateField("frecuencia_semanal", WEEKLY_FREQUENCY_ENUM.BAJA)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                            formData.frecuencia_semanal === WEEKLY_FREQUENCY_ENUM.BAJA
                                ? "bg-primary-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Baja (1-2)
                    </button>
                    <button
                        type="button"
                        onClick={() => updateField("frecuencia_semanal", WEEKLY_FREQUENCY_ENUM.MEDIA)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                            formData.frecuencia_semanal === WEEKLY_FREQUENCY_ENUM.MEDIA
                                ? "bg-primary-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Media (3-5)
                    </button>
                    <button
                        type="button"
                        onClick={() => updateField("frecuencia_semanal", WEEKLY_FREQUENCY_ENUM.ALTA)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                            formData.frecuencia_semanal === WEEKLY_FREQUENCY_ENUM.ALTA
                                ? "bg-primary-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Alta (6-7)
                    </button>
                </div>
                {errors.frecuencia_semanal && (
                    <p className="text-red-600 text-sm mt-1">{errors.frecuencia_semanal}</p>
                )}
            </div>

            {/* Duración de sesión con botones segmentados */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duración de Sesiones</label>
                <div className="flex gap-2 mt-2">
                    <button
                        type="button"
                        onClick={() => updateField("session_duration", SESSION_DURATION_ENUM.SHORT_LT_1H)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                            formData.session_duration === SESSION_DURATION_ENUM.SHORT_LT_1H
                                ? "bg-primary-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Corta (&lt;1h)
                    </button>
                    <button
                        type="button"
                        onClick={() => updateField("session_duration", SESSION_DURATION_ENUM.MEDIUM_1H_TO_1H30)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                            formData.session_duration === SESSION_DURATION_ENUM.MEDIUM_1H_TO_1H30
                                ? "bg-primary-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Media (1h-1h30&apos;)
                    </button>
                    <button
                        type="button"
                        onClick={() => updateField("session_duration", SESSION_DURATION_ENUM.LONG_GT_1H30)}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                            formData.session_duration === SESSION_DURATION_ENUM.LONG_GT_1H30
                                ? "bg-primary-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        Larga (&gt;1h30&apos;)
                    </button>
                </div>
                {errors.session_duration && (
                    <p className="text-red-600 text-sm mt-1">{errors.session_duration}</p>
                )}
            </div>

            {/* Días/semana exactos (1-7) — alineado con backend exact_training_frequency */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Días de entrenamiento por semana
                </label>
                <p className="text-xs text-gray-500 mb-2">
                    Número exacto de sesiones por semana (1-7)
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => updateField("exact_training_frequency", n)}
                            className={`min-w-[2.5rem] px-3 py-2 rounded-lg font-medium transition-colors ${
                                formData.exact_training_frequency === n
                                    ? "bg-primary-600 text-white"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
                {errors.exact_training_frequency && (
                    <p className="text-red-600 text-sm mt-1">{errors.exact_training_frequency}</p>
                )}
            </div>

            {/* Días concretos de la semana (L-D) — alineado con backend training_days */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Días concretos de entrenamiento
                </label>
                <p className="text-xs text-gray-500 mb-2">
                    Opcional: marcar los días en que entrena (L=Lunes … D=Domingo)
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {TRAINING_DAY_VALUES.map((day) => {
                        const current = formData.training_days ?? [];
                        const isSelected = current.includes(day);
                        const toggle = () => {
                            if (isSelected) {
                                updateField(
                                    "training_days",
                                    current.filter((d) => d !== day)
                                );
                            } else {
                                updateField("training_days", [...current, day]);
                            }
                        };
                        return (
                            <button
                                key={day}
                                type="button"
                                onClick={toggle}
                                className={`min-w-[2.5rem] px-3 py-2 rounded-lg font-medium transition-colors ${
                                    isSelected
                                        ? "bg-primary-600 text-white"
                                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {TRAINING_DAY_LABELS[day as TrainingDayValue]}
                            </button>
                        );
                    })}
                </div>
                {errors.training_days && (
                    <p className="text-red-600 text-sm mt-1">{errors.training_days}</p>
                )}
            </div>
        </div>
    );
};


