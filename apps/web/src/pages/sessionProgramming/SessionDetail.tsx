/**
 * SessionDetail.tsx — Detalle de sesión con layout estilo dashboard.
 * Contexto: muestra estado, cliente, plan del día, lesiones y ejercicios.
 * Notas de mantenimiento: usa contratos de @nexia/shared sin lógica hardcodeada.
 * @author Frontend Team
 * @since v6.3.0
 */

import React, { useCallback, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    Copy,
    Dumbbell,
    Pencil,
    Timer,
    Trash2,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert, useToast } from "@/components/ui/feedback";
import { ResourceQueryState } from "@/components/ui/feedback/ResourceQueryState";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import {
    NexiaPremiumConfirmModal,
    NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS,
} from "@/components/ui/modals";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { PLATFORM_DASHBOARD_FOOTER_ROW } from "@/components/ui/forms/platformFormPresentation";
import { DASHBOARD_FIXED_FOOTER_PADDING_CLASS } from "@/lib/dashboardScroll";
import {
    useGetTrainingSessionQuery,
    useDeleteTrainingSessionMutation,
} from "@nexia/shared/api/trainingSessionsApi";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming";
import { getMutationErrorMessage } from "@nexia/shared";
import { cn } from "@/lib/utils";
import {
    SessionBlockDetail,
    SessionContextStrip,
    SessionAlertsPanel,
    SessionExecutionSummary,
    SessionTimedAthleteResultsPanel,
} from "@/components/sessionProgramming/detail";
import {
    SESSION_DETAIL_AVATAR,
    SESSION_DETAIL_AVATAR_INNER,
    SESSION_DETAIL_BADGE_ROW,
    SESSION_DETAIL_BODY,
    SESSION_DETAIL_BREADCRUMB,
    SESSION_DETAIL_BREADCRUMB_CURRENT,
    SESSION_DETAIL_BREADCRUMB_LINK,
    SESSION_DETAIL_CLIENT,
    SESSION_DETAIL_MOBILE_BLOCK,
    SESSION_DETAIL_HEADER,
    SESSION_DETAIL_IDENTITY,
    SESSION_DETAIL_META,
    SESSION_DETAIL_META_ITEM,
    SESSION_DETAIL_PLAN,
    SESSION_DETAIL_PLAN_EMPHASIS,
    SESSION_DETAIL_TITLE,
    SESSION_DETAIL_TITLE_GROUP,
} from "@/components/sessionProgramming/detail/sessionDetailPresentation";
import { PlatformHeaderBackButton } from "@/components/ui/surface/PlatformHeaderBackButton";
import {
    navigateDashboardBack,
    readSafeReturnTo,
    returnToStateFromView,
} from "@/lib/sessionDetailNavigation";
import { useReplicateSessionFlow } from "@/components/sessions/useReplicateSessionFlow";
import { ReplicateSessionModal } from "@/components/sessions/ReplicateSessionModal";
import { ReplicateSessionConflictModal } from "@/components/sessions/ReplicateSessionConflictModal";
const STATUS_LABELS: Record<string, string> = {
    planned: "Planificada",
    completed: "Completada",
    cancelled: "Cancelada",
    skipped: "Cancelada",
    modified: "Planificada",
    in_progress: "Planificada",
};

const STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
    planned: "subtle",
    completed: "subtle-success",
    cancelled: "subtle-destructive",
    skipped: "subtle-destructive",
    modified: "subtle",
    in_progress: "subtle",
};

const TYPE_LABELS: Record<string, string> = {
    strength: "Fuerza",
    cardio: "Cardio",
    technique: "Técnica",
    assessment: "Evaluación",
};

const TYPE_BADGE_VARIANT: Record<string, BadgeVariant> = {
    strength: "subtle",
    cardio: "subtle-warning",
    technique: "subtle",
    assessment: "subtle-secondary",
};

function getInitials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "—";
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return `${first}${last}`.toUpperCase();
}

function formatLongDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "Sin fecha";
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    }).replace(",", "");
}

function formatShortDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "—";
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

const DEFAULT_BACK_TO_SESSIONS = "/dashboard/sessions";

export const SessionDetail: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError } = useToast();
    const backTarget = readSafeReturnTo(location.state) ?? null;
    const goBack = useCallback(() => {
        navigateDashboardBack(navigate, location.state, DEFAULT_BACK_TO_SESSIONS);
    }, [navigate, location.state]);
    const { id } = useParams<{ id: string }>();
    const sessionId = id ? Number(id) : 0;
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSession, { isLoading: isDeleting }] = useDeleteTrainingSessionMutation();

    const {
        data: session,
        isLoading,
        isFetching,
        isUninitialized,
        isError,
        error,
        refetch: refetchSession,
    } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId || Number.isNaN(sessionId) || !isAuthenticated,
    });

    const sessionQueryPending =
        !session && (isLoading || isFetching || isUninitialized);

    const {
        view: sessionStructure,
        isLoading: isLoadingExercises,
        isError: isErrorExercises,
    } = useSessionStructureView(
        sessionId && !Number.isNaN(sessionId) && isAuthenticated ? sessionId : null
    );

    const { data: plan } = useGetTrainingPlanQuery(session?.training_plan_id || 0, {
        skip: !session?.training_plan_id,
    });

    const { data: client } = useGetClientQuery(session?.client_id || 0, {
        skip: !session?.client_id,
    });

    const replicateFlow = useReplicateSessionFlow(
        session
            ? {
                  id: session.id,
                  session_date: session.session_date,
                  session_name: session.session_name,
                  training_plan_id: session.training_plan_id ?? null,
                  period_block_id: session.period_block_id ?? null,
              }
            : { id: 0, session_date: null, session_name: "", training_plan_id: null, period_block_id: null }
    );

    const handleConfirmDelete = async () => {
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
            goBack();
        } catch (err) {
            console.error("Error eliminando sesión:", err);
            showError(getMutationErrorMessage(err));
        }
    };

    if (!sessionId || Number.isNaN(sessionId)) {
        return (
            <div className="p-6">
                <Alert variant="error" title="ID de sesión inválido" />
            </div>
        );
    }

    if (sessionQueryPending) {
        return (
            <div
                className="flex items-center justify-center min-h-screen"
                role="status"
                aria-label="Cargando sesión"
            >
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError || !session) {
        return (
            <ResourceQueryState
                error={error ?? { status: 404 }}
                resource="session"
                onRetry={() => refetchSession()}
                fallbackPath={backTarget ?? "/dashboard/sessions"}
            />
        );
    }

    const statusLabel = STATUS_LABELS[session.status] || "Planificada";
    const statusVariant: BadgeVariant = STATUS_BADGE_VARIANT[session.status] ?? "subtle";
    const sessionTypeKey = String(session.session_type || "").toLowerCase();
    const typeLabel = TYPE_LABELS[sessionTypeKey] || session.session_type || "—";
    const typeVariant: BadgeVariant = TYPE_BADGE_VARIANT[sessionTypeKey] ?? "subtle-secondary";
    const clientName = client ? `${client.nombre} ${client.apellidos}` : "Cliente";

    const showExecutionSummary =
        session.status === "completed" || session.status === "in_progress";

    const embeddedCoherence = session.coherence ?? null;
    const legacyInjuryNote = client?.lesiones_relevantes?.trim() || null;

    return (
        <div className={cn("space-y-6", DASHBOARD_FIXED_FOOTER_PADDING_CLASS)}>
            <div className={SESSION_DETAIL_MOBILE_BLOCK}>
            <nav className={SESSION_DETAIL_BREADCRUMB} aria-label="Ruta">
                <button type="button" className={SESSION_DETAIL_BREADCRUMB_LINK} onClick={goBack}>
                    {backTarget?.includes("/clients/") && !backTarget.includes("/sessions/new")
                        ? "Cliente"
                        : "Sesiones"}
                </button>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className={SESSION_DETAIL_BREADCRUMB_CURRENT}>{session.session_name}</span>
            </nav>

            <div className={SESSION_DETAIL_HEADER}>
                <div className={SESSION_DETAIL_IDENTITY}>
                    <span className={SESSION_DETAIL_AVATAR}>
                        <span className={SESSION_DETAIL_AVATAR_INNER}>
                            {getInitials(clientName)}
                        </span>
                    </span>
                    <div className={SESSION_DETAIL_BODY}>
                        <div className={SESSION_DETAIL_TITLE_GROUP}>
                            <h1 className={SESSION_DETAIL_TITLE}>{session.session_name}</h1>
                            <div className={SESSION_DETAIL_BADGE_ROW}>
                                <Badge variant={statusVariant}>{statusLabel}</Badge>
                                <Badge variant={typeVariant}>{typeLabel}</Badge>
                            </div>
                        </div>
                        <p className={SESSION_DETAIL_CLIENT}>{clientName}</p>
                        {session.training_plan_id && plan?.name ? (
                            <p className={SESSION_DETAIL_PLAN}>
                                Plan:{" "}
                                <span className={SESSION_DETAIL_PLAN_EMPHASIS}>{plan.name}</span>
                            </p>
                        ) : null}
                        <div className={SESSION_DETAIL_META}>
                            <span className={SESSION_DETAIL_META_ITEM}>
                                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                {formatLongDate(session.session_date)}
                            </span>
                            <span className={SESSION_DETAIL_META_ITEM}>
                                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                {session.session_time ? session.session_time.slice(0, 5) : "—"}
                            </span>
                            <span className={SESSION_DETAIL_META_ITEM}>
                                <Timer className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                {session.planned_duration ?? 0} min
                            </span>
                        </div>
                    </div>
                </div>
                <PlatformHeaderBackButton onClick={goBack} />
            </div>
            </div>

            <SessionContextStrip
                sessionId={session.id}
                clientId={session.client_id}
                trainerId={session.trainer_id}
                trainingPlanId={session.training_plan_id ?? null}
                periodBlockId={session.period_block_id ?? null}
                sessionDate={session.session_date ?? null}
                embeddedCoherence={embeddedCoherence}
            />

            <SessionAlertsPanel
                sessionId={session.id}
                clientId={session.client_id}
                trainingPlanId={session.training_plan_id ?? null}
                periodBlockId={session.period_block_id ?? null}
                embeddedCoherence={embeddedCoherence}
                legacyInjuryNote={legacyInjuryNote}
            />

            {session.client_id ? (
                <SessionTimedAthleteResultsPanel
                    clientId={session.client_id}
                    sessionId={session.id}
                />
            ) : null}

            {showExecutionSummary && session.client_id ? (
                <SessionExecutionSummary
                    sessionId={session.id}
                    clientId={session.client_id}
                    enabled={showExecutionSummary}
                />
            ) : null}

            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="rounded-lg bg-surface-2 p-2 text-primary">
                        <Dumbbell className="h-4 w-4" aria-hidden />
                    </div>
                    <h2 className="text-lg font-semibold">
                        {showExecutionSummary ? "Prescripción" : "Ejercicios"}
                    </h2>
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {sessionStructure.totalExercises}
                    </span>
                    {sessionStructure.totalSets > 0 && (
                        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                            {sessionStructure.totalSets} series
                        </span>
                    )}
                </div>
                {isLoadingExercises ? (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner size="md" />
                    </div>
                ) : isErrorExercises ? (
                    <Alert variant="error" title="No se pudieron cargar los ejercicios" />
                ) : sessionStructure.blocks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/60 bg-surface/40 px-4 py-10 text-center text-sm text-muted-foreground">
                        Esta sesión todavía no tiene ejercicios asignados.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessionStructure.blocks.map((block) => (
                            <SessionBlockDetail key={block.blockId} block={block} />
                        ))}
                    </div>
                )}
            </div>

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

            {session.status === "completed" && session.notes && (
                <div className="rounded-xl bg-card p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" aria-hidden />
                        Feedback post-sesión
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex gap-6">
                            <p>
                                <span className="text-muted-foreground">RPE percibido: </span>
                                {session.actual_intensity ?? "—"}/10
                            </p>
                            <p>
                                <span className="text-muted-foreground">Fecha: </span>
                                {formatShortDate(session.updated_at?.slice(0, 10))}
                            </p>
                        </div>
                        <p className="text-muted-foreground">{session.notes}</p>
                    </div>
                </div>
            )}

            <DashboardFixedFooter>
                <div className={PLATFORM_DASHBOARD_FOOTER_ROW}>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                            navigate(`/dashboard/session-programming/edit-session/${session.id}`, {
                                state: returnToStateFromView(location),
                            })
                        }
                    >
                        <Pencil className="size-3.5 shrink-0" aria-hidden />
                        Editar sesión
                    </Button>
                    {session.period_block_id ? (
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
                        variant="outline-destructive"
                        size="sm"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <Trash2 className="size-3.5 shrink-0" aria-hidden />
                        Eliminar
                    </Button>
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
                data-testid="session-delete-premium-modal"
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
        </div>
    );
};

