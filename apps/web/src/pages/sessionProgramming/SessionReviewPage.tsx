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
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@nexia/shared/store";
import { trainingSessionsApi } from "@nexia/shared/api/trainingSessionsApi";
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
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
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
import {
    NexiaPremiumConfirmModal,
    NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS,
} from "@/components/ui/modals";
import { CoherenceConclusionsPanel } from "@/components/sessionProgramming/CoherenceConclusionsPanel";
import { SessionPhaseIntentMixPanel } from "@/components/sessionProgramming/SessionPhaseIntentMixPanel";
import { stripLegacyCoherenceFromNotes } from "@/components/sessionProgramming/coherenceConclusionsPresentation";
import { SessionValidationContent } from "@/components/sessionProgramming/SessionValidationContent";
import { ClientAvatar } from "@/components/ui/avatar";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { ReplicateSessionModal } from "@/components/sessions/ReplicateSessionModal";
import { ReplicateSessionConflictModal } from "@/components/sessions/ReplicateSessionConflictModal";
import { useReplicateSessionFlow } from "@/components/sessions/useReplicateSessionFlow";
import {
    navigateDashboardBack,
    readReviewBackTarget,
    readReviewCoherenceFromState,
    returnToStateFromView,
} from "@/lib/sessionDetailNavigation";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { BlockLevelMeter } from "@/components/trainingPlans/periodization/BlockLevelMeter";
import {
    SESSION_REVIEW_ALERT_BODY,
    SESSION_REVIEW_ALERT_HEADER,
    SESSION_REVIEW_ALERT_ITEM,
    SESSION_REVIEW_ALERT_PANEL,
    SESSION_REVIEW_BREADCRUMB,
    SESSION_REVIEW_BREADCRUMB_CURRENT,
    SESSION_REVIEW_BREADCRUMB_LINK,
    SESSION_REVIEW_CLIENT_META,
    SESSION_REVIEW_FOOTER_MGMT,
    SESSION_REVIEW_FOOTER_ROW,
    SESSION_REVIEW_FOOTER_SHELL,
    SESSION_REVIEW_FOOTER_VIEW_ACTION,
    SESSION_REVIEW_GLOW,
    SESSION_REVIEW_HEADER_ACTIONS,
    SESSION_REVIEW_HERO,
    SESSION_REVIEW_HERO_ROW,
    SESSION_REVIEW_META_CHIP,
    SESSION_REVIEW_METRIC_CELL,
    SESSION_REVIEW_METRIC_DURATION,
    SESSION_REVIEW_METRIC_GRID,
    SESSION_REVIEW_METRIC_LABEL,
    SESSION_REVIEW_NOTES_SHELL,
    SESSION_REVIEW_PAGE,
    SESSION_REVIEW_STACK,
    SESSION_REVIEW_STATUS_BADGE,
    SESSION_REVIEW_SUMMARY_BODY,
    SESSION_REVIEW_SUMMARY_CARD,
    SESSION_REVIEW_SUMMARY_HEADER,
    SESSION_REVIEW_SUMMARY_SUBTITLE,
    SESSION_REVIEW_SUMMARY_TITLE,
    SESSION_REVIEW_TITLE,
    SESSION_REVIEW_TYPE_CHIP,
    sessionReviewStatusBadgeClass,
} from "@/components/sessionProgramming/sessionReviewPresentation";

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


function DurationMetric({
    planned,
    actual,
}: {
    planned: string;
    actual: string;
}) {
    const hasActual = actual !== "—";
    return (
        <div className={SESSION_REVIEW_METRIC_CELL}>
            <span className={SESSION_REVIEW_METRIC_LABEL}>Duración</span>
            <div className={SESSION_REVIEW_METRIC_DURATION}>
                <p>
                    Programado: <span className="font-medium text-foreground">{planned}</span>
                </p>
                <p className={hasActual ? "text-foreground" : undefined}>
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
        <header className={SESSION_REVIEW_HERO}>
            <NexiaGlassAccentRim />
            <nav className={cn(SESSION_REVIEW_BREADCRUMB, "relative z-[1]")} aria-label="Ruta">
                <button type="button" onClick={onBack} className={SESSION_REVIEW_BREADCRUMB_LINK}>
                    Sesiones
                </button>
                <ChevronRight className="size-4 shrink-0" aria-hidden />
                <span className={cn(SESSION_REVIEW_BREADCRUMB_CURRENT, "max-w-[200px] sm:max-w-xs")}>
                    {session.session_name}
                </span>
                <ChevronRight className="size-4 shrink-0" aria-hidden />
                <span className={SESSION_REVIEW_BREADCRUMB_CURRENT}>Revisión</span>
            </nav>

            <div className={cn(SESSION_REVIEW_HERO_ROW, "relative z-[1]")}>
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
                        <h1 className={SESSION_REVIEW_TITLE}>{session.session_name}</h1>
                        <span
                            className={cn(
                                SESSION_REVIEW_STATUS_BADGE,
                                sessionReviewStatusBadgeClass(session.status),
                            )}
                        >
                            {session.status === "completed" ? (
                                <CheckCircle2 className="size-3.5" aria-hidden />
                            ) : null}
                            {statusLabel}
                        </span>
                    </div>
                    {client ? (
                        <p className={SESSION_REVIEW_CLIENT_META}>
                            {[client.nombre, client.apellidos, client.objetivo_entrenamiento]
                                .filter(Boolean)
                                .join(" · ")}
                        </p>
                    ) : null}
                </div>

                <div className={SESSION_REVIEW_HEADER_ACTIONS}>
                    <Button variant="ghost-primary" size="sm" onClick={onBack}>
                        <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
                        Volver
                    </Button>
                    <Button variant="primary" size="sm" onClick={onSchedule}>
                        <CalendarPlus className="size-3.5 shrink-0" aria-hidden />
                        Programar siguiente
                    </Button>
                </div>
            </div>
        </header>
    );
};

const CoherenceAlertsPanel: React.FC<{
    warnings: Array<{ message: string }>;
}> = ({ warnings }) => {
    if (warnings.length === 0) return null;

    return (
        <section className={SESSION_REVIEW_ALERT_PANEL} aria-label="Avisos de coherencia">
            <NexiaGlassAccentRim />
            <div className={SESSION_REVIEW_ALERT_HEADER}>
                <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden />
                <h2 className="text-sm font-semibold text-foreground">Avisos de coherencia</h2>
                <span className="ml-auto rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-warning">
                    {warnings.length}
                </span>
            </div>
            <ul className={SESSION_REVIEW_ALERT_BODY}>
                {warnings.map((w, i) => (
                    <li key={i} className={SESSION_REVIEW_ALERT_ITEM}>
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
    const trainerNotes = stripLegacyCoherenceFromNotes(session.notes);

    const plannedVol = Math.min(10, Math.max(1, session.planned_volume ?? 5));
    const plannedInt = Math.min(10, Math.max(1, session.planned_intensity ?? 5));

    return (
        <section className={SESSION_REVIEW_SUMMARY_CARD} aria-label="Resumen de sesión">
            <NexiaGlassAccentRim />
            <div className={SESSION_REVIEW_SUMMARY_HEADER}>
                <div className="min-w-0 space-y-1">
                    <p className={SESSION_REVIEW_SUMMARY_TITLE}>Resumen de sesión</p>
                    <p className={SESSION_REVIEW_SUMMARY_SUBTITLE}>
                        Planificado vs. registrado en esta sesión
                    </p>
                </div>
            </div>

            <div className={SESSION_REVIEW_SUMMARY_BODY}>
                <div className="flex flex-wrap gap-2">
                    <span className={SESSION_REVIEW_META_CHIP}>
                        <span className="mr-1.5 text-muted-foreground">Fecha</span>
                        {session.session_date ?? "—"}
                        {session.session_time ? ` · ${session.session_time.slice(0, 5)}` : ""}
                    </span>
                    <span className={SESSION_REVIEW_TYPE_CHIP}>{typeLabel}</span>
                </div>

                <div className={SESSION_REVIEW_METRIC_GRID}>
                    <DurationMetric
                        planned={formatDuration(session.planned_duration)}
                        actual={formatDuration(session.actual_duration)}
                    />
                    <div className={SESSION_REVIEW_METRIC_CELL}>
                        <BlockLevelMeter
                            id="review-planned-intensity"
                            tone="intensity"
                            prefix="Intensidad"
                            level={plannedInt}
                            hint={
                                session.actual_intensity != null
                                    ? `Registrado: ${formatMetric(session.actual_intensity)}`
                                    : "Registrado: —"
                            }
                            qualitativeLabel
                        />
                    </div>
                    <div className={SESSION_REVIEW_METRIC_CELL}>
                        <BlockLevelMeter
                            id="review-planned-volume"
                            tone="volume"
                            prefix="Volumen"
                            level={plannedVol}
                            hint={
                                session.actual_volume != null
                                    ? `Registrado: ${formatMetric(session.actual_volume)}`
                                    : "Registrado: —"
                            }
                            qualitativeLabel
                        />
                    </div>
                </div>

                {trainerNotes ? (
                    <div className={SESSION_REVIEW_NOTES_SHELL}>
                        <p className={SESSION_REVIEW_METRIC_LABEL}>Notas del entrenador</p>
                        <p className="mt-1 text-sm whitespace-pre-wrap text-foreground">{trainerNotes}</p>
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
    const dispatch = useDispatch<AppDispatch>();
    const { showSuccess, showError } = useToast();
    const sessionId = id ? Number(id) : 0;
    const seededCoherence = useMemo(
        () => readReviewCoherenceFromState(location.state),
        [location.state],
    );
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSession, { isLoading: isDeleting }] = useDeleteTrainingSessionMutation();

    const {
        data: session,
        isLoading: isLoadingSession,
        isError: isErrorSession,
    } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId),
    });

    useEffect(() => {
        if (seededCoherence && sessionId > 0) {
            dispatch(
                trainingSessionsApi.util.upsertQueryData(
                    "getSessionCoherence",
                    sessionId,
                    seededCoherence,
                ),
            );
        }
    }, [dispatch, seededCoherence, sessionId]);

    const {
        data: coherence,
        isLoading: isLoadingCoherence,
    } = useGetSessionCoherenceQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId),
    });

    const effectiveCoherence = coherence ?? seededCoherence;
    const showCoherenceLoading = isLoadingCoherence && !effectiveCoherence;

    const { data: physicalQualities } = useGetPhysicalQualitiesQuery();

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
        const explicitTarget = readReviewBackTarget(location.state);
        if (explicitTarget) {
            navigate(explicitTarget);
            return;
        }
        const fallback =
            sessionId > 0
                ? `/dashboard/session-programming/sessions/${sessionId}`
                : "/dashboard/sessions";
        navigateDashboardBack(navigate, location.state, fallback);
    }, [navigate, location.state, sessionId]);

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
                  period_block_id: resolvedBlockId ?? session.period_block_id ?? null,
              }
            : { id: 0, session_name: "", session_date: null, training_plan_id: null, period_block_id: null }
    );

    const canReplicate = !!resolvedBlockId && !!session?.session_date;

    const handleConfirmDelete = useCallback(async () => {
        if (!session) return;
        try {
            await deleteSession({
                id: session.id,
                trainingPlanId: session.training_plan_id ?? null,
                clientId: session.client_id ?? null,
                trainerId: session.trainer_id ?? null,
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

    const coherenceWarnings = effectiveCoherence?.coherence_warnings ?? [];

    return (
        <>
            <div className={SESSION_REVIEW_PAGE}>
                <div className={SESSION_REVIEW_GLOW} aria-hidden />
                <div className={SESSION_REVIEW_STACK}>
                <SessionReviewHeader
                    session={session}
                    onBack={handleBack}
                    onSchedule={handleSchedule}
                />

                <CoherenceAlertsPanel warnings={coherenceWarnings} />

                <SessionPlanSummaryCard session={session} />

                <SessionPhaseIntentMixPanel
                    report={effectiveCoherence?.coherence_report}
                    qualityCatalog={physicalQualities ?? []}
                />

                <CoherenceConclusionsPanel
                    report={effectiveCoherence?.coherence_report}
                    isLoading={showCoherenceLoading}
                    qualityCatalog={physicalQualities}
                />

                <SessionValidationContent
                    data={validationData ?? null}
                    isLoading={isValidating}
                    error={validationError ?? null}
                    layout="review"
                />
                </div>
            </div>

            <DashboardFixedFooter className={SESSION_REVIEW_FOOTER_SHELL}>
                <div className={SESSION_REVIEW_FOOTER_ROW}>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        className={SESSION_REVIEW_FOOTER_VIEW_ACTION}
                        onClick={handleViewSession}
                    >
                        <Eye className="size-3.5 shrink-0" aria-hidden />
                        Ver sesión
                    </Button>
                    <div className={SESSION_REVIEW_FOOTER_MGMT}>
                        {canReplicate ? (
                            <Button
                                variant="ghost-primary"
                                size="sm"
                                onClick={replicateFlow.openModal}
                            >
                                <Copy className="size-3.5 shrink-0" aria-hidden />
                                Replicar
                            </Button>
                        ) : null}
                        <Button
                            variant="ghost-primary"
                            size="sm"
                            onClick={() =>
                                navigate(`/dashboard/session-programming/edit-session/${sessionId}`)
                            }
                        >
                            <Pencil className="size-3.5 shrink-0" aria-hidden />
                            Editar
                        </Button>
                        <Button
                            variant="outline-destructive"
                            size="sm"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <Trash2 className="size-3.5 shrink-0" aria-hidden />
                            Eliminar
                        </Button>
                    </div>
                </div>
            </DashboardFixedFooter>

            <NexiaPremiumConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    if (!isDeleting) setShowDeleteModal(false);
                }}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
                loadingConfirmLabel="Eliminando…"
                title="Eliminar sesión"
                description={
                    <>
                        ¿Seguro que quieres eliminar la sesión{" "}
                        <span className={NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS}>
                            «{session.session_name}»
                        </span>
                        ? Esta acción no se puede deshacer.
                    </>
                }
                closeOnBackdrop={!isDeleting}
                closeOnEsc={!isDeleting}
                confirmLabel="Eliminar"
            />

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
