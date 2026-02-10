/**
 * ClientHeader.tsx — Header unificado del cliente (Figma-aligned)
 *
 * Contexto:
 * - Header consistente en TODOS los tabs del cliente
 * - Layout basado en Figma Profile Page (Laura Refoyo López)
 *
 * @author Frontend Team
 * @since v3.1.0
 * @updated v6.0.0 - Integración de Breadcrumbs para navegación profesional.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import type { Client } from "@nexia/shared/types/client";
import { TRAINING_DAY_LABELS, type TrainingDayValue } from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { Avatar } from "@/components/ui/avatar";
import { TYPOGRAPHY } from "@/utils/typography";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";

interface ClientHeaderProps {
    client: Client;
    onEditProfile?: () => void;
    onAnthropometricData?: () => void;
    breadcrumbItems?: BreadcrumbItem[];
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
    client,
    onEditProfile,
    onAnthropometricData,
    breadcrumbItems,
}) => {
    const navigate = useNavigate();

    // Calcular edad desde birthdate si no está disponible directamente
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

    // Obtener edad: primero de client.edad, si no existe calcular desde birthdate
    const clientAge = client.edad ?? (client.birthdate ? calculateAge(client.birthdate) : null);

    // Formatear fecha de alta como "15 de enero de 2024"
    const formatJoinedDate = (fechaAlta: string): string => {
        const date = new Date(fechaAlta);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Traducir objetivo de entrenamiento
    const translateObjective = (objetivo?: string | null): string => {
        if (!objetivo) return "No definido";
        return objetivo;
    };

    // Traducir experiencia
    const translateExperience = (exp?: string | null): string => {
        if (!exp) return "No especificada";
        return exp;
    };

    // Traducir frecuencia semanal
    const translateFrequency = (freq?: string | null): string => {
        if (!freq) return "No especificada";
        const translations: Record<string, string> = {
            "Baja": "1-2 veces por semana",
            "Media": "3-4 veces por semana",
            "Alta": "5-7 veces por semana",
        };
        return translations[freq] || freq;
    };

    // Traducir duración de sesión
    const translateSessionDuration = (duration?: string | null): string => {
        if (!duration) return "No especificada";
        const translations: Record<string, string> = {
            "short_lt_1h": "Menos de 1h",
            "medium_1h_to_1h30": "1h-1h30'",
            "long_gt_1h30": "Más de 1h30'",
        };
        return translations[duration] || duration;
    };

    // Días concretos (training_days) como "L, X, V"
    const formatTrainingDays = (days?: string[] | null): string => {
        if (!days || days.length === 0) return "—";
        return days
            .map((d) => TRAINING_DAY_LABELS[d as TrainingDayValue] ?? d)
            .join(", ");
    };

    return (
        <div className="bg-white border-b border-gray-200">
            {/* Breadcrumbs integrados */}
            {breadcrumbItems && breadcrumbItems.length > 0 && (
                <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-2">
                    <Breadcrumbs items={breadcrumbItems} />
                </div>
            )}

            <div className={`px-4 sm:px-6 lg:px-8 pb-6 ${breadcrumbItems ? 'pt-4' : 'pt-10'}`}>
                {/* Fila 1: Foto + Nombre + Métricas + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12 mb-6">
                    {/* Left: Foto + Info */}
                    <div className="flex items-start gap-4 flex-1">
                        {/* Profile Photo */}
                        <div className="flex-shrink-0">
                            <Avatar
                                nombre={client.nombre}
                                apellidos={client.apellidos}
                                size="lg"
                                variant="default"
                            />
                        </div>

                        {/* Client Info */}
                        <div className="flex-1">
                            {/* Nombre */}
                            <h1 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-2`}>
                                {client.nombre} {client.apellidos}
                            </h1>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-1 text-sm">
                                {/* Age */}
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Edad</span>
                                    <p className="text-gray-900 font-medium">
                                        {clientAge ? `${clientAge} años` : "—"}
                                    </p>
                                </div>

                                {/* Weight */}
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Peso</span>
                                    <p className="text-gray-900 font-medium">
                                        {client.peso ? `${client.peso} kg` : "—"}
                                    </p>
                                </div>

                                {/* Height */}
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Altura</span>
                                    <p className="text-gray-900 font-medium">
                                        {client.altura ? `${client.altura} cm` : "—"}
                                    </p>
                                </div>

                                {/* BMI */}
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>IMC</span>
                                    <p className="text-gray-900 font-medium">
                                        {client.imc ? client.imc.toFixed(1) : "—"}
                                    </p>
                                </div>

                                {/* Joined */}
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Fecha de Alta</span>
                                    <p className="text-gray-900 font-medium">
                                        {formatJoinedDate(client.fecha_alta)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions - Botones en columna */}
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/reports/generate?clientId=${client.id}`)}
                        >
                            Generar Reporte
                        </Button>
                        {onEditProfile && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onEditProfile}
                            >
                                Editar Perfil
                            </Button>
                        )}
                        {onAnthropometricData && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAnthropometricData}
                            >
                                Datos Antropométricos
                            </Button>
                        )}
                    </div>
                </div>

                {/* Línea azul debajo de Fila 1 */}
                <div className="border-b mb-4" style={{ borderColor: '#4A67B3' }}></div>

                {/* Fila 2: Objective + Experience + Frequency + Duration + Días/semana + Días concretos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
                    {/* Objective */}
                    <div>
                        <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Objetivo</span>
                        <p className="text-gray-900 font-medium">
                            {translateObjective(client.objetivo_entrenamiento)}
                        </p>
                    </div>

                    {/* Experience Level */}
                    <div>
                        <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Nivel de Experiencia</span>
                        <p className="text-gray-900 font-medium">
                            {translateExperience(client.experiencia)}
                        </p>
                    </div>

                    {/* Training Frequency */}
                    <div>
                        <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Frecuencia de Entrenamiento</span>
                        <p className="text-gray-900 font-medium">
                            {translateFrequency(client.frecuencia_semanal)}
                        </p>
                    </div>

                    {/* Session Durations */}
                    <div>
                        <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Duración de Sesiones</span>
                        <p className="text-gray-900 font-medium">
                            {translateSessionDuration(client.session_duration)}
                        </p>
                    </div>

                    {/* Días/semana exactos */}
                    <div>
                        <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Días/semana</span>
                        <p className="text-gray-900 font-medium">
                            {client.exact_training_frequency != null
                                ? `${client.exact_training_frequency} día${client.exact_training_frequency === 1 ? "" : "s"}/semana`
                                : "—"}
                        </p>
                    </div>

                    {/* Días concretos */}
                    <div>
                        <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Días concretos</span>
                        <p className="text-gray-900 font-medium">
                            {formatTrainingDays(client.training_days)}
                        </p>
                    </div>
                </div>

                {/* Línea azul debajo de Fila 2 */}
                <div className="border-b mb-4" style={{ borderColor: '#4A67B3' }}></div>

                {/* Fila 3: Notas */}
                {(client.notes_1 || client.notes_2 || client.notes_3 || client.observaciones || onEditProfile) && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Observaciones</span>
                            {onEditProfile && (
                                <button
                                    onClick={onEditProfile}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                >
                                    + Añadir Nota
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {client.notes_1 && (
                                <div>
                                    <span className="text-gray-500 text-xs uppercase tracking-wide block mb-1">Nota 1</span>
                                    <p className="text-gray-900 font-medium text-sm">{client.notes_1}</p>
                                </div>
                            )}
                            {client.notes_2 && (
                                <div>
                                    <span className="text-gray-500 text-xs uppercase tracking-wide block mb-1">Nota 2</span>
                                    <p className="text-gray-900 font-medium text-sm">{client.notes_2}</p>
                                </div>
                            )}
                            {client.notes_3 && (
                                <div>
                                    <span className="text-gray-500 text-xs uppercase tracking-wide block mb-1">Nota 3</span>
                                    <p className="text-gray-900 font-medium text-sm">{client.notes_3}</p>
                                </div>
                            )}
                            {client.observaciones && (
                                <div>
                                    <span className="text-gray-500 text-xs uppercase tracking-wide block mb-1">Observaciones</span>
                                    <p className="text-gray-900 font-medium text-sm">{client.observaciones}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
