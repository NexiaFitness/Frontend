/**
 * SessionCard — Tarjeta de sesión (lista en plan / cliente).
 *
 * Patrón visual alineado con PeriodBlockCard y SISTEMA_DISENO:
 * borde izquierdo semántico, cabecera con acento, métricas en franja surface-2.
 */

import React, { useId } from "react";
import { AlertTriangle, Calendar, ChevronRight, Copy, Pencil, Timer, Trash2, Zap } from "lucide-react";
import type { PlanTrainingSession } from "@nexia/shared";
import { useGetSessionRecommendationsQuery } from "@nexia/shared/api/trainingSessionsApi";
import { isSessionDeletable, SESSION_TYPE_LABELS } from "@nexia/shared";
import type { SessionRecommendationsResponse } from "@nexia/shared/types/sessionRecommendations";
import { PatternBadge } from "@/components/trainingPlans/periodization/PatternBadge";
import type { TrainingSession as LegacyTrainingSession } from "@nexia/shared/types/training";
import type { SessionListItem } from "@nexia/shared/types/standaloneSessions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import { LoadScaleMetric } from "@/components/ui/indicators";

type SessionCardSession = PlanTrainingSession | LegacyTrainingSession | SessionListItem;

interface SessionCardProps {
    session: SessionCardSession;
    onEdit?: (session: SessionCardSession) => void;
    onDelete?: (session: SessionCardSession) => void;
    onViewDetail?: (session: SessionCardSession) => void;
    onReplicate?: (session: SessionCardSession) => void;
}

const COHERENCE_NOTE_PREFIXES = ["[Avisos de coherencia:", "[Coherence Warnings:"] as const;

const blockIconBtn =
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors";

type StatusAccent = {
    borderL: string;
    dot: string;
    headerBorder: string;
    headerBg: string;
    badge: string;
    hoverShadow: string;
    label: string;
};

const STATUS_ACCENT: Record<string, StatusAccent> = {
    planned: {
        borderL: "border-l-primary",
        dot: "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.55)]",
        headerBorder: "border-primary/20",
        headerBg: "bg-primary/[0.06]",
        badge: "border-primary/30 bg-primary/10 text-primary",
        hoverShadow: "hover:shadow-[0_0_24px_-14px_hsl(var(--primary)/0.4)]",
        label: "Planificada",
    },
    completed: {
        borderL: "border-l-success",
        dot: "bg-success shadow-[0_0_6px_hsl(var(--success)/0.55)]",
        headerBorder: "border-success/20",
        headerBg: "bg-success/[0.06]",
        badge: "border-success/30 bg-success/10 text-success",
        hoverShadow: "hover:shadow-[0_0_24px_-14px_hsl(var(--success)/0.35)]",
        label: "Completada",
    },
    cancelled: {
        borderL: "border-l-destructive",
        dot: "bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.55)]",
        headerBorder: "border-destructive/20",
        headerBg: "bg-destructive/[0.06]",
        badge: "border-destructive/30 bg-destructive/10 text-destructive",
        hoverShadow: "hover:shadow-[0_0_24px_-14px_hsl(var(--destructive)/0.35)]",
        label: "Cancelada",
    },
    in_progress: {
        borderL: "border-l-warning",
        dot: "bg-warning shadow-[0_0_6px_hsl(var(--warning)/0.55)]",
        headerBorder: "border-warning/20",
        headerBg: "bg-warning/[0.06]",
        badge: "border-warning/30 bg-warning/10 text-warning",
        hoverShadow: "hover:shadow-[0_0_24px_-14px_hsl(var(--warning)/0.35)]",
        label: "En progreso",
    },
    skipped: {
        borderL: "border-l-border",
        dot: "bg-muted-foreground",
        headerBorder: "border-border",
        headerBg: "bg-muted/20",
        badge: "border-border bg-muted/30 text-muted-foreground",
        hoverShadow: "hover:border-border/80",
        label: "Saltada",
    },
    modified: {
        borderL: "border-l-warning",
        dot: "bg-warning shadow-[0_0_6px_hsl(var(--warning)/0.55)]",
        headerBorder: "border-warning/20",
        headerBg: "bg-warning/[0.06]",
        badge: "border-warning/30 bg-warning/10 text-warning",
        hoverShadow: "hover:shadow-[0_0_24px_-14px_hsl(var(--warning)/0.35)]",
        label: "Modificada",
    },
};

const DEFAULT_ACCENT = STATUS_ACCENT.planned;

function findCoherenceNotesPrefix(notes: string): (typeof COHERENCE_NOTE_PREFIXES)[number] | null {
    for (const prefix of COHERENCE_NOTE_PREFIXES) {
        if (notes.startsWith(prefix)) {
            return prefix;
        }
    }
    return null;
}

function parseSessionNotes(notes: string | null | undefined): {
    coherenceBody: string | null;
    trainerNotes: string | null;
} {
    if (!notes?.trim()) {
        return { coherenceBody: null, trainerNotes: null };
    }
    const t = notes.trim();
    const prefix = findCoherenceNotesPrefix(t);
    if (!prefix) {
        return { coherenceBody: null, trainerNotes: t };
    }
    const closeIdx = t.indexOf("]", prefix.length);
    if (closeIdx === -1) {
        return {
            coherenceBody: t.slice(prefix.length).trim() || null,
            trainerNotes: null,
        };
    }
    const coherenceBody = t.slice(prefix.length, closeIdx).trim() || null;
    const after = t.slice(closeIdx + 1).trim();
    return { coherenceBody, trainerNotes: after || null };
}

function sessionTypeLabel(sessionType: string): string {
    const map = SESSION_TYPE_LABELS as Record<string, string>;
    return map[sessionType] ?? sessionType;
}

function sessionPlanningContext(
    session: SessionCardSession
): { clientId: number; sessionDate: string; trainerId: number } | null {
    if ("session_kind" in session && session.session_kind === "standalone") {
        return null;
    }
    const s = session as PlanTrainingSession;
    if (!s.client_id || !s.session_date || !s.trainer_id) {
        return null;
    }
    return {
        clientId: s.client_id,
        sessionDate: s.session_date,
        trainerId: s.trainer_id,
    };
}

function DurationMetric({
    label,
    minutes,
}: {
    label: string;
    minutes: number;
}) {
    return (
        <div className="min-w-0 flex-1 basis-[min(100%,8rem)] py-0.5">
            <p className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{minutes} min</p>
        </div>
    );
}

/** Duración (plan) + patrones del día — patrón ContextStripShell, solo en SessionCard. */
function SessionCardPlanContextStrip({
    minutes,
    clientId,
    sessionDate,
    trainerId,
}: {
    minutes: number;
    clientId: number;
    sessionDate: string;
    trainerId: number;
}) {
    const { data, isLoading } = useGetSessionRecommendationsQuery(
        { client_id: clientId, session_date: sessionDate, trainer_id: trainerId },
        { skip: !clientId || !sessionDate || !trainerId }
    );

    const response = data as SessionRecommendationsResponse | undefined;
    const patterns = response?.recommendations?.movement_patterns;
    const showPatterns =
        isLoading ||
        (response?.has_active_plan &&
            response?.has_planned_values &&
            patterns !== null &&
            patterns !== undefined);

    return (
        <section
            aria-label="Plan del día"
            className={cn(
                "min-w-0 w-full flex-[2] basis-full sm:basis-[min(100%,20rem)]",
                "rounded-lg border border-primary/45 bg-primary/[0.08]",
                "flex flex-col gap-4 px-4 py-4 md:flex-row md:items-stretch md:gap-5"
            )}
        >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden>
                        <Timer className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                        Duración (plan)
                    </span>
                </div>
                <p className="text-sm font-semibold tabular-nums text-primary">{minutes} min</p>
            </div>

            {showPatterns ? (
                <>
                    <span
                        className="hidden md:block w-px shrink-0 self-stretch bg-primary/45"
                        aria-hidden
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden>
                                <Zap className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                                Patrones
                            </span>
                        </div>
                        {isLoading ? (
                            <div className="h-6 w-36 max-w-full animate-pulse rounded bg-muted/40" />
                        ) : patterns!.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Sin patrones asignados</p>
                        ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                                {patterns!.map((p) => (
                                    <PatternBadge
                                        key={p.id}
                                        as="span"
                                        name={
                                            p.sub_pattern
                                                ? `${p.name_es} — ${p.sub_pattern}`
                                                : p.name_es
                                        }
                                        uiBucket={p.ui_bucket}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </section>
    );
}

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

    const accent = STATUS_ACCENT[session.status] ?? DEFAULT_ACCENT;

    const dateLabel = session.session_date
        ? new Date(session.session_date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
          })
        : "Sin fecha";

    const typeLabel = sessionTypeLabel(session.session_type);
    const isStandalone = "session_kind" in session && session.session_kind === "standalone";
    const planningCtx = sessionPlanningContext(session);

    const plannedIntensity =
        "planned_intensity" in session
            ? (session as { planned_intensity?: number | null }).planned_intensity
            : null;
    const actualIntensity =
        "actual_intensity" in session
            ? (session as { actual_intensity?: number | null }).actual_intensity
            : null;
    const plannedVolume =
        "planned_volume" in session
            ? (session as { planned_volume?: number | null }).planned_volume
            : null;
    const actualVolume =
        "actual_volume" in session
            ? (session as { actual_volume?: number | null }).actual_volume
            : null;

    const hasLoadMetrics =
        plannedVolume != null ||
        actualVolume != null ||
        plannedIntensity != null ||
        actualIntensity != null;
    const hasMetrics =
        session.planned_duration != null ||
        session.actual_duration != null ||
        hasLoadMetrics;

    const hasHeaderActions = !!(
        onViewDetail ||
        onEdit ||
        (onDelete && isSessionDeletable(session))
    );
    const hasFooterActions = !!(onEdit ?? onDelete ?? onReplicate);

    return (
        <article
            aria-labelledby={titleId}
            className={cn(
                "w-full overflow-hidden rounded-lg border border-border/60 border-l-[3px] bg-surface shadow-sm",
                "transition-all duration-150 ease-out hover:border-primary/40",
                accent.borderL,
                accent.hoverShadow
            )}
        >
            <div
                className={cn(
                    "flex items-start justify-between gap-3 border-b px-5 py-3.5",
                    accent.headerBorder,
                    accent.headerBg
                )}
            >
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    <span
                        className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", accent.dot)}
                        aria-hidden
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4
                                id={titleId}
                                className="truncate text-sm font-semibold text-foreground sm:text-base"
                            >
                                {session.session_name}
                            </h4>
                            <span
                                className={cn(
                                    "inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                                    accent.badge
                                )}
                            >
                                {accent.label}
                            </span>
                            {isStandalone ? (
                                <span className="inline-flex shrink-0 items-center rounded-md border border-border/60 bg-surface/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                    Sesión libre
                                </span>
                            ) : null}
                        </div>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <Calendar className="size-3.5 shrink-0 text-primary" aria-hidden />
                            <span className="font-medium text-foreground/90">{dateLabel}</span>
                            <span aria-hidden>·</span>
                            <span>{typeLabel}</span>
                        </p>
                    </div>
                </div>

                {hasHeaderActions ? (
                    <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
                        {onViewDetail ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewDetail(session)}
                                className="shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
                            >
                                Ver detalles
                                <ChevronRight className="ml-0.5 h-4 w-4" aria-hidden />
                            </Button>
                        ) : null}
                        {onEdit || (onDelete && isSessionDeletable(session)) ? (
                            <div className="flex items-center gap-1.5">
                                {onEdit ? (
                                    <button
                                        type="button"
                                        onClick={() => onEdit(session)}
                                        className={cn(
                                            blockIconBtn,
                                            "border-primary/30 bg-primary/10 text-primary",
                                            "hover:border-primary/45 hover:bg-primary/20"
                                        )}
                                        aria-label={`Editar sesión ${session.session_name}`}
                                    >
                                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                                    </button>
                                ) : null}
                                {onDelete && isSessionDeletable(session) ? (
                                    <button
                                        type="button"
                                        onClick={() => onDelete(session)}
                                        className={cn(
                                            blockIconBtn,
                                            "border-destructive/30 bg-destructive/10 text-destructive",
                                            "hover:border-destructive/45 hover:bg-destructive/20"
                                        )}
                                        aria-label={`Eliminar sesión ${session.session_name}`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                    </button>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>

            <div className="flex w-full flex-col gap-4 px-5 py-4">
                {hasMetrics ? (
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
                        {session.planned_duration != null && planningCtx ? (
                            <SessionCardPlanContextStrip
                                minutes={session.planned_duration}
                                clientId={planningCtx.clientId}
                                sessionDate={planningCtx.sessionDate}
                                trainerId={planningCtx.trainerId}
                            />
                        ) : session.planned_duration != null ? (
                            <div className="min-w-0 flex-[2] basis-full sm:basis-[min(100%,12rem)] rounded-lg border border-primary/30 bg-primary/10 p-3">
                                <p className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">
                                    Duración (plan)
                                </p>
                                <p className="mt-1 text-sm font-semibold tabular-nums text-primary">
                                    {session.planned_duration} min
                                </p>
                            </div>
                        ) : null}
                        {session.actual_duration != null ? (
                            <DurationMetric
                                label="Duración (real)"
                                minutes={session.actual_duration}
                            />
                        ) : null}
                        {plannedVolume != null ? (
                            <LoadScaleMetric
                                variant="volume"
                                value={plannedVolume}
                                label="Volumen (plan)"
                                compact
                            />
                        ) : null}
                        {actualVolume != null ? (
                            <LoadScaleMetric
                                variant="volume"
                                value={actualVolume}
                                label="Volumen (real)"
                                compact
                            />
                        ) : null}
                        {plannedIntensity != null ? (
                            <LoadScaleMetric
                                variant="intensity"
                                value={plannedIntensity}
                                label="Intensidad (plan)"
                                compact
                            />
                        ) : null}
                        {actualIntensity != null ? (
                            <LoadScaleMetric
                                variant="intensity"
                                value={actualIntensity}
                                label="Intensidad (real)"
                                compact
                            />
                        ) : null}
                    </div>
                ) : null}

                {coherenceBody ? (
                    <div
                        className="w-full rounded-lg border border-warning/30 bg-warning/[0.06] p-3.5"
                        role="status"
                    >
                        <div className="flex gap-3">
                            <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden />
                            <div className="min-w-0 space-y-1">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-warning">
                                    Coherencia con el plan del día
                                </p>
                                <p className="text-sm leading-relaxed text-foreground">
                                    {coherenceBody}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {trainerNotes ? (
                    <div className="w-full rounded-lg border border-border/60 bg-surface/80 px-3.5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Notas
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {trainerNotes}
                        </p>
                    </div>
                ) : null}

                {hasFooterActions ? (
                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                        {onReplicate && "period_block_id" in session && session.period_block_id ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onReplicate(session)}
                                className="w-full sm:w-auto"
                            >
                                <Copy className="mr-1 h-4 w-4" aria-hidden />
                                Replicar
                            </Button>
                        ) : null}
                        {onEdit ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onEdit(session)}
                                className="w-full sm:w-auto"
                            >
                                Editar sesión
                            </Button>
                        ) : null}
                        {onDelete && isSessionDeletable(session) ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(session)}
                                className="w-full sm:w-auto"
                            >
                                Eliminar
                            </Button>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </article>
    );
};
