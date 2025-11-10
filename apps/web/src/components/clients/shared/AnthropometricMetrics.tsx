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
                            value={formData.skinfold_triceps ?? ""}
                            onChange={(e) => updateField("skinfold_triceps", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_triceps && (
                            <p className="text-red-600 text-sm">{errors.skinfold_triceps}</p>
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
                            value={formData.skinfold_subscapular ?? ""}
                            onChange={(e) => updateField("skinfold_subscapular", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_subscapular && (
                            <p className="text-red-600 text-sm">{errors.skinfold_subscapular}</p>
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
                            value={formData.skinfold_biceps ?? ""}
                            onChange={(e) => updateField("skinfold_biceps", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_biceps && (
                            <p className="text-red-600 text-sm">{errors.skinfold_biceps}</p>
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
                            value={formData.skinfold_iliac_crest ?? ""}
                            onChange={(e) => updateField("skinfold_iliac_crest", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_iliac_crest && (
                            <p className="text-red-600 text-sm">{errors.skinfold_iliac_crest}</p>
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
                            value={formData.skinfold_supraspinal ?? ""}
                            onChange={(e) => updateField("skinfold_supraspinal", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_supraspinal && (
                            <p className="text-red-600 text-sm">{errors.skinfold_supraspinal}</p>
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
                            value={formData.skinfold_abdominal ?? ""}
                            onChange={(e) => updateField("skinfold_abdominal", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_abdominal && (
                            <p className="text-red-600 text-sm">{errors.skinfold_abdominal}</p>
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
                            value={formData.skinfold_thigh ?? ""}
                            onChange={(e) => updateField("skinfold_thigh", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_thigh && (
                            <p className="text-red-600 text-sm">{errors.skinfold_thigh}</p>
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
                            value={formData.skinfold_calf ?? ""}
                            onChange={(e) => updateField("skinfold_calf", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_calf && (
                            <p className="text-red-600 text-sm">{errors.skinfold_calf}</p>
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
                    {/* Arm Girth Relaxed */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Perímetro de brazo (relajado)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_relaxed_arm ?? ""}
                            onChange={(e) => updateField("girth_relaxed_arm", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_relaxed_arm && (
                            <p className="text-red-600 text-sm">{errors.girth_relaxed_arm}</p>
                        )}
                    </div>

                    {/* Arm Girth Flexed */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Perímetro de brazo (flexionado/contraído)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_flexed_contracted_arm ?? ""}
                            onChange={(e) => updateField("girth_flexed_contracted_arm", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_flexed_contracted_arm && (
                            <p className="text-red-600 text-sm">{errors.girth_flexed_contracted_arm}</p>
                        )}
                    </div>

                    {/* Waist Girth */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Perímetro de cintura (mínimo)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_waist_minimum ?? ""}
                            onChange={(e) => updateField("girth_waist_minimum", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_waist_minimum && (
                            <p className="text-red-600 text-sm">{errors.girth_waist_minimum}</p>
                        )}
                    </div>

                    {/* Hip Girth */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Perímetro de cadera (máximo)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_hips_maximum ?? ""}
                            onChange={(e) => updateField("girth_hips_maximum", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_hips_maximum && (
                            <p className="text-red-600 text-sm">{errors.girth_hips_maximum}</p>
                        )}
                    </div>

                    {/* Medial Thigh Girth */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Perímetro medial de muslo</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_medial_thigh ?? ""}
                            onChange={(e) => updateField("girth_medial_thigh", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_medial_thigh && (
                            <p className="text-red-600 text-sm">{errors.girth_medial_thigh}</p>
                        )}
                    </div>

                    {/* Maximum Calf Girth */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Perímetro máximo de pantorrilla</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_maximum_calf ?? ""}
                            onChange={(e) => updateField("girth_maximum_calf", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_maximum_calf && (
                            <p className="text-red-600 text-sm">{errors.girth_maximum_calf}</p>
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
                        <label className={TYPOGRAPHY.inputLabel}>Diámetro biestiloideo de muñeca</label>
                        <input
                            type="number"
                            step="0.1"
                            min="3"
                            max="15"
                            value={formData.diameter_bi_styloid_wrist ?? ""}
                            onChange={(e) => updateField("diameter_bi_styloid_wrist", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="3-15 cm"
                        />
                        {errors.diameter_bi_styloid_wrist && (
                            <p className="text-red-600 text-sm">{errors.diameter_bi_styloid_wrist}</p>
                        )}
                    </div>

                    {/* Humerus Diameter */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Diámetro biepicondilar de húmero</label>
                        <input
                            type="number"
                            step="0.1"
                            min="3"
                            max="20"
                            value={formData.diameter_humerus_biepicondylar ?? ""}
                            onChange={(e) => updateField("diameter_humerus_biepicondylar", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="3-20 cm"
                        />
                        {errors.diameter_humerus_biepicondylar && (
                            <p className="text-red-600 text-sm">{errors.diameter_humerus_biepicondylar}</p>
                        )}
                    </div>

                    {/* Knee Diameter */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>Diámetro bicondilar de fémur</label>
                        <input
                            type="number"
                            step="0.1"
                            min="5"
                            max="20"
                            value={formData.diameter_femur_bicondylar ?? ""}
                            onChange={(e) => updateField("diameter_femur_bicondylar", Number(e.target.value))}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="5-20 cm"
                        />
                        {errors.diameter_femur_bicondylar && (
                            <p className="text-red-600 text-sm">{errors.diameter_femur_bicondylar}</p>
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

