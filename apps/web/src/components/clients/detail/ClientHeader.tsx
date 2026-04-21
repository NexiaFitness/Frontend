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
 * @updated 2026-04 - Preferencias: solo días de entreno (training_days); sin duplicar frecuencia enum ni exact_training_frequency.
 * @updated 2026-04 - Observaciones siempre visibles; texto en foreground; añadir nota inline + PUT (desde página con onSaveQuickNote).
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Client } from "@nexia/shared/types/client";
import { TRAINING_DAY_LABELS, type TrainingDayValue } from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { Textarea } from "@/components/ui/forms";
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
    /** Guardar nota rápida (notes_1…3 u observaciones) vía PUT /clients — sin navegar. */
    onSaveQuickNote?: (text: string) => Promise<boolean>;
    isSavingQuickNote?: boolean;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
    client,
    clientId: clientIdProp,
    onEditProfile,
    breadcrumbItems,
    hasActivePlan = false,
    onPlanificar,
    onOpenUseTemplate,
    onSaveQuickNote,
    isSavingQuickNote = false,
}) => {
    const navigate = useNavigate();
    const [quickNoteOpen, setQuickNoteOpen] = useState(false);
    const [quickNoteDraft, setQuickNoteDraft] = useState("");
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

    // Días de entreno (training_days), ej. "L, X, V"
    const formatTrainingDays = (days?: string[] | null): string => {
        if (!days || days.length === 0) return "—";
        return days
            .map((d) => TRAINING_DAY_LABELS[d as TrainingDayValue] ?? d)
            .join(", ");
    };

    const hasAnyNote = Boolean(
        (client.notes_1 ?? "").trim() ||
            (client.notes_2 ?? "").trim() ||
            (client.notes_3 ?? "").trim() ||
            (client.observaciones ?? "").trim()
    );

    const handleSaveQuickNote = async () => {
        if (!onSaveQuickNote || !quickNoteDraft.trim()) return;
        const ok = await onSaveQuickNote(quickNoteDraft);
        if (ok) {
            setQuickNoteDraft("");
            setQuickNoteOpen(false);
        }
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
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Objetivo</span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{translateObjective(client.objetivo_entrenamiento)}</p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Nivel de Experiencia</span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{translateExperience(client.experiencia)}</p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Duración sesiones</span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{translateSessionDuration(client.session_duration)}</p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Días de entreno</span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{formatTrainingDays(client.training_days)}</p>
                </div>
            </div>

            {/* Línea separadora */}
            <div className="border-b border-border" />

            {/* Observaciones / notas — siempre visible debajo del bloque de preferencias */}
            <div className="mb-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Observaciones
                    </span>
                    {onSaveQuickNote && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuickNoteOpen((o) => !o);
                                if (quickNoteOpen) setQuickNoteDraft("");
                            }}
                            className="text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                        >
                            {quickNoteOpen ? "Cerrar" : "+ Añadir nota"}
                        </button>
                    )}
                </div>

                {onSaveQuickNote && quickNoteOpen && (
                    <div className="mb-4 space-y-2 rounded-md border border-border bg-muted/30 p-3">
                        <Textarea
                            value={quickNoteDraft}
                            onChange={(e) => setQuickNoteDraft(e.target.value)}
                            placeholder="Escribe la nota…"
                            rows={3}
                            className="text-foreground"
                            disabled={isSavingQuickNote}
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                onClick={handleSaveQuickNote}
                                disabled={isSavingQuickNote || !quickNoteDraft.trim()}
                                isLoading={isSavingQuickNote}
                            >
                                Guardar
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setQuickNoteOpen(false);
                                    setQuickNoteDraft("");
                                }}
                                disabled={isSavingQuickNote}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {!hasAnyNote && (
                        <p className="text-sm text-foreground">Sin observaciones.</p>
                    )}
                    {client.notes_1?.trim() && (
                        <div>
                            <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
                                Nota 1
                            </span>
                            <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground">
                                {client.notes_1}
                            </p>
                        </div>
                    )}
                    {client.notes_2?.trim() && (
                        <div>
                            <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
                                Nota 2
                            </span>
                            <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground">
                                {client.notes_2}
                            </p>
                        </div>
                    )}
                    {client.notes_3?.trim() && (
                        <div>
                            <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
                                Nota 3
                            </span>
                            <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground">
                                {client.notes_3}
                            </p>
                        </div>
                    )}
                    {client.observaciones?.trim() && (
                        <div>
                            <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
                                Nota libre
                            </span>
                            <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground">
                                {client.observaciones}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
