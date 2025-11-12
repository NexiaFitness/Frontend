/**
 * ClientMetricsFields.tsx — Componente reutilizable para campos de métricas físicas y progreso
 *
 * Contexto:
 * - Componente reutilizable que incluye TODOS los campos de métricas disponibles en NEXIA
 * - Usable tanto en onboarding (altura en cm) como en progreso (altura en cm)
 * - Incluye métricas básicas, antropométricas y campos de progreso
 * - El IMC se calcula en el backend, no en el frontend
 *
 * Campos incluidos:
 * - Métricas básicas: edad, peso, altura
 * - Campos de progreso: fecha_registro, unidad, notas
 * - Antropometría: skinfolds (8), girths (6), diameters (3)
 *
 * @author Frontend Team
 * @since v4.4.0
 * @updated v4.5.0 - Eliminado cálculo de IMC (backend lo hace)
 */

import React from "react";
import type { UniversalMetricsFormData } from "@nexia/shared/types/forms";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientMetricsFieldsProps {
    formData: UniversalMetricsFormData;
    errors?: Record<string, string>;
    updateField: <K extends keyof UniversalMetricsFormData>(
        field: K,
        value: UniversalMetricsFormData[K]
    ) => void;
    /**
     * Modo de altura:
     * - "cm": Altura en centímetros (100-250)
     * @default "cm"
     */
    heightUnit?: "cm" | "meters";
    /**
     * Incluir campos de progreso (fecha_registro, unidad, notas)
     * @default false
     */
    includeProgressFields?: boolean;
    /**
     * Incluir campos antropométricos (skinfolds, girths, diameters)
     * @default false
     */
    includeAnthropometric?: boolean;
    /**
     * Campos requeridos (mostrar asterisco)
     * @default []
     */
    requiredFields?: string[];
}

export const ClientMetricsFields: React.FC<ClientMetricsFieldsProps> = ({
    formData,
    errors = {},
    updateField,
    heightUnit: _heightUnit = "cm", // Prefijo _ para cumplir con ESLint (prop reservado para uso futuro)
    includeProgressFields = false,
    includeAnthropometric = false,
    requiredFields = [],
}) => {
    // El IMC se calcula en el backend, no en el frontend
    const isRequired = (field: string): boolean => {
        return requiredFields.includes(field);
    };

    return (
        <div className="space-y-6">
            {/* ============================================ */}
            {/* MÉTRICAS BÁSICAS */}
            {/* ============================================ */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Métricas físicas básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Edad */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>
                            Edad {isRequired("edad") && "*"}
                        </label>
                        <input
                            type="number"
                            min={13}
                            max={100}
                            value={formData.edad ?? ""}
                            onChange={(e) => updateField("edad", Number(e.target.value) || null)}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="13-100 años"
                        />
                        {errors.edad && (
                            <p className="text-red-600 text-sm mt-1">{errors.edad}</p>
                        )}
                    </div>

                    {/* Peso */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>
                            Peso (kg) {isRequired("peso") && "*"}
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min={20}
                            max={300}
                            value={formData.peso ?? ""}
                            onChange={(e) => updateField("peso", Number(e.target.value) || null)}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="20-300 kg"
                        />
                        {errors.peso && (
                            <p className="text-red-600 text-sm mt-1">{errors.peso}</p>
                        )}
                    </div>

                    {/* Altura */}
                    <div>
                        <label className={TYPOGRAPHY.inputLabel}>
                            Altura (cm) {isRequired("altura") && "*"}
                        </label>
                        <input
                            type="number"
                            step={0.1}
                            min={100}
                            max={250}
                            value={formData.altura ?? ""}
                            onChange={(e) => updateField("altura", Number(e.target.value) || null)}
                            className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            placeholder="100-250 cm"
                        />
                        {errors.altura && (
                            <p className="text-red-600 text-sm mt-1">{errors.altura}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* CAMPOS DE PROGRESO (opcional) */}
            {/* ============================================ */}
            {includeProgressFields && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Información del registro
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fecha de registro */}
                        <div>
                            <label className={TYPOGRAPHY.inputLabel}>
                                Fecha de registro {isRequired("fecha_registro") && "*"}
                            </label>
                            <input
                                type="date"
                                value={formData.fecha_registro ?? new Date().toISOString().split("T")[0]}
                                onChange={(e) => updateField("fecha_registro", e.target.value)}
                                className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            />
                            {errors.fecha_registro && (
                                <p className="text-red-600 text-sm mt-1">{errors.fecha_registro}</p>
                            )}
                        </div>

                        {/* Unidad */}
                        <div>
                            <label className={TYPOGRAPHY.inputLabel}>Unidad de medida</label>
                            <select
                                value={formData.unidad ?? "metric"}
                                onChange={(e) => updateField("unidad", e.target.value as "metric" | "imperial")}
                                className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            >
                                <option value="metric">Métrica (kg, m)</option>
                                <option value="imperial">Imperial (lbs, in)</option>
                            </select>
                        </div>

                        {/* Notas */}
                        <div className="md:col-span-2">
                            <label className={TYPOGRAPHY.inputLabel}>Notas (opcional)</label>
                            <textarea
                                value={formData.notas ?? ""}
                                onChange={(e) => updateField("notas", e.target.value || null)}
                                rows={3}
                                className="w-full border rounded-lg p-2 bg-white text-slate-800 resize-none"
                                placeholder="Observaciones sobre este registro de progreso..."
                            />
                            {errors.notas && (
                                <p className="text-red-600 text-sm mt-1">{errors.notas}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* ANTROPOMETRÍA (opcional) */}
            {/* ============================================ */}
            {includeAnthropometric && (
                <>
                    {/* Skinfolds */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            Pliegues cutáneos (mm)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { field: "skinfold_triceps", label: "Tríceps" },
                                { field: "skinfold_subscapular", label: "Subescapular" },
                                { field: "skinfold_biceps", label: "Bíceps" },
                                { field: "skinfold_iliac_crest", label: "Cresta ilíaca" },
                                { field: "skinfold_supraspinal", label: "Supraespinal" },
                                { field: "skinfold_abdominal", label: "Abdominal" },
                                { field: "skinfold_thigh", label: "Muslo" },
                                { field: "skinfold_calf", label: "Pantorrilla" },
                            ].map(({ field, label }) => (
                                <div key={field}>
                                    <label className={TYPOGRAPHY.inputLabel}>{label}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="50"
                                        value={formData[field as keyof typeof formData] ?? ""}
                                        onChange={(e) => updateField(field as keyof UniversalMetricsFormData, Number(e.target.value) || null)}
                                        className="w-full border rounded-lg p-2 bg-white text-slate-800"
                                        placeholder="0-50 mm"
                                    />
                                    {errors[field] && (
                                        <p className="text-red-600 text-sm mt-1">{errors[field]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Girths */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            Perímetros (cm)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { field: "girth_relaxed_arm", label: "Brazo (relajado)" },
                                { field: "girth_flexed_contracted_arm", label: "Brazo (flexionado/contraído)" },
                                { field: "girth_waist_minimum", label: "Cintura (mínimo)" },
                                { field: "girth_hips_maximum", label: "Cadera (máximo)" },
                                { field: "girth_medial_thigh", label: "Muslo (medial)" },
                                { field: "girth_maximum_calf", label: "Pantorrilla (máximo)" },
                            ].map(({ field, label }) => (
                                <div key={field}>
                                    <label className={TYPOGRAPHY.inputLabel}>{label}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="10"
                                        max="200"
                                        value={formData[field as keyof typeof formData] ?? ""}
                                        onChange={(e) => updateField(field as keyof UniversalMetricsFormData, Number(e.target.value) || null)}
                                        className="w-full border rounded-lg p-2 bg-white text-slate-800"
                                        placeholder="10-200 cm"
                                    />
                                    {errors[field] && (
                                        <p className="text-red-600 text-sm mt-1">{errors[field]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Diameters */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            Diámetros óseos (cm)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { field: "diameter_bi_styloid_wrist", label: "Muñeca (biestiloideo)", min: 3, max: 20 },
                                { field: "diameter_humerus_biepicondylar", label: "Húmero (biepicondilar)", min: 3, max: 20 },
                                { field: "diameter_femur_bicondylar", label: "Fémur (bicondilar)", min: 3, max: 20 },
                            ].map(({ field, label, min, max }) => (
                                <div key={field}>
                                    <label className={TYPOGRAPHY.inputLabel}>{label}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min={min}
                                        max={max}
                                        value={formData[field as keyof typeof formData] ?? ""}
                                        onChange={(e) => updateField(field as keyof UniversalMetricsFormData, Number(e.target.value) || null)}
                                        className="w-full border rounded-lg p-2 bg-white text-slate-800"
                                        placeholder={`${min}-${max} cm`}
                                    />
                                    {errors[field] && (
                                        <p className="text-red-600 text-sm mt-1">{errors[field]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

