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
import { SegmentButton } from "@/components/ui/buttons";
import { labelClass, errorClass, helperClass } from "./formFieldStyles";

export const Experience: React.FC<ExperienceStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div className="space-y-8">
            {/* Nivel de experiencia con botones segmentados */}
            <div>
                <label className={labelClass}>Nivel de Experiencia <span className="text-destructive">*</span></label>
                <div className="flex gap-2 mt-2">
                    <SegmentButton
                        selected={formData.experiencia === EXPERIENCE_ENUM.BAJA}
                        onClick={() => updateField("experiencia", EXPERIENCE_ENUM.BAJA)}
                        size="md"
                    >
                        Baja
                    </SegmentButton>
                    <SegmentButton
                        selected={formData.experiencia === EXPERIENCE_ENUM.MEDIA}
                        onClick={() => updateField("experiencia", EXPERIENCE_ENUM.MEDIA)}
                        size="md"
                    >
                        Media
                    </SegmentButton>
                    <SegmentButton
                        selected={formData.experiencia === EXPERIENCE_ENUM.ALTA}
                        onClick={() => updateField("experiencia", EXPERIENCE_ENUM.ALTA)}
                        size="md"
                    >
                        Alta
                    </SegmentButton>
                </div>
                {errors.experiencia && <p className={errorClass}>{errors.experiencia}</p>}
            </div>

            {/* Frecuencia de entrenamiento con botones segmentados */}
            <div>
                <label className={labelClass}>Frecuencia de Entrenamiento (Sesiones/semana)</label>
                <div className="flex gap-2 mt-2">
                    <SegmentButton
                        selected={formData.frecuencia_semanal === WEEKLY_FREQUENCY_ENUM.BAJA}
                        onClick={() => updateField("frecuencia_semanal", WEEKLY_FREQUENCY_ENUM.BAJA)}
                        size="md"
                    >
                        Baja (1-2)
                    </SegmentButton>
                    <SegmentButton
                        selected={formData.frecuencia_semanal === WEEKLY_FREQUENCY_ENUM.MEDIA}
                        onClick={() => updateField("frecuencia_semanal", WEEKLY_FREQUENCY_ENUM.MEDIA)}
                        size="md"
                    >
                        Media (3-5)
                    </SegmentButton>
                    <SegmentButton
                        selected={formData.frecuencia_semanal === WEEKLY_FREQUENCY_ENUM.ALTA}
                        onClick={() => updateField("frecuencia_semanal", WEEKLY_FREQUENCY_ENUM.ALTA)}
                        size="md"
                    >
                        Alta (6-7)
                    </SegmentButton>
                </div>
                {errors.frecuencia_semanal && <p className={errorClass}>{errors.frecuencia_semanal}</p>}
            </div>

            {/* Duración de sesión con botones segmentados */}
            <div>
                <label className={labelClass}>Duración de Sesiones</label>
                <div className="flex gap-2 mt-2">
                    <SegmentButton
                        selected={formData.session_duration === SESSION_DURATION_ENUM.SHORT_LT_1H}
                        onClick={() => updateField("session_duration", SESSION_DURATION_ENUM.SHORT_LT_1H)}
                        size="md"
                    >
                        Corta (&lt;1h)
                    </SegmentButton>
                    <SegmentButton
                        selected={formData.session_duration === SESSION_DURATION_ENUM.MEDIUM_1H_TO_1H30}
                        onClick={() => updateField("session_duration", SESSION_DURATION_ENUM.MEDIUM_1H_TO_1H30)}
                        size="md"
                    >
                        Media (1h-1h30&apos;)
                    </SegmentButton>
                    <SegmentButton
                        selected={formData.session_duration === SESSION_DURATION_ENUM.LONG_GT_1H30}
                        onClick={() => updateField("session_duration", SESSION_DURATION_ENUM.LONG_GT_1H30)}
                        size="md"
                    >
                        Larga (&gt;1h30&apos;)
                    </SegmentButton>
                </div>
                {errors.session_duration && <p className={errorClass}>{errors.session_duration}</p>}
            </div>

            {/* Días/semana exactos (1-7) — alineado con backend exact_training_frequency */}
            <div>
                <label className={labelClass}>Días de entrenamiento por semana</label>
                <p className={helperClass + " mb-2"}>Número exacto de sesiones por semana (1-7)</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <SegmentButton
                            key={n}
                            selected={formData.exact_training_frequency === n}
                            onClick={() => updateField("exact_training_frequency", n)}
                            size="sm"
                        >
                            {n}
                        </SegmentButton>
                    ))}
                </div>
                {errors.exact_training_frequency && <p className={errorClass}>{errors.exact_training_frequency}</p>}
            </div>

            {/* Días concretos de la semana (L-D) — alineado con backend training_days */}
            <div>
                <label className={labelClass}>Días concretos de entrenamiento</label>
                <p className={helperClass + " mb-2"}>Opcional: marcar los días en que entrena (L=Lunes … D=Domingo)</p>
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
                            <SegmentButton
                                key={day}
                                selected={isSelected}
                                onClick={toggle}
                                size="sm"
                            >
                                {TRAINING_DAY_LABELS[day as TrainingDayValue]}
                            </SegmentButton>
                        );
                    })}
                </div>
                {errors.training_days && <p className={errorClass}>{errors.training_days}</p>}
            </div>
        </div>
    );
};


