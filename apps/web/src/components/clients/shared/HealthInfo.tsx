/**
 * HealthInfo.tsx — Paso del wizard de Onboarding: Información de salud
 *
 * Contexto:
 * - Step 5 del wizard de alta de clientes.
 * - Captura: lesiones relevantes y observaciones generales.
 * - Todos los campos son opcionales.
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v2.4.1 - Props renombradas (data→formData, onChange→updateField)
 */

import React from "react";
import type { HealthInfoStepProps } from "@nexia/shared/types/clientOnboarding";
import { textareaClass, labelClass, errorClass, sectionHeadingClass, sectionDividerClass } from "./formFieldStyles";

export const HealthInfo: React.FC<HealthInfoStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div>
            {/* Sección: Notas */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h3 className={sectionHeadingClass}>Notas</h3>
                    <div className={sectionDividerClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Nota #1</label>
                        <textarea
                            value={formData.lesiones_relevantes || ""}
                            onChange={(e) => updateField("lesiones_relevantes", e.target.value)}
                            className={textareaClass + " min-h-[120px]"}
                            placeholder="Añade notas aquí..."
                        />
                        {errors.lesiones_relevantes && <p className={errorClass}>{errors.lesiones_relevantes}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Nota #2</label>
                        <textarea
                            value={formData.observaciones || ""}
                            onChange={(e) => updateField("observaciones", e.target.value)}
                            className={textareaClass + " min-h-[120px]"}
                            placeholder="Añade notas aquí..."
                        />
                        {errors.observaciones && <p className={errorClass}>{errors.observaciones}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Nota #3</label>
                        <textarea
                            value={formData.notes_1 || ""}
                            onChange={(e) => updateField("notes_1", e.target.value)}
                            className={textareaClass + " min-h-[120px]"}
                            placeholder="Añade notas aquí..."
                        />
                        {errors.notes_1 && <p className={errorClass}>{errors.notes_1}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};


