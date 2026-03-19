/**
 * Review.tsx — Paso final del wizard de Onboarding
 *
 * Contexto:
 * - Step 6 (final) del wizard de alta de clientes.
 * - Muestra resumen completo de todos los datos capturados según diseño Figma.
 * - Readonly (no permite edición, solo visualización).
 * - Usuario debe volver atrás si quiere modificar algo.
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v6.0.0 - Rediseño completo según Figma
 */

import React, { useMemo } from "react";
import type { ReviewStepProps } from "@nexia/shared/types/clientOnboarding";
import { TYPOGRAPHY } from "@/utils/typography";
import { calculateBMI, useClientPreview, TRAINING_DAY_LABELS, type TrainingDayValue } from "@nexia/shared";
import { SomatotipoChart } from "../charts/SomatotipoChart";
import { Button } from "@/components/ui/buttons";
import { Avatar } from "@/components/ui/avatar";

interface ExtendedReviewProps extends ReviewStepProps {
    onBack?: () => void;
    onCreateProfile?: () => void;
    isSubmitting?: boolean;
}

export const Review: React.FC<ExtendedReviewProps> = ({
    formData,
    onBack,
    onCreateProfile,
    isSubmitting = false,
}) => {
    // Obtener preview de cálculos del backend (BMI y somatotipo)
    const { preview, isLoading: isLoadingPreview } = useClientPreview({
        formData,
        enabled: true,
    });

    // Helper para mostrar valores opcionales
    const display = (value: string | number | undefined | null) => value || "—";

    // Helper para formatear fecha corta (March 12, 1999)
    const formatDateShort = (dateStr: string | undefined | null) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    // Helper para calcular edad desde birthdate
    const calculateAge = (birthdate: string | undefined | null): number | null => {
        if (!birthdate) return null;
        try {
            const birth = new Date(birthdate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        } catch {
            return null;
        }
    };

    // Helper para formatear género
    const formatGender = (gender: string | undefined | null): string => {
        if (!gender) return "—";
        return gender;
    };

    // Helper para formatear objetivo de entrenamiento
    const formatTrainingGoal = (goal: string | undefined | null): string => {
        if (!goal) return "—";
        return goal;
    };

    // Helper para formatear experiencia
    const formatExperience = (exp: string | undefined | null): string => {
        if (!exp) return "—";
        return exp;
    };

    // Helper para formatear frecuencia semanal
    const formatFrequency = (freq: string | undefined | null): string => {
        if (!freq) return "—";
        const translations: Record<string, string> = {
            Baja: "1-2x per week",
            Media: "3-5x per week",
            Alta: "6-7x per week",
        };
        return translations[freq] || freq;
    };

    // Helper para formatear duración de sesión
    const formatSessionDuration = (duration: string | undefined | null): string => {
        if (!duration) return "—";
        const durationMap: Record<string, string> = {
            short_lt_1h: "30-45 min",
            medium_1h_to_1h30: "1 hr - 1 hr 30 min",
            long_gt_1h30: "1 hr 30 min+",
        };
        return durationMap[duration] || duration;
    };

    // Helper para formatear días concretos (training_days)
    const formatTrainingDays = (days: string[] | undefined | null): string => {
        if (!days || days.length === 0) return "—";
        return days
            .map((d) => TRAINING_DAY_LABELS[d as TrainingDayValue] ?? d)
            .join(", ");
    };

    // Calcular BMI: usar valor del preview del backend si está disponible, sino calcular en frontend
    const bmi = useMemo(() => {
        // Prioridad 1: Valor calculado del backend (preview)
        if (preview?.bmi !== null && preview?.bmi !== undefined) {
            return preview.bmi;
        }
        // Prioridad 2: Calcular en frontend como fallback
        if (formData.peso && formData.altura) {
            const alturaEnMetros = formData.altura / 100;
            return calculateBMI(formData.peso, alturaEnMetros);
        }
        return null;
    }, [preview?.bmi, formData.peso, formData.altura]);

    // Calcular edad
    const age = useMemo(() => {
        if (formData.birthdate) {
            return calculateAge(formData.birthdate);
        }
        return formData.edad ?? null;
    }, [formData.birthdate, formData.edad]);


    // Extraer notas de los campos de notas
    const notes = useMemo(() => {
        const noteList: string[] = [];
        if (formData.lesiones_relevantes) noteList.push(formData.lesiones_relevantes);
        if (formData.observaciones) noteList.push(formData.observaciones);
        if (formData.notes_1) noteList.push(formData.notes_1);
        if (formData.notes_2) noteList.push(formData.notes_2);
        if (formData.notes_3) noteList.push(formData.notes_3);
        return noteList;
    }, [
        formData.lesiones_relevantes,
        formData.observaciones,
        formData.notes_1,
        formData.notes_2,
        formData.notes_3,
    ]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6 lg:mb-8 text-center px-4 lg:px-8">
                <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                    Revisar Perfil del Cliente
                </h2>
                <p className="text-white/80 text-sm md:text-base">
                    Aquí tienes un resumen de la información que has ingresado.
                </p>
            </div>

            <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Personal Information Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Información Personal
                            </h3>
                            <div className="flex-1 h-0.5 bg-gray-900"></div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <Avatar
                                    nombre={formData.nombre}
                                    apellidos={formData.apellidos}
                                    size="lg"
                                    variant="default"
                                />
                            </div>

                            {/* Datos personales en 4 columnas */}
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
                                <div>
                                    <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                        Nombre
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {display(formData.nombre)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                        Apellidos
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {display(formData.apellidos)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                        Teléfono
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {display(formData.telefono)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                        Fecha de Nacimiento
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {formatDateShort(formData.birthdate)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                        Sexo
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {formatGender(formData.sexo)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                        Edad
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {age ? `${age} años` : "—"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                        Email
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {display(formData.mail)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                        DNI/Pasaporte
                                    </span>
                                    <p className="text-gray-900 font-medium">
                                        {display(formData.id_passport)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Anthropometric Data Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Datos Antropométricos
                            </h3>
                            <div className="flex-1 h-0.5 bg-gray-900"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                    Peso
                                </span>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formData.peso ? `${formData.peso} kg` : "—"}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                    Altura
                                </span>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formData.altura ? `${formData.altura} cm` : "—"}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                    IMC
                                </span>
                                <p className="text-lg font-semibold text-gray-900">
                                    {bmi ? bmi.toFixed(1) : "—"}
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {}}
                                    className="bg-gray-700 hover:bg-gray-800 text-white"
                                >
                                    Ver Todo
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Layout de dos columnas: Training Parameters + Notes a la izquierda, Somatotype Chart a la derecha */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* Columna izquierda: Training Parameters y Notes */}
                        <div className="flex flex-col h-full">
                            {/* Training Parameters Card */}
                            <div className="bg-white rounded-lg shadow p-6 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Parámetros de Entrenamiento
                                    </h3>
                                    <div className="flex-1 h-0.5 bg-gray-900"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                            Objetivo
                                        </span>
                                        <p className="text-gray-900 font-medium">
                                            {formatTrainingGoal(formData.objetivo_entrenamiento)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                            Nivel de Experiencia
                                        </span>
                                        <p className="text-gray-900 font-medium">
                                            {formatExperience(formData.experiencia)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                            Frecuencia de Entrenamiento
                                        </span>
                                        <p className="text-gray-900 font-medium">
                                            {formatFrequency(formData.frecuencia_semanal)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                            Duración de Sesión
                                        </span>
                                        <p className="text-gray-900 font-medium">
                                            {formatSessionDuration(formData.session_duration)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                            Días/semana (exacto)
                                        </span>
                                        <p className="text-gray-900 font-medium">
                                            {formData.exact_training_frequency != null
                                                ? `${formData.exact_training_frequency} día${formData.exact_training_frequency === 1 ? "" : "s"}/semana`
                                                : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase tracking-wide text-primary-600 block mb-1">
                                            Días concretos
                                        </span>
                                        <p className="text-gray-900 font-medium">
                                            {formatTrainingDays(formData.training_days ?? null)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Card - Siempre visible, se extiende para igualar altura */}
                            <div className="bg-white rounded-lg shadow p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Notas
                                    </h3>
                                    <div className="flex-1 h-0.5 bg-gray-900"></div>
                                </div>
                                <div className="flex-1">
                                    {notes.length > 0 ? (
                                        <ul className="space-y-2">
                                            {notes.map((note, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="text-primary-600 mt-1">•</span>
                                                    <span className="text-sm text-gray-700">{note}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">
                                            No hay notas para este cliente.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Columna derecha: Somatotype Chart y botones */}
                        <div className="flex flex-col h-full">
                            {/* Somatotype Chart */}
                            <div className="mb-6">
                                <SomatotipoChart
                                    endomorph={
                                        // Prioridad 1: Valor manual del usuario
                                        formData.somatotype_endomorph ??
                                        // Prioridad 2: Valor calculado del backend (preview)
                                        preview?.somatotype?.endomorph ??
                                        null
                                    }
                                    mesomorph={
                                        formData.somatotype_mesomorph ??
                                        preview?.somatotype?.mesomorph ??
                                        null
                                    }
                                    ectomorph={
                                        formData.somatotype_ectomorph ??
                                        preview?.somatotype?.ectomorph ??
                                        null
                                    }
                                />
                                {/* Indicador de carga si está calculando */}
                                {isLoadingPreview && (
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Calculando somatotipo...
                                    </p>
                                )}
                            </div>

                            {/* Navigation Buttons - Debajo del chart */}
                            {(onBack || onCreateProfile) && (
                                <div className="flex justify-between gap-4 mt-auto">
                                    {onBack && (
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={onBack}
                                            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex-1"
                                            disabled={isSubmitting}
                                        >
                                            Atrás
                                        </Button>
                                    )}
                                    {onCreateProfile && (
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={onCreateProfile}
                                            className="bg-primary-600 hover:bg-primary-700 text-white flex-1"
                                            isLoading={isSubmitting}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Creando..." : "Crear Perfil"}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};