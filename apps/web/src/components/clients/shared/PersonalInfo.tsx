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
import {
    inputClass,
    selectClass,
    labelClass,
    errorClass,
    sectionHeadingClass,
    sectionDividerClass,
} from "./formFieldStyles";

interface PersonalInfoProps extends PersonalInfoStepProps {
    isEditMode?: boolean;
    /** En modo edit, el padre (ClientFormBase) puede renderizar el heading de la sección; ocultar el interno para evitar duplicado. */
    hideHeading?: boolean;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({
    formData,
    errors,
    updateField,
    isEditMode: _isEditMode = false,
    hideHeading = false,
}) => {
    return (
        <div>
            {/* Sección: Información Personal (heading opcional cuando el padre usa role="region") */}
            <div>
                {!hideHeading && (
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className={sectionHeadingClass}>Información Personal</h3>
                        <div className={sectionDividerClass} />
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6 items-start mb-4">
                    <div className="flex-shrink-0">
                        <label className={labelClass}>Foto de Perfil</label>
                        <div className="w-32 h-32 rounded-lg border-2 border-border border-dashed bg-muted/30 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="text-center">
                                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <p className="text-xs text-muted-foreground">Foto de Perfil</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Nombre <span className="text-destructive">*</span></label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => updateField("nombre", e.target.value)}
                                    className={inputClass}
                                    placeholder="Ej: Juan"
                                />
                                {errors.nombre && <p className={errorClass}>{errors.nombre}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Apellidos <span className="text-destructive">*</span></label>
                                <input
                                    type="text"
                                    value={formData.apellidos}
                                    onChange={(e) => updateField("apellidos", e.target.value)}
                                    className={inputClass}
                                    placeholder="Ej: Pérez Gómez"
                                />
                                {errors.apellidos && <p className={errorClass}>{errors.apellidos}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>DNI/Pasaporte</label>
                                <input
                                    type="text"
                                    value={formData.id_passport || ""}
                                    onChange={(e) => updateField("id_passport", e.target.value)}
                                    className={inputClass}
                                    placeholder="12345678X"
                                />
                                {errors.id_passport && <p className={errorClass}>{errors.id_passport}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    value={formData.birthdate || ""}
                                    onChange={(e) => updateField("birthdate", e.target.value)}
                                    className={inputClass}
                                    max={new Date().toISOString().split("T")[0]}
                                />
                                {errors.birthdate && <p className={errorClass}>{errors.birthdate}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                        <label className={labelClass}>Sexo</label>
                        <select
                            value={formData.sexo || ""}
                            onChange={(e) => updateField("sexo", e.target.value as typeof formData.sexo)}
                            className={selectClass}
                        >
                            <option value="">Selecciona una opción</option>
                            <option value={GENDER_ENUM.MASCULINO}>Masculino</option>
                            <option value={GENDER_ENUM.FEMENINO}>Femenino</option>
                        </select>
                        {errors.sexo && <p className={errorClass}>{errors.sexo}</p>}
                    </div>
                    <div className="md:col-span-6">
                        <label className={labelClass}>Correo electrónico <span className="text-destructive">*</span></label>
                        <input
                            type="email"
                            value={formData.mail}
                            onChange={(e) => updateField("mail", e.target.value)}
                            className={inputClass}
                            placeholder="ejemplo@correo.com"
                        />
                        {errors.mail && <p className={errorClass}>{errors.mail}</p>}
                    </div>
                    <div className="md:col-span-3">
                        <label className={labelClass}>Teléfono</label>
                        <input
                            type="tel"
                            value={formData.telefono || ""}
                            onChange={(e) => updateField("telefono", e.target.value)}
                            className={inputClass}
                            placeholder="+34 600 000 000"
                        />
                        {errors.telefono && <p className={errorClass}>{errors.telefono}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

