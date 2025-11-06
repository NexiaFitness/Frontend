/**
 * PersonalInfo.tsx — Paso del wizard de Onboarding: Datos personales
 *
 * Contexto:
 * - Step 1 del wizard de alta de clientes.
 * - Captura: nombre, apellidos, mail, confirmEmail, teléfono, sexo.
 * - Campos obligatorios: nombre, apellidos, mail, confirmEmail.
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v2.4.1 - Props renombradas (data→formData, onChange→updateField)
 */

import React from "react";
import type { PersonalInfoStepProps } from "@nexia/shared/types/clientOnboarding";
import { GENDER_ENUM } from "@nexia/shared";
import { TYPOGRAPHY } from "@/utils/typography";

export const PersonalInfo: React.FC<PersonalInfoStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div className="space-y-6">
            {/* Nombre */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Nombre *</label>
                <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => updateField("nombre", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    placeholder="Ej: Juan"
                />
                {errors.nombre && <p className="text-red-600 text-sm">{errors.nombre}</p>}
            </div>

            {/* Apellidos */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Apellidos *</label>
                <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => updateField("apellidos", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    placeholder="Ej: Pérez Gómez"
                />
                {errors.apellidos && (
                    <p className="text-red-600 text-sm">{errors.apellidos}</p>
                )}
            </div>

            {/* Email */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Correo electrónico *</label>
                <input
                    type="email"
                    value={formData.mail}
                    onChange={(e) => updateField("mail", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    placeholder="ejemplo@correo.com"
                />
                {errors.mail && <p className="text-red-600 text-sm">{errors.mail}</p>}
            </div>

            {/* Confirm Email */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Confirmar correo *</label>
                <input
                    type="email"
                    value={formData.confirmEmail || ""}
                    onChange={(e) => updateField("confirmEmail", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    placeholder="Repite tu correo"
                />
                {errors.confirmEmail && (
                    <p className="text-red-600 text-sm">{errors.confirmEmail}</p>
                )}
            </div>

            {/* Teléfono */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Teléfono</label>
                <input
                    type="tel"
                    value={formData.telefono || ""}
                    onChange={(e) => updateField("telefono", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    placeholder="+34 600 000 000"
                />
                {errors.telefono && <p className="text-red-600 text-sm">{errors.telefono}</p>}
            </div>

            {/* Sexo */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Sexo</label>
                <select
                    value={formData.sexo || ""}
                    onChange={(e) => updateField("sexo", e.target.value as typeof formData.sexo)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                >
                    <option value="">Selecciona una opción</option>
                    <option value={GENDER_ENUM.MASCULINO}>Masculino</option>
                    <option value={GENDER_ENUM.FEMENINO}>Femenino</option>
                </select>
                {errors.sexo && <p className="text-red-600 text-sm">{errors.sexo}</p>}
            </div>

            {/* DNI/Pasaporte */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>DNI/Pasaporte (opcional)</label>
                <input
                    type="text"
                    value={formData.id_passport || ""}
                    onChange={(e) => updateField("id_passport", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    placeholder="12345678X"
                />
                {errors.id_passport && (
                    <p className="text-red-600 text-sm">{errors.id_passport}</p>
                )}
            </div>

            {/* Fecha de nacimiento */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Fecha de nacimiento (opcional)</label>
                <input
                    type="date"
                    value={formData.birthdate || ""}
                    onChange={(e) => updateField("birthdate", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    max={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-slate-500 mt-1">
                    Alternativa a edad. Si proporcionas esta fecha, puedes omitir el campo de edad.
                </p>
                {errors.birthdate && (
                    <p className="text-red-600 text-sm">{errors.birthdate}</p>
                )}
            </div>
        </div>
    );
};