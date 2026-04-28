/**
 * TrainingPlanHeader.tsx — Header del detalle del training plan
 *
 * Contexto:
 * - Misma estructura visual que ClientHeader: space-y-6, breadcrumbs, avatar + título + acciones,
 *   rejilla 6 columnas, separadores border-border.
 * - Descripción inline: mínima huella visual. Solo ocupa espacio cuando el editor está abierto.
 *
 * @author Frontend Team
 * @since v3.3.0
 * @updated 2026-04 — Layout unificado con ClientDetail / ClientHeader (TabsBar fuera, en página).
 * @updated 2026-04 — Editar / Eliminar plan en barra fija inferior (TrainingPlanDetail), no en header.
 * @updated 2026-04 — Descripción inline compact: sin label pesado, sin "Sin descripción.", sin borde caja.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import type { TrainingPlan } from "@nexia/shared/types/training";
import type { Client } from "@nexia/shared/types/client";
import { getClientInitials } from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { Textarea } from "@/components/ui/forms";
import { ClientAvatar } from "@/components/ui/avatar";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";

interface TrainingPlanHeaderProps {
    plan: TrainingPlan;
    /** Cliente asignado — datos para ClientAvatar y subtítulo */
    client?: Client | null;
    clientName?: string;
    breadcrumbItems: BreadcrumbItem[];
    /** Abre el modal de asignar plan a cliente (desde detalle) */
    onAssignPlan?: () => void;
    /** Si existe, muestra botón "Volver al cliente" */
    volverAlClienteClientId?: number;
    /** Guardar nota en description — PUT /training-plans/{id} */
    onSaveDescriptionNote?: (text: string) => Promise<boolean>;
    isSavingDescription?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
    active: "Activo",
    completed: "Completado",
    paused: "Pausado",
    cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
    active: "bg-success/10 text-success border border-success/30",
    completed: "bg-primary/10 text-primary border border-primary/30",
    paused: "bg-warning/10 text-warning border border-warning/30",
    cancelled: "bg-destructive/10 text-destructive border border-destructive/30",
};

export const TrainingPlanHeader: React.FC<TrainingPlanHeaderProps> = ({
    plan,
    client,
    clientName,
    breadcrumbItems,
    onAssignPlan,
    volverAlClienteClientId,
    onSaveDescriptionNote,
    isSavingDescription = false,
}) => {
    const navigate = useNavigate();
    const [descriptionOpen, setDescriptionOpen] = useState(false);
    const [descriptionDraft, setDescriptionDraft] = useState("");

    const displayClientName = client
        ? `${client.nombre} ${client.apellidos}`
        : clientName;

    const formatDate = (dateStr: string): string =>
        new Date(dateStr).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    const getDuration = (): string => {
        const start = new Date(plan.start_date);
        const end = new Date(plan.end_date);
        const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
        if (weeks < 4) return `${weeks} semanas`;
        const months = Math.floor(weeks / 4);
        return `${months} ${months === 1 ? "mes" : "meses"}`;
    };

    const statusColor =
        STATUS_COLORS[plan.status] ?? "bg-muted text-muted-foreground border border-border";
    const statusLabel = STATUS_LABELS[plan.status] ?? plan.status;

    const descTrimmed = (plan.description ?? "").trim();
    const hasDescription = Boolean(descTrimmed);

    const handleSaveDescription = async () => {
        if (!onSaveDescriptionNote || !descriptionDraft.trim()) return;
        const ok = await onSaveDescriptionNote(descriptionDraft);
        if (ok) {
            setDescriptionDraft("");
            setDescriptionOpen(false);
        }
    };

    const openEditor = () => {
        setDescriptionDraft(hasDescription ? descTrimmed : "");
        setDescriptionOpen(true);
    };

    const closeEditor = () => {
        setDescriptionOpen(false);
        setDescriptionDraft("");
    };

    const subtitleParts = [
        `${formatDate(plan.start_date)} – ${formatDate(plan.end_date)}`,
        getDuration(),
        displayClientName ?? "Sin cliente asignado",
    ];

    return (
        <div className="space-y-6">
            {breadcrumbItems.length > 0 && (
                <Breadcrumbs items={breadcrumbItems} className="mb-1" />
            )}

            {/* Avatar + nombre + acciones */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex-shrink-0">
                    {plan.client_id && (client || clientName) ? (
                        <ClientAvatar
                            clientId={plan.client_id}
                            nombre={client?.nombre ?? clientName?.split(" ")[0]}
                            apellidos={
                                client?.apellidos ?? clientName?.split(" ").slice(1).join(" ")
                            }
                            size="lg"
                        />
                    ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground shadow-md text-base">
                            {getClientInitials(plan.name, null)}
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-3 gap-y-2">
                        <h1 className="text-2xl font-bold text-foreground">{plan.name}</h1>
                        <span
                            className={`inline-flex shrink-0 px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                        >
                            {statusLabel}
                        </span>

                        <div className="ml-auto flex shrink-0 flex-row flex-wrap items-center gap-2">
                            {volverAlClienteClientId != null && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        navigate(
                                            `/dashboard/clients/${volverAlClienteClientId}?tab=planificacion`
                                        )
                                    }
                                    aria-label="Volver al cliente"
                                >
                                    <ArrowLeft className="size-4" />
                                    Volver al cliente
                                </Button>
                            )}
                            {onAssignPlan && (
                                <Button variant="primary" size="sm" onClick={onAssignPlan}>
                                    Asignar a cliente
                                </Button>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{subtitleParts.join(" · ")}</p>
                </div>
            </div>

            <div className="border-b border-border" />

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Inicio
                    </span>
                    <p className="mt-0.5 font-medium text-foreground break-words">
                        {formatDate(plan.start_date)}
                    </p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Fin
                    </span>
                    <p className="mt-0.5 font-medium text-foreground break-words">
                        {formatDate(plan.end_date)}
                    </p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Duración total
                    </span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{getDuration()}</p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Estado
                    </span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{statusLabel}</p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Objetivo
                    </span>
                    <p className="mt-0.5 font-medium text-foreground break-words">
                        {plan.goal ?? "—"}
                    </p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Atleta
                    </span>
                    {plan.client_id ? (
                        <Link
                            to={`/dashboard/clients/${plan.client_id}`}
                            className="mt-0.5 block break-words font-medium text-primary hover:underline"
                        >
                            {displayClientName ?? "Ver perfil"}
                        </Link>
                    ) : (
                        <p className="mt-0.5 font-medium text-foreground break-words">—</p>
                    )}
                </div>
            </div>

            {plan.tags && plan.tags.length > 0 && (
                <div>
                    <span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">
                        Etiquetas
                    </span>
                    <div className="flex flex-wrap gap-1">
                        {plan.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="border-b border-border" />

            {/* Descripción — inline compact */}
            <div>
                {descriptionOpen ? (
                    /* Editor abierto */
                    <div className="space-y-2">
                        <Textarea
                            value={descriptionDraft}
                            onChange={(e) => setDescriptionDraft(e.target.value)}
                            placeholder="Descripción o notas del plan…"
                            rows={3}
                            disabled={isSavingDescription}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="primary"
                                onClick={handleSaveDescription}
                                disabled={isSavingDescription || !descriptionDraft.trim()}
                                isLoading={isSavingDescription}
                            >
                                Guardar
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={closeEditor}
                                disabled={isSavingDescription}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : hasDescription ? (
                    /* Descripción existente — con botón editar on hover */
                    <div className="group flex items-start gap-2">
                        <p className="flex-1 whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                            {plan.description}
                        </p>
                        {onSaveDescriptionNote && (
                            <button
                                type="button"
                                onClick={openEditor}
                                className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground/40 transition-colors hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label="Editar descripción"
                            >
                                <Pencil className="size-3.5" />
                            </button>
                        )}
                    </div>
                ) : (
                    /* Sin descripción — link sutil */
                    onSaveDescriptionNote && (
                        <button
                            type="button"
                            onClick={openEditor}
                            className="text-xs text-muted-foreground/50 transition-colors hover:text-primary"
                        >
                            + Añadir descripción
                        </button>
                    )
                )}
            </div>
        </div>
    );
};
