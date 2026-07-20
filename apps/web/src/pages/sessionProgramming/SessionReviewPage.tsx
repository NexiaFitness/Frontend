/**
 * SessionReviewPage.tsx — Revisión post-creación/edición de sesión
 *
 * Enfoque UX: alineación con el plan (coherencia + validación), no listado de ejercicios.
 * Los ejercicios se consultan en el detalle de sesión (footer).
 *
 * @author Frontend Team
 * @since v6.5.0
 * @updated v6.6.0 — Layout review grid (DESIGN.md / PeriodBlockCard)
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    ChevronRight,
    ArrowLeft,
    Pencil,
    CalendarPlus,
    AlertTriangle,
    CheckCircle2,
    Copy,
    Eye,
    Trash2,
} from "lucide-react";

import {
    useGetTrainingSessionQuery,
    useGetSessionCoherenceQuery,
    useDeleteTrainingSessionMutation,
    useGetTrainingSessionsQuery,
} from "@nexia/shared/api/trainingSessionsApi";
import { useGetPeriodBlocksQuery } from "@nexia/shared/api/periodBlocksApi";
import { useGetWeeklyStructureQuery } from "@nexia/shared/api/weeklyStructureApi";
import { suggestNextSessionDateAfter } from "@nexia/shared";
import { useValidateSessionMutation } from "@nexia/shared/api/sessionValidationApi";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import {
    SESSION_TYPE_LABELS,
    TRAINING_SESSION_STATUS_LABELS,
} from "@nexia/shared/types/trainingSessions";
import type { TrainingSessionStatus } from "@nexia/shared/types/trainingSessions";

import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert, useToast } from "@/components/ui/feedback";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { SessionValidationContent } from "@/components/sessionProgramming/SessionValidationContent";
import { ClientAvatar } from "@/components/ui/avatar";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { ReplicateSessionModal } from "@/components/sessions/ReplicateSessionModal";
import { ReplicateSessionConflictModal } from "@/components/sessions/ReplicateSessionConflictModal";
import { useReplicateSessionFlow } from "@/components/sessions/useReplicateSessionFlow";
import { readReviewBackTarget, returnToStateFromView } from "@/lib/sessionDetailNavigation";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY } from "@/utils/typography";

const SUMMARY_SHELL =
    "rounded-lg border border-border/60 border-l-[3px] border-l-primary bg-surface shadow-sm overflow-hidden";

function statusBadgeClasses(status: string): string {
    switch (status) {
        case "completed":
            return "bg-success/10 text-success border-success/30";
        case "planned":
            return "bg-primary/10 text-primary border-primary/30";
        case "skipped":
            return "bg-destructive/10 text-destructive border-destructive/30";
        case "modified":
            return "bg-warning/10 text-warning border-warning/30";
        default:
            return "bg-secondary text-secondary-foreground border-border";
    }
}

function formatDuration(min: number | null): string {
    if (min == null) return "—";
    return `${min} min`;
}

function formatMetric(v: number | null): string {
    if (v == null) return "—";
    return String(v);
}

function addOneLocalDay(dateISO: string): string | null {
    const parts = dateISO.split("-").map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
    const [y, m, d] = parts;
    const dt = new Date(y, m - 1, d);
    if (Number.isNaN(dt.getTime())) return null;
    dt.setDate(dt.getDate() + 1);
    const ny = dt.getFullYear();
    const nm = String(dt.getMonth() + 1).padStart(2, "0");
    const nd = String(dt.getDate()).padStart(2, "0");
    return `${ny}-${nm}-${nd}`;
}

const COHERENCE_NOTE_PREFIXES = ["[Avisos de coherencia:", "[Coherence Warnings:"] as const;

function parseSessionNotes(notes: string | null | undefined): {
    coherenceBody: string | null;
    trainerNotes: string | null;
} {
    if (!notes?.trim()) {
        return { coherenceBody: null, trainerNotes: null };
    }
    const t = notes.trim();
    for (const prefix of COHERENCE_NOTE_PREFIXES) {
        if (t.startsWith(prefix)) {
            const closeIdx = t.indexOf("]", prefix.length);
            if (closeIdx === -1) {
                return {
                    coherenceBody: t.slice(prefix.length).trim() || null,
                    trainerNotes: null,
                };
            }
            const body = t.slice(prefix.length, closeIdx).trim() || null;
            const rest = t.slice(closeIdx + 1).trim();
            return { coherenceBody: body, trainerNotes: rest || null };
        }
    }
    return { coherenceBody: null, trainerNotes: t };
}

function PlanActualMetric({
    label,
    planned,
    actual,
    accentClass,
}: {
    label: string;
    planned: string;
    actual: string;
    accentClass: string;
}) {
    const hasActual = actual !== "—";
    return (
        <div className="flex flex-col gap-1 min-w-0 rounded-md border border-border/60 bg-surface/80 px-2.5 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
            </span>
            <div className="space-y-0.5 text-xs tabular-nums">
                <p className="text-muted-foreground">
                    Programado:{" "}
                    <span className="font-medium text-foreground">{planned}</span>
                </p>
                <p className={hasActual ? accentClass : "text-muted-foreground"}>
                    Registrado:{" "}
                    <span className={cn("font-semibold", hasActual ? "text-foreground" : "")}>
                        {actual}
                    </span>
                </p>
            </div>
        </div>
    );
}

const SessionReviewHeader: React.FC<{
    session: {
        session_name: string;
        status: string;
        session_type: string;
        client_id: number;
    };
    onBack: () => void;
    onSchedule: () => void;
}> = ({ session, onBack, onSchedule }) => {
    const { data: client, isLoading: isLoadingClient } = useGetClientQuery(session.client_id, {
        skip: !session.client_id,
    });

    const statusLabel =
        TRAINING_SESSION_STATUS_LABELS[session.status as TrainingSessionStatus] ?? session.status;

    return (
        <div className="space-y-4">
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <button type="button" onClick={onBack} className="hover:text-foreground transition-colors">
                    Sesiones
                </button>
                <ChevronRight className="size-4 shrink-0" aria-hidden />
                <span className="truncate max-w-[200px] sm:max-w-xs text-foreground font-medium">
                    {session.session_name}
                </span>
                <ChevronRight className="size-4 shrink-0" aria-hidden />
                <span className="text-foreground font-medium">Revisión</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                {isLoadingClient ? (
                    <div className="size-16 rounded-full bg-surface-2 animate-pulse shrink-0" />
                ) : client ? (
                    <ClientAvatar
                        clientId={client.id}
                        nombre={client.nombre}
                        apellidos={client.apellidos}
                        size="lg"
                        className="shrink-0"
                    />
                ) : null}

                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                        <h1 className={cn(TYPOGRAPHY.detailPageTitle, "text-foreground")}>
                            {session.session_name}
                        </h1>
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold",
                                statusBadgeClasses(session.status)
                            )}
                        >
                            {session.status === "completed" ? (
                                <CheckCircle2 className="size-3.5" aria-hidden />
                            ) : null}
                            {statusLabel}
                        </span>
                    </div>
                    {client ? (
                        <p className="text-sm text-muted-foreground">
                            {[client.nombre, client.apellidos, client.objetivo_entrenamiento]
                                .filter(Boolean)
                                .join(" · ")}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Button variant="outline" size="sm" onClick={onBack}>
                        <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                        Volver
                    </Button>
                    <Button variant="primary" size="sm" onClick={onSchedule}>
                        <CalendarPlus className="mr-1 h-4 w-4" aria-hidden />
                        Programar siguiente
                    </Button>
                </div>
            </div>
        </div>
    );
};

const CoherenceAlertsPanel: React.FC<{
    warnings: Array<{ message: string }>;
}> = ({ warnings }) => {
    if (warnings.length === 0) return null;

    return (
        <section
            className="rounded-lg border border-warning/30 border-l-[3px] border-l-warning bg-warning/10 overflow-hidden"
            aria-label="Avisos de coherencia"
        >
            <div className="flex items-center gap-2 border-b border-warning/20 px-4 py-3">
                <AlertTriangle className="size-4 text-warning shrink-0" aria-hidden />
                <h2 className="text-sm font-semibold text-foreground">Avisos de coherencia</h2>
                <span className="ml-auto rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-warning">
                    {warnings.length}
                </span>
            </div>
            <ul className="space-y-2 px-4 py-3">
                {warnings.map((w, i) => (
                    <li
                        key={i}
                        className="text-sm leading-relaxed text-foreground before:mr-2 before:text-warning before:content-['•']"
                    >
                        {w.message}
                    </li>
                ))}
            </ul>
        </section>
    );
};

const SessionPlanSummaryCard: React.FC<{
    session: {
        session_date: string | null;
        session_time?: string | null;
        session_type: string;
        planned_duration: number | null;
        actual_duration: number | null;
        planned_intensity: number | null;
        actual_intensity: number | null;
        planned_volume: number | null;
        actual_volume: number | null;
        notes: string | null;
    };
}> = ({ session }) => {
    const typeLabel =
        SESSION_TYPE_LABELS[session.session_type as keyof typeof SESSION_TYPE_LABELS] ??
        session.session_type;
    const { trainerNotes } = parseSessionNotes(session.notes);

    return (
        <section className={SUMMARY_SHELL} aria-label="Resumen de sesión">
            <div className="flex items-start gap-2.5 border-b border-primary/20 bg-primary/[0.06] px-5 py-3.5">
                <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.55)]"
                    aria-hidden
                />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Resumen de sesión</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Planificado vs. registrado en esta sesión
                    </p>
                </div>
            </div>

            <div className="space-y-4 px-5 py-4">
                <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md border border-border/60 bg-surface/80 px-2.5 py-1 text-xs text-foreground">
                        <span className="text-muted-foreground mr-1.5">Fecha</span>
                        {session.session_date ?? "—"}
                        {session.session_time ? ` · ${session.session_time.slice(0, 5)}` : ""}
                    </span>
                    <span className="inline-flex items-center rounded-md border border-primary/45 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {typeLabel}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <PlanActualMetric
                        label="Duración"
                        planned={formatDuration(session.planned_duration)}
                        actual={formatDuration(session.actual_duration)}
                        accentClass="text-foreground"
                    />
                    <PlanActualMetric
                        label="Intensidad"
                        planned={formatMetric(session.planned_intensity)}
                        actual={formatMetric(session.actual_intensity)}
                        accentClass="text-warning"
                    />
                    <PlanActualMetric
                        label="Volumen"
                        planned={formatMetric(session.planned_volume)}
                        actual={formatMetric(session.actual_volume)}
                        accentClass="text-primary"
                    />
                </div>

                {trainerNotes ? (
                    <div className="rounded-lg border border-border/60 bg-surface/80 px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Notas del entrenador
                        </p>
                        <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{trainerNotes}</p>
                    </div>
                ) : null}
            </div>
        </section>
    );
};

export const SessionReviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError } = useToast();
    const sessionId = id ? Number(id) : 0;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSession, { isLoading: isDeleting }] = useDeleteTrainingSessionMutation();

    const backTarget = readReviewBackTarget(location.state);

    const {
        data: session,
        isLoading: isLoadingSession,
        isError: isErrorSession,
    } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId),
    });

    const { data: coherence } = useGetSessionCoherenceQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId),
    });

    const planId = session?.training_plan_id ?? null;
    const { data: periodBlocks } = useGetPeriodBlocksQuery(planId!, {
        skip: !planId,
    });

    const resolvedBlockId = useMemo(() => {
        if (!session) return null;
        if (session.period_block_id) return session.period_block_id;
        if (!session.session_date || !periodBlocks) return null;
        const block = periodBlocks.find(
            (b) => session.session_date! >= b.start_date && session.session_date! <= b.end_date
        );
        return block?.id ?? null;
    }, [session, periodBlocks]);

    const activeBlock = useMemo(() => {
        if (!periodBlocks || !resolvedBlockId) return null;
        return periodBlocks.find((b) => b.id === resolvedBlockId) ?? null;
    }, [periodBlocks, resolvedBlockId]);

    const { data: planSessions } = useGetTrainingSessionsQuery(planId!, {
        skip: !planId,
    });

    const { data: weeklyStructure } = useGetWeeklyStructureQuery(
        { planId: planId!, blockId: resolvedBlockId! },
        { skip: !planId || !resolvedBlockId }
    );

    const blockSessions = useMemo(() => {
        if (!planSessions || !resolvedBlockId) return [];
        return planSessions.filter((s) => s.period_block_id === resolvedBlockId);
    }, [planSessions, resolvedBlockId]);

    const [validateSession, { isLoading: isValidating, data: validationData, error: validationError }] =
        useValidateSessionMutation();

    useEffect(() => {
        if (sessionId > 0) {
            validateSession({ trainingSessionId: sessionId });
        }
    }, [sessionId, validateSession]);

    const handleBack = useCallback(() => {
        if (backTarget) {
            navigate(backTarget);
        } else if (sessionId > 0) {
            navigate(`/dashboard/session-programming/sessions/${sessionId}`, {
                state: returnToStateFromView(location),
            });
        } else {
            navigate(-1);
        }
    }, [backTarget, navigate, sessionId, location]);

    const handleViewSession = useCallback(() => {
        navigate(`/dashboard/session-programming/sessions/${sessionId}`, {
            state: returnToStateFromView(location),
        });
    }, [navigate, sessionId, location]);

    const handleSchedule = useCallback(() => {
        if (!session) return;

        const params = new URLSearchParams();
        if (session.client_id) {
            params.set("clientId", String(session.client_id));
        }
        if (session.training_plan_id) {
            params.set("planId", String(session.training_plan_id));
        }

        let nextDate: string | null = null;

        if (session.session_date && activeBlock) {
            nextDate = suggestNextSessionDateAfter(
                session.session_date,
                activeBlock.start_date,
                activeBlock.end_date,
                weeklyStructure?.weeks ?? [],
                blockSessions
            );
        } else if (session.session_date) {
            nextDate = addOneLocalDay(session.session_date);
        }

        if (!nextDate) {
            showError(
                "No quedan días de entreno en este bloque para programar la siguiente sesión."
            );
            return;
        }

        params.set("date", nextDate);
        navigate(`/dashboard/session-programming/create-session?${params.toString()}`);
    }, [session, activeBlock, weeklyStructure, blockSessions, navigate, showError]);

    const replicateFlow = useReplicateSessionFlow(
        session
            ? {
                  id: session.id,
                  session_name: session.session_name,
                  session_date: session.session_date,
                  training_plan_id: session.training_plan_id ?? null,
                  period_block_id: session.period_block_id ?? null,
              }
            : { id: 0, session_name: "", session_date: null, training_plan_id: null, period_block_id: null }
    );

    const canReplicate = !!session?.period_block_id && !!session?.session_date;

    const handleConfirmDelete = useCallback(async () => {
        if (!session) return;
        try {
            await deleteSession({
                id: session.id,
                trainingPlanId: session.training_plan_id ?? null,
            }).unwrap();
            setShowDeleteModal(false);
            showSuccess("Sesión eliminada correctamente.");
            handleBack();
        } catch (err) {
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String(
                          (err as { data?: { detail?: string } }).data?.detail ||
                              "No se pudo eliminar la sesión."
                      )
                    : "No se pudo eliminar la sesión.";
            showError(errorMessage);
        }
    }, [session, deleteSession, showSuccess, showError, handleBack]);

    if (!sessionId || isNaN(sessionId)) {
        return (
            <div className="px-4 lg:px-8 py-8">
                <Alert variant="error">ID de sesión inválido.</Alert>
            </div>
        );
    }

    if (isLoadingSession) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-muted-foreground">Cargando revisión...</p>
            </div>
        );
    }

    if (isErrorSession || !session) {
        return (
            <div className="px-4 lg:px-8 py-8">
                <Alert variant="error">No se pudo cargar la sesión.</Alert>
            </div>
        );
    }

    const coherenceWarnings = coherence?.coherence_warnings ?? [];

    return (
        <>
            <div className="space-y-6 pb-24 px-4 lg:px-8">
                <SessionReviewHeader
                    session={session}
                    onBack={handleBack}
                    onSchedule={handleSchedule}
                />

                <CoherenceAlertsPanel warnings={coherenceWarnings} />

                <SessionPlanSummaryCard session={session} />

                <SessionValidationContent
                    data={validationData ?? null}
                    isLoading={isValidating}
                    error={validationError ?? null}
                    layout="review"
                />
            </div>

            <DashboardFixedFooter>
                <div className="flex w-full flex-wrap items-center justify-between gap-2">
                    <Button variant="primary" size="sm" onClick={handleViewSession}>
                        <Eye className="mr-1 h-4 w-4" aria-hidden />
                        Ver sesión
                    </Button>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                            variant="outline-destructive"
                            size="sm"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                            Eliminar
                        </Button>
                        {canReplicate ? (
                            <Button variant="outline-primary" size="sm" onClick={replicateFlow.openModal}>
                                <Copy className="mr-1 h-4 w-4" aria-hidden />
                                Replicar
                            </Button>
                        ) : null}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                navigate(`/dashboard/session-programming/edit-session/${sessionId}`)
                            }
                        >
                            <Pencil className="mr-1 h-4 w-4" aria-hidden />
                            Editar
                        </Button>
                    </div>
                </div>
            </DashboardFixedFooter>

            <BaseModal
                isOpen={showDeleteModal}
                onClose={() => {
                    if (!isDeleting) setShowDeleteModal(false);
                }}
                title="Eliminar sesión"
                description={`¿Seguro que quieres eliminar la sesión "${session.session_name}"? Esta acción no se puede deshacer.`}
                iconType="danger"
                closeOnBackdrop={!isDeleting}
                closeOnEsc={!isDeleting}
                isLoading={isDeleting}
            >
                <div className="mt-4 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                </div>
            </BaseModal>

            <ReplicateSessionModal
                isOpen={replicateFlow.isOpen}
                onClose={() => replicateFlow.setIsOpen(false)}
                weeks={replicateFlow.weeks}
                selectedWeeks={replicateFlow.selectedWeeks}
                onToggleWeek={replicateFlow.toggleWeek}
                onReplicate={replicateFlow.handleReplicate}
                isLoading={replicateFlow.isReplicating}
                sessionName={session.session_name}
                hasBlock={replicateFlow.hasBlock}
                isBlockLoading={replicateFlow.isBlockLoading}
            />
            <ReplicateSessionConflictModal
                isOpen={replicateFlow.isConflictOpen}
                onClose={replicateFlow.handleCancelConflict}
                onConfirmReplace={replicateFlow.handleConfirmReplace}
                conflicts={replicateFlow.pendingConflicts}
                createdCount={replicateFlow.createdCount}
                isLoading={replicateFlow.isReplicating}
            />
        </>
    );
};
