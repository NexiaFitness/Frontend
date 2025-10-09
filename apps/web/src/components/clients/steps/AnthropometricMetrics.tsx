/**
 * AnthropometricMetrics.tsx — Paso del wizard de Onboarding: Mediciones antropométricas
 *
 * Contexto:
 * - Step 2 del wizard de alta de clientes (insertado entre PhysicalMetrics y TrainingGoals).
 * - Captura: skinfolds (pliegues cutáneos), girths (perímetros), diameters (diámetros óseos).
 * - Todos los campos son opcionales (uso profesional/avanzado).
 * - Validaciones: skinfolds 0-50mm, girths 10-200cm, wrist 3-15cm, knee 5-20cm.
 *
 * @author Frontend Team
 * @since v2.5.0
 */

import React from "react";
import type { AnthropometricMetricsStepProps } from "@nexia/shared/types/clientOnboarding";
import { TYPOGRAPHY } from "@/utils/typography";

export const AnthropometricMetrics: React.FC<AnthropometricMetricsStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div className="space-y-8">
            {/* Header explicativo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <span className="font-semibold">Campos opcionales:</span> Estas mediciones
                    antropométricas son útiles para análisis avanzados de composición corporal.
                    Puedes omitirlas y agregarlas más tarde.
                </p>
            </div>

            {/* ============================================ */}
            {/* SKINFOLDS (Pliegues cutáneos, mm) */}
            {/* ============================================ */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Pliegues cutáneos (mm)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Triceps */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Tríceps</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.triceps ?? ""}
                            onChange={(e) => updateField("triceps", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.triceps && (
                            <p className="text-red-600 text-sm">{errors.triceps}</p>
                        )}
                    </div>

                    {/* Subscapular */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Subescapular</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.subscapular ?? ""}
                            onChange={(e) => updateField("subscapular", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.subscapular && (
                            <p className="text-red-600 text-sm">{errors.subscapular}</p>
                        )}
                    </div>

                    {/* Biceps */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Bíceps</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.biceps ?? ""}
                            onChange={(e) => updateField("biceps", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.biceps && (
                            <p className="text-red-600 text-sm">{errors.biceps}</p>
                        )}
                    </div>

                    {/* Iliac Crest */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Cresta ilíaca</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.iliac_crest ?? ""}
                            onChange={(e) => updateField("iliac_crest", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.iliac_crest && (
                            <p className="text-red-600 text-sm">{errors.iliac_crest}</p>
                        )}
                    </div>

                    {/* Supraspinal */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Supraespinal</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.supraspinal ?? ""}
                            onChange={(e) => updateField("supraspinal", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.supraspinal && (
                            <p className="text-red-600 text-sm">{errors.supraspinal}</p>
                        )}
                    </div>

                    {/* Abdominal */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Abdominal</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.abdominal ?? ""}
                            onChange={(e) => updateField("abdominal", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.abdominal && (
                            <p className="text-red-600 text-sm">{errors.abdominal}</p>
                        )}
                    </div>

                    {/* Thigh */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Muslo</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.thigh ?? ""}
                            onChange={(e) => updateField("thigh", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.thigh && (
                            <p className="text-red-600 text-sm">{errors.thigh}</p>
                        )}
                    </div>

                    {/* Calf */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Pantorrilla</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.calf ?? ""}
                            onChange={(e) => updateField("calf", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.calf && (
                            <p className="text-red-600 text-sm">{errors.calf}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* GIRTHS (Perímetros, cm) */}
            {/* ============================================ */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Perímetros (cm)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Arm Girth */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Perímetro de brazo</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.arm_girth ?? ""}
                            onChange={(e) => updateField("arm_girth", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="10-200 cm"
                        />
                        {errors.arm_girth && (
                            <p className="text-red-600 text-sm">{errors.arm_girth}</p>
                        )}
                    </div>

                    {/* Waist Girth */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Perímetro de cintura</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.waist_girth ?? ""}
                            onChange={(e) => updateField("waist_girth", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="10-200 cm"
                        />
                        {errors.waist_girth && (
                            <p className="text-red-600 text-sm">{errors.waist_girth}</p>
                        )}
                    </div>

                    {/* Hip Girth */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Perímetro de cadera</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.hip_girth ?? ""}
                            onChange={(e) => updateField("hip_girth", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="10-200 cm"
                        />
                        {errors.hip_girth && (
                            <p className="text-red-600 text-sm">{errors.hip_girth}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* DIAMETERS (Diámetros óseos, cm) */}
            {/* ============================================ */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Diámetros óseos (cm)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Wrist Diameter */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Diámetro de muñeca</label>
                        <input
                            type="number"
                            step="0.1"
                            min="3"
                            max="15"
                            value={formData.wrist_diameter ?? ""}
                            onChange={(e) => updateField("wrist_diameter", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="3-15 cm"
                        />
                        {errors.wrist_diameter && (
                            <p className="text-red-600 text-sm">{errors.wrist_diameter}</p>
                        )}
                    </div>

                    {/* Knee Diameter */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Diámetro de rodilla</label>
                        <input
                            type="number"
                            step="0.1"
                            min="5"
                            max="20"
                            value={formData.knee_diameter ?? ""}
                            onChange={(e) => updateField("knee_diameter", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="5-20 cm"
                        />
                        {errors.knee_diameter && (
                            <p className="text-red-600 text-sm">{errors.knee_diameter}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* NOTES (Notas adicionales) */}
            {/* ============================================ */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Notas adicionales
                </h3>
                <div className="space-y-4">
                    {/* Notes 1 */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Nota 1</label>
                        <textarea
                            value={formData.notes_1 || ""}
                            onChange={(e) => updateField("notes_1", e.target.value)}
                            className="w-full border rounded-lg p-3 bg-white text-slate-800 min-h-[80px]"
                            placeholder="Observaciones sobre mediciones, condiciones especiales, etc."
                            maxLength={500}
                        />
                        {errors.notes_1 && (
                            <p className="text-red-600 text-sm">{errors.notes_1}</p>
                        )}
                    </div>

                    {/* Notes 2 */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Nota 2</label>
                        <textarea
                            value={formData.notes_2 || ""}
                            onChange={(e) => updateField("notes_2", e.target.value)}
                            className="w-full border rounded-lg p-3 bg-white text-slate-800 min-h-[80px]"
                            placeholder="Información adicional relevante"
                            maxLength={500}
                        />
                        {errors.notes_2 && (
                            <p className="text-red-600 text-sm">{errors.notes_2}</p>
                        )}
                    </div>

                    {/* Notes 3 */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Nota 3</label>
                        <textarea
                            value={formData.notes_3 || ""}
                            onChange={(e) => updateField("notes_3", e.target.value)}
                            className="w-full border rounded-lg p-3 bg-white text-slate-800 min-h-[80px]"
                            placeholder="Cualquier otra anotación"
                            maxLength={500}
                        />
                        {errors.notes_3 && (
                            <p className="text-red-600 text-sm">{errors.notes_3}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};