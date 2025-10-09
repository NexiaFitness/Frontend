/**
 * PersonalInfo.tsx — Paso del wizard de Onboarding: Datos personales
 *
 * Contexto:
 * - Step 1 del wizard de alta de clientes.
 * - Captura: nombre, apellidos, email, confirmEmail, teléfono, sexo.
 * - Campos obligatorios: nombre, apellidos, email, confirmEmail.
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v2.4.1 - Props renombradas (data→formData, onChange→updateField)
 */

import React from "react";
import type { PersonalInfoStepProps } from "@nexia/shared/types/clientOnboarding";
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
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    placeholder="ejemplo@correo.com"
                />
                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
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
                    onChange={(e) => updateField("sexo", e.target.value)}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                >
                    <option value="">Selecciona una opción</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                </select>
                {errors.sexo && <p className="text-red-600 text-sm">{errors.sexo}</p>}
            </div>
        </div>
    );
};