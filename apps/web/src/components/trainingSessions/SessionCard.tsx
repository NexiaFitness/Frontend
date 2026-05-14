/**
 * SessionCard — Tarjeta de sesión de entrenamiento (lista en plan / cliente).
 *
 * Diseño: DESIGN.md §5.2 Card-7 (lista interactiva), Card-8 (avisos coherencia),
 * §5.1 jerarquía de Button. Métricas en superficie elevada (surface-2), sin hex raw.
 *
 * @author Frontend Team - NEXIA
 * @since v6.0.0
 */

import React, { useId } from "react";
import { AlertTriangle, Calendar, Copy } from "lucide-react";
import type { PlanTrainingSession } from "@nexia/shared";
import { isSessionDeletable, SESSION_TYPE_LABELS } from "@nexia/shared";
import type { TrainingSession as LegacyTrainingSession } from "@nexia/shared/types/training";
import type { SessionListItem } from "@nexia/shared/types/standaloneSessions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";

type SessionCardSession = PlanTrainingSession | LegacyTrainingSession | SessionListItem;

interface SessionCardProps {
    session: SessionCardSession;
    onEdit?: (session: SessionCardSession) => void;
    onDelete?: (session: SessionCardSession) => void;
    onViewDetail?: (session: SessionCardSession) => void;
    onReplicate?: (session: SessionCardSession) => void;
}

const COHERENCE_PREFIX = "[Coherence Warnings:";

/** Separa aviso embebido en `notes` (legacy/API) del texto libre del entrenador. */
function parseSessionNotes(notes: string | null | undefined): {
    coherenceBody: string | null;
    trainerNotes: string | null;
} {
    if (!notes?.trim()) {
        return { coherenceBody: null, trainerNotes: null };
    }
    const t = notes.trim();
    if (!t.startsWith(COHERENCE_PREFIX)) {
        return { coherenceBody: null, trainerNotes: t };
    }
    const closeIdx = t.indexOf("]", COHERENCE_PREFIX.length);
    if (closeIdx === -1) {
        return {
            coherenceBody: t.slice(COHERENCE_PREFIX.length).trim() || null,
            trainerNotes: null,
        };
    }
    const coherenceBody = t.slice(COHERENCE_PREFIX.length, closeIdx).trim() || null;
    const after = t.slice(closeIdx + 1).trim();
    return { coherenceBody, trainerNotes: after || null };
}

function sessionTypeLabel(sessionType: string): string {
    const map = SESSION_TYPE_LABELS as Record<string, string>;
    return map[sessionType] ?? sessionType;
}

interface MetricStatProps {
    label: string;
    value: string;
}

const MetricStat: React.FC<MetricStatProps> = ({ label, value }) => (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
        <p className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
        </p>
        <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
);

export const SessionCard: React.FC<SessionCardProps> = ({
    session,
    onEdit,
    onDelete,
    onViewDetail,
    onReplicate,
}) => {
    const titleId = useId();
    const { coherenceBody, trainerNotes } = parseSessionNotes(
        "notes" in session ? session.notes : undefined
    );

    const getStatusBadge = (status: string) => {
        const badges = {
            completed: {
                class: "bg-success/10 text-success border-success/30",
                label: "Completada",
            },
            planned: {
                class: "bg-primary/10 text-primary border-primary/30",
                label: "Planificada",
            },
            cancelled: {
                class: "bg-destructive/10 text-destructive border-destructive/30",
                label: "Cancelada",
            },
            in_progress: {
                class: "bg-warning/10 text-warning border-warning/30",
                label: "En progreso",
            },
            skipped: {
                class: "bg-muted text-muted-foreground border-border",
                label: "Saltada",
            },
            modified: {
                class: "bg-warning/10 text-warning border-warning/30",
                label: "Modificada",
            },
        };
        return badges[status as keyof typeof badges] ?? badges.planned;
    };

    const badge = getStatusBadge(session.status);
    const dateLabel = session.session_date
        ? new Date(session.session_date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : "Sin fecha";

    return (
        <article
            aria-labelledby={titleId}
            className={cn(
                "rounded-lg border border-border bg-card px-4 py-4 shadow",
                "transition-colors duration-150 ease-out",
                "hover:border-primary/30 hover:bg-surface"
            )}
        >
            {/* Cabecera: nombre, estado, meta */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4
                            id={titleId}
                            className="truncate text-base font-semibold text-foreground sm:text-lg"
                        >
                            {session.session_name}
                        </h4>
                        <span
                            className={cn(
                                "shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium",
                                badge.class
                            )}
                        >
                            {badge.label}
                        </span>
                        {"session_kind" in session && session.session_kind === "standalone" ? (
                            <span
                                className={cn(
                                    "shrink-0 rounded-md border border-border bg-muted/30 px-2 py-0.5",
                                    "text-xs font-medium text-muted-foreground"
                                )}
                            >
                                Sesión libre
                            </span>
                        ) : null}
                    </div>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                        <Calendar
                            className="size-4 shrink-0 text-primary"
                            aria-hidden
                        />
                        <span className="font-medium text-foreground/90">{dateLabel}</span>
                        <span className="text-muted-foreground" aria-hidden>
                            ·
                        </span>
                        <span>{sessionTypeLabel(session.session_type)}</span>
                    </p>
                </div>
            </div>

            {/* Métricas plan / real */}
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {session.planned_duration ? (
                    <MetricStat
                        label="Duración (plan)"
                        value={`${session.planned_duration} min`}
                    />
                ) : null}
                {session.actual_duration ? (
                    <MetricStat label="Duración (real)" value={`${session.actual_duration} min`} />
                ) : null}
                {"planned_intensity" in session &&
                (session as { planned_intensity?: number }).planned_intensity != null ? (
                    <MetricStat
                        label="Intensidad (plan)"
                        value={(session as { planned_intensity: number }).planned_intensity.toFixed(
                            1
                        )}
                    />
                ) : null}
                {"actual_intensity" in session &&
                (session as { actual_intensity?: number }).actual_intensity != null ? (
                    <MetricStat
                        label="Intensidad (real)"
                        value={(session as { actual_intensity: number }).actual_intensity.toFixed(1)}
                    />
                ) : null}
                {"planned_volume" in session &&
                (session as { planned_volume?: number }).planned_volume != null ? (
                    <MetricStat
                        label="Volumen (plan)"
                        value={(session as { planned_volume: number }).planned_volume.toString()}
                    />
                ) : null}
                {"actual_volume" in session &&
                (session as { actual_volume?: number }).actual_volume != null ? (
                    <MetricStat
                        label="Volumen (real)"
                        value={(session as { actual_volume: number }).actual_volume.toString()}
                    />
                ) : null}
            </div>

            {/* Coherencia (Card-8 DESIGN.md) */}
            {coherenceBody ? (
                <div
                    className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-4"
                    role="status"
                >
                    <div className="flex gap-3">
                        <AlertTriangle
                            className="size-5 shrink-0 text-warning"
                            aria-hidden
                        />
                        <div className="min-w-0 space-y-1">
                            <p className="text-[0.625rem] font-semibold uppercase tracking-wide text-warning">
                                Coherencia con el plan del día
                            </p>
                            <p className="text-sm leading-relaxed text-foreground">{coherenceBody}</p>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Notas del entrenador */}
            {trainerNotes ? (
                <div className="mt-4 rounded-lg border border-border bg-surface-2 p-3">
                    <p className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">
                        Notas
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{trainerNotes}</p>
                </div>
            ) : null}

            {/* Acciones — jerarquía: secundario → primario del bloque → destructivo */}
            {(onViewDetail ?? onEdit ?? onDelete ?? onReplicate) ? (
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:justify-end">
                    {onViewDetail ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onViewDetail(session)}
                            className="w-full sm:w-auto sm:min-w-[9rem]"
                        >
                            Ver detalles
                        </Button>
                    ) : null}
                    {onReplicate && "period_block_id" in session && session.period_block_id ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onReplicate(session)}
                            className="w-full sm:w-auto sm:min-w-[9rem]"
                        >
                            <Copy className="mr-1.5 h-4 w-4" />
                            Replicar
                        </Button>
                    ) : null}
                    {onEdit ? (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onEdit(session)}
                            className="w-full sm:w-auto sm:min-w-[9rem]"
                        >
                            Editar sesión
                        </Button>
                    ) : null}
                    {onDelete && isSessionDeletable(session) ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(session)}
                            className="w-full sm:w-auto sm:min-w-[9rem]"
                            aria-label={`Eliminar sesión ${session.session_name}`}
                        >
                            Eliminar
                        </Button>
                    ) : null}
                </div>
            ) : null}
        </article>
    );
};
