/**
 * TrainingPlanHeader.tsx — Header del detalle del training plan
 *
 * Contexto:
 * - Misma estructura visual que ClientHeader: space-y-6, breadcrumbs, avatar + título + acciones,
 *   rejilla 6 columnas, separadores border-border, bloque de notas.
 * - Avatar: ClientAvatar cuando hay cliente asignado; iniciales del plan si no.
 *
 * @author Frontend Team
 * @since v3.3.0
 * @updated 2026-04 — Layout unificado con ClientDetail / ClientHeader (TabsBar fuera, en página).
 * @updated 2026-04 — Editar / Eliminar plan en barra fija inferior (TrainingPlanDetail), no en header.
 * @updated 2026-04 — Descripción / notas: añadir descripción inline (PUT description), sin duplicar “editar plan”.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    /** Guardar nota en description (append si ya hay texto) — PUT /training-plans/{id} */
    onSaveDescriptionNote?: (text: string) => Promise<boolean>;
    isSavingDescription?: boolean;
}

const statusLabels: Record<string, string> = {
    active: "Activo",
    completed: "Completado",
    paused: "Pausado",
    cancelled: "Cancelado",
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

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getDuration = (): string => {
        const start = new Date(plan.start_date);
        const end = new Date(plan.end_date);
        const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));

        if (weeks < 4) return `${weeks} semanas`;
        const months = Math.floor(weeks / 4);
        return `${months} ${months === 1 ? "mes" : "meses"}`;
    };

    const getStatusBadge = () => {
        const statusColors: Record<string, string> = {
            active: "bg-success/10 text-success border border-success/30",
            completed: "bg-primary/10 text-primary border border-primary/30",
            paused: "bg-warning/10 text-warning border border-warning/30",
            cancelled: "bg-destructive/10 text-destructive border border-destructive/30",
        };
        const color = statusColors[plan.status] || "bg-muted text-muted-foreground border border-border";
        const label = statusLabels[plan.status] || plan.status;
        return (
            <span className={`inline-flex shrink-0 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {label}
            </span>
        );
    };

    const statusLabelPlain = statusLabels[plan.status] || plan.status;

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

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex-shrink-0">
                    {plan.client_id && (client || clientName) ? (
                        <ClientAvatar
                            clientId={plan.client_id}
                            nombre={client?.nombre ?? clientName?.split(" ")[0]}
                            apellidos={client?.apellidos ?? clientName?.split(" ").slice(1).join(" ")}
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
                        {getStatusBadge()}
                        <div className="ml-auto flex flex-shrink-0 flex-row flex-wrap items-center gap-2">
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
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                        />
                                    </svg>
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
                    <p className="mt-0.5 font-medium text-foreground break-words">{statusLabelPlain}</p>
                </div>
                <div className="min-w-0 py-0.5 text-center">
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        Objetivo
                    </span>
                    <p className="mt-0.5 font-medium text-foreground break-words">{plan.goal ?? "—"}</p>
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
                <>
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
                </>
            )}

            <div className="border-b border-border" />

            <div className="mb-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Descripción / notas
                    </span>
                    {onSaveDescriptionNote && (
                        <button
                            type="button"
                            onClick={() => {
                                setDescriptionOpen((o) => {
                                    if (o) setDescriptionDraft("");
                                    return !o;
                                });
                            }}
                            className="text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                        >
                            {descriptionOpen ? "Cerrar" : "+ Añadir descripción"}
                        </button>
                    )}
                </div>

                {onSaveDescriptionNote && descriptionOpen && (
                    <div className="mb-4 space-y-2 rounded-md border border-border bg-muted/30 p-3">
                        <Textarea
                            value={descriptionDraft}
                            onChange={(e) => setDescriptionDraft(e.target.value)}
                            placeholder="Escribe la descripción…"
                            rows={3}
                            className="text-foreground"
                            disabled={isSavingDescription}
                        />
                        <div className="flex flex-wrap gap-2">
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
                                variant="outline"
                                onClick={() => {
                                    setDescriptionOpen(false);
                                    setDescriptionDraft("");
                                }}
                                disabled={isSavingDescription}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {hasDescription ? (
                        <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground">
                            {plan.description}
                        </p>
                    ) : (
                        <p className="text-sm text-foreground">Sin descripción.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
