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
                        <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                        <div className="flex-1 h-0.5 bg-gray-900"></div>
                    </div>
                )}
                
                {/* Primera fila: Foto a la izquierda, grid de 2 columnas a la derecha */}
                <div className="flex flex-col md:flex-row gap-6 items-start mb-4">
                    {/* Foto de perfil - Izquierda */}
                    <div className="flex-shrink-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                        <div className="w-32 h-32 rounded-lg border-2 border-gray-300 border-dashed bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="text-center">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <p className="text-xs text-gray-500">Foto de Perfil</p>
                            </div>
                        </div>
                    </div>

                    {/* Campos - Derecha, en grid de 2 columnas */}
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre <span className="text-white">*</span></label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => updateField("nombre", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Ej: Juan"
                                />
                                {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
                            </div>

                            {/* Apellidos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellidos <span className="text-white">*</span></label>
                                <input
                                    type="text"
                                    value={formData.apellidos}
                                    onChange={(e) => updateField("apellidos", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Ej: Pérez Gómez"
                                />
                                {errors.apellidos && (
                                    <p className="text-red-600 text-sm mt-1">{errors.apellidos}</p>
                                )}
                            </div>

                            {/* DNI/Pasaporte */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">DNI/Pasaporte</label>
                                <input
                                    type="text"
                                    value={formData.id_passport || ""}
                                    onChange={(e) => updateField("id_passport", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="12345678X"
                                />
                                {errors.id_passport && (
                                    <p className="text-red-600 text-sm mt-1">{errors.id_passport}</p>
                                )}
                            </div>

                            {/* Fecha de nacimiento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    value={formData.birthdate || ""}
                                    onChange={(e) => updateField("birthdate", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {errors.birthdate && (
                                    <p className="text-red-600 text-sm mt-1">{errors.birthdate}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Segunda fila: Sexo, Email (más ancho), Teléfono en una línea */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Sexo */}
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Sexo</label>
                        <select
                            value={formData.sexo || ""}
                            onChange={(e) => updateField("sexo", e.target.value as typeof formData.sexo)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Selecciona una opción</option>
                            <option value={GENDER_ENUM.MASCULINO}>Masculino</option>
                            <option value={GENDER_ENUM.FEMENINO}>Femenino</option>
                        </select>
                        {errors.sexo && <p className="text-red-600 text-sm mt-1">{errors.sexo}</p>}
                    </div>

                    {/* Email - Más ancho */}
                    <div className="md:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico <span className="text-white">*</span></label>
                        <input
                            type="email"
                            value={formData.mail}
                            onChange={(e) => updateField("mail", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="ejemplo@correo.com"
                        />
                        {errors.mail && <p className="text-red-600 text-sm mt-1">{errors.mail}</p>}
                    </div>

                    {/* Teléfono */}
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
                        <input
                            type="tel"
                            value={formData.telefono || ""}
                            onChange={(e) => updateField("telefono", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="+34 600 000 000"
                        />
                        {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

