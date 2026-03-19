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
import { ClientAvatar } from "@/components/ui/avatar";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";

interface ClientHeaderProps {
    client: Client;
    clientId?: number;
    onEditProfile?: () => void;
    breadcrumbItems?: BreadcrumbItem[];
    /** Fase 4.1: si el cliente tiene plan activo (para CTA Planificar: ir al tab vs abrir modal). */
    hasActivePlan?: boolean;
    /** Fase 4.1: CTA único "Planificar" — con plan → tab Planificación; sin plan → modal crear plan. */
    onPlanificar?: () => void;
    /** Fase 1.1: abrir flujo "Usar plantilla" (solo cuando no hay plan activo). */
    onOpenUseTemplate?: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
    client,
    clientId: clientIdProp,
    onEditProfile,
    breadcrumbItems,
    hasActivePlan = false,
    onPlanificar,
    onOpenUseTemplate,
}) => {
    const navigate = useNavigate();
    const clientId = clientIdProp ?? client.id;

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
        <div className="space-y-6">
            {/* Breadcrumbs — mismo formato que dashboard, sin wrapper div */}
            {breadcrumbItems && breadcrumbItems.length > 0 && (
                <Breadcrumbs items={breadcrumbItems} className="mb-1" />
            )}

            {/* Fila 1: Avatar | (Nombre + botones en la misma línea) | Subtítulo debajo */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex-shrink-0">
                    <ClientAvatar
                        clientId={client.id}
                        nombre={client.nombre}
                        apellidos={client.apellidos}
                        size="lg"
                    />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    {/* Nombre a la izquierda, botones a la derecha */}
                    <div className="flex flex-wrap items-center gap-3 gap-y-2">
                        <h1 className="text-2xl font-bold text-foreground">
                            {client.nombre} {client.apellidos}
                        </h1>
                        <div className="ml-auto flex flex-shrink-0 flex-row flex-wrap items-center gap-2">
                        {onPlanificar && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={onPlanificar}
                                aria-label="Planificar"
                            >
                                Planificar
                            </Button>
                        )}
                        {!hasActivePlan && onOpenUseTemplate && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onOpenUseTemplate}
                                aria-label="Usar plantilla"
                            >
                                Usar plantilla
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                navigate(
                                    `/dashboard/reports/generate?clientId=${clientId}`
                                )
                            }
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
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {[
                            clientAge != null && `${clientAge} años`,
                            client.peso != null && `${client.peso} kg`,
                            client.altura != null && `${client.altura} cm`,
                            client.imc != null && `IMC ${client.imc.toFixed(1)}`,
                            `Alta ${formatJoinedDate(client.fecha_alta)}`,
                        ]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>
                </div>
            </div>

            {/* Línea separadora */}
            <div className="border-b border-border" />

            {/* Preferencias de entrenamiento — contenido centrado por columna, títulos en una línea */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Objetivo</span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{translateObjective(client.objetivo_entrenamiento)}</p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Nivel de Experiencia</span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{translateExperience(client.experiencia)}</p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Frecuencia</span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{translateFrequency(client.frecuencia_semanal)}</p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Duración sesiones</span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{translateSessionDuration(client.session_duration)}</p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Días/semana</span>
                    <p className="mt-0.5 font-medium text-foreground break-words">
                        {client.exact_training_frequency != null
                            ? `${client.exact_training_frequency} día${client.exact_training_frequency === 1 ? "" : "s"}/semana`
                            : "—"}
                    </p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Días concretos</span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{formatTrainingDays(client.training_days)}</p>
                </div>
            </div>

            {/* Línea separadora */}
            <div className="border-b border-border" />

                {/* Fila 3: Notas */}
                {(client.notes_1 || client.notes_2 || client.notes_3 || client.observaciones || onEditProfile) && (
                    <div className="mb-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">Observaciones</span>
                            {onEditProfile && (
                                <button
                                    onClick={onEditProfile}
                                    className="text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                                >
                                    + Añadir Nota
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {client.notes_1 && (
                                <div>
                                    <span className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Nota 1</span>
                                    <p className="text-foreground font-medium text-sm">{client.notes_1}</p>
                                </div>
                            )}
                            {client.notes_2 && (
                                <div>
                                    <span className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Nota 2</span>
                                    <p className="text-foreground font-medium text-sm">{client.notes_2}</p>
                                </div>
                            )}
                            {client.notes_3 && (
                                <div>
                                    <span className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Nota 3</span>
                                    <p className="text-foreground font-medium text-sm">{client.notes_3}</p>
                                </div>
                            )}
                            {client.observaciones && (
                                <div>
                                    <span className="text-muted-foreground text-xs uppercase tracking-wide block mb-1">Observaciones</span>
                                    <p className="text-foreground font-medium text-sm">{client.observaciones}</p>
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
};
