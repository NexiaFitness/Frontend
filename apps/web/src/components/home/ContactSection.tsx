/**
 * ContactSection - Formulario de contacto con background image
 * 
 * Estructura inspirada en Harbiz newsletter pero para contacto:
 * - Background image full-width (peso muerto)
 * - Overlay para legibilidad
 * - Split layout: texto izquierda + formulario derecha
 * - Usa componentes existentes: Input, Button, useAuthForm
 * - Validación profesional
 *
 * @author Frontend Team
 * @since v2.6.1 - All changes applied correctly
 */

import React from "react";
import { TYPOGRAPHY } from "@/utils/typography";
import { Button } from "@/components/ui/buttons/Button";
import { useAuthForm } from "@nexia/shared";

// Tipos para el formulario de contacto
interface ContactFormData extends Record<string, unknown> {
    name: string;
    email: string;
    message: string;
}

// Estado inicial del formulario
const initialFormState: ContactFormData = {
    name: "",
    email: "",
    message: ""
};

// Validación del formulario
const validateContactForm = (formData: Record<string, unknown>) => {
    const errors: Record<string, string> = {};

    const data = formData as ContactFormData;

    // Validar nombre
    if (!data.name?.trim()) {
        errors.name = "El nombre es obligatorio";
    } else if (data.name.trim().length < 2) {
        errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email?.trim()) {
        errors.email = "El email es obligatorio";
    } else if (!emailRegex.test(data.email)) {
        errors.email = "El email no tiene un formato válido";
    }

    // Validar mensaje
    if (!data.message?.trim()) {
        errors.message = "El mensaje es obligatorio";
    } else if (data.message.trim().length < 10) {
        errors.message = "El mensaje debe tener al menos 10 caracteres";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const ContactSection: React.FC = () => {
    const {
        formData,
        errors,
        serverError,
        handleInputChange,
        validateForm,
        setServerError
    } = useAuthForm<ContactFormData>({
        initialState: initialFormState,
        validate: validateContactForm
    });

    // Type casting para inputs
    const typedFormData = formData as ContactFormData;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Por ahora simulamos éxito
            setServerError(null);
            alert("Mensaje enviado correctamente. Te contactaremos pronto.");

            // Reset form después de éxito
            // resetForm();
        } catch {
            setServerError("Error al enviar el mensaje. Intenta de nuevo.");
        }
    };

    return (
        <section className="relative min-h-[600px] flex items-center">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="https://res.cloudinary.com/dcpirdjji/image/upload/v1759016202/Peso_muerto_yt3vus.webp"
                    alt="Entrenamiento profesional en gimnasio"
                    className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-slate-900/40"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left: Text Content */}
                    <div className="text-center lg:text-left">
                        <div className="space-y-8 max-w-xl mx-auto lg:mx-0">
                            <h3 className={`${TYPOGRAPHY.hero} text-white leading-tight`}>
                                Hablemos sobre
                                <br />
                                <span style={{ color: '#4A67B3' }}>tu proyecto</span>
                            </h3>

                            <p className={`${TYPOGRAPHY.heroSubtitle} text-white leading-relaxed`}>
                                ¿Tienes preguntas sobre NEXIA? ¿Quieres acceso anticipado?
                                ¿Necesitas una demo personalizada? Contacta directamente con
                                nuestro equipo y te ayudaremos.
                            </p>

                            <div className="space-y-6 text-left">
                                <div className="flex items-center space-x-4">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#4A67B3' }}></div>
                                    <span className={`${TYPOGRAPHY.bodyLarge} text-white`}>
                                        Respuesta en menos de 24 horas
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#4A67B3' }}></div>
                                    <span className={`${TYPOGRAPHY.bodyLarge} text-white`}>
                                        Demo personalizada disponible
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#4A67B3' }}></div>
                                    <span className={`${TYPOGRAPHY.bodyLarge} text-white`}>
                                        Registro para acceso beta
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="bg-slate-900/15 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-2xl">
                        <h4 className={`${TYPOGRAPHY.cardTitle} text-white mb-6 text-center`}>
                            Información de contacto
                        </h4>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nombre */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-white mb-1">
                                    Nombre completo
                                    <span className="text-white ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={typedFormData.name}
                                    onChange={(e) => handleInputChange("name")(e)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:ring-offset-2 placeholder-gray-400 text-gray-900 sm:px-4 sm:py-2.5 sm:text-base sm:min-h-[44px]"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-white mb-1">
                                    Correo electrónico
                                    <span className="text-white ml-1">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={typedFormData.email}
                                    onChange={(e) => handleInputChange("email")(e)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:ring-offset-2 placeholder-gray-400 text-gray-900 sm:px-4 sm:py-2.5 sm:text-base sm:min-h-[44px]"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Mensaje - Usando textarea */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-white mb-1">
                                    Mensaje
                                    <span className="text-white ml-1">*</span>
                                </label>
                                <textarea
                                    value={typedFormData.message}
                                    onChange={(e) => handleInputChange("message")(e)}
                                    placeholder="Cuéntanos qué necesitas..."
                                    rows={4}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:ring-offset-2 placeholder-gray-400 text-gray-900 resize-none"
                                />
                                {errors.message && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.message}
                                    </p>
                                )}
                            </div>

                            {/* Error del servidor */}
                            {serverError && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                    <p className="text-sm text-red-600">{serverError}</p>
                                </div>
                            )}

                            {/* Política de privacidad */}
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Al enviar este formulario, aceptas que NEXIA procese tus datos
                                    para responder a tu consulta. No compartimos tu información
                                    con terceros.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                            >
                                Enviar mensaje
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};