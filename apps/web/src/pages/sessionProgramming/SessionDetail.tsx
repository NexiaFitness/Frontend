/**
 * SessionDetail.tsx — Detalle de sesión con layout estilo dashboard.
 * Contexto: muestra estado, cliente, plan del día, lesiones y ejercicios.
 * Notas de mantenimiento: usa contratos de @nexia/shared sin lógica hardcodeada.
 * @author Frontend Team
 * @since v6.3.0
 */

import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    ArrowLeft,
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
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { DASHBOARD_FIXED_FOOTER_PADDING_CLASS } from "@/lib/dashboardScroll";
import {
    useGetTrainingSessionQuery,
    useDeleteTrainingSessionMutation,
} from "@nexia/shared/api/trainingSessionsApi";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming";
import { cn } from "@/lib/utils";
import {
    SessionBlockDetail,
    SessionContextStrip,
    SessionAlertsPanel,
} from "@/components/sessionProgramming/detail";
import { readSafeReturnTo } from "@/lib/sessionDetailNavigation";
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
    const goBack = () => {
        if (backTarget) {
            navigate(backTarget);
        } else {
            navigate(DEFAULT_BACK_TO_SESSIONS);
        }
    };
    const { id } = useParams<{ id: string }>();
    const sessionId = id ? Number(id) : 0;
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteSession, { isLoading: isDeleting }] = useDeleteTrainingSessionMutation();

    const { data: session, isLoading, isError, error } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId || Number.isNaN(sessionId) || !isAuthenticated,
    });

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
            }).unwrap();
            setShowDeleteModal(false);
            showSuccess("Sesión eliminada correctamente.");
            goBack();
        } catch (err) {
            console.error("Error eliminando sesión:", err);
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String((err as { data?: { detail?: string } }).data?.detail || "No se pudo eliminar la sesión.")
                    : "No se pudo eliminar la sesión.";
            showError(errorMessage);
        }
    };

    if (!sessionId || Number.isNaN(sessionId)) {
        return (
            <div className="p-6">
                <Alert variant="error">ID de sesion invalido</Alert>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError || !session) {
        const errorMessage =
            error && typeof error === "object" && "data" in error
                ? String((error as { data: unknown }).data)
                : "Sesión no encontrada";

        return (
            <div className="space-y-6">
                <Alert variant="error">{errorMessage}</Alert>
                <div className="py-20 text-center">
                    <p className="text-lg font-semibold">Sesión no encontrada</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={goBack}
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                        {backTarget ? "Volver" : "Volver a sesiones"}
                    </Button>
                </div>
            </div>
        );
    }

    const statusLabel = STATUS_LABELS[session.status] || "Planificada";
    const statusVariant: BadgeVariant = STATUS_BADGE_VARIANT[session.status] ?? "subtle";
    const sessionTypeKey = String(session.session_type || "").toLowerCase();
    const typeLabel = TYPE_LABELS[sessionTypeKey] || session.session_type || "—";
    const typeVariant: BadgeVariant = TYPE_BADGE_VARIANT[sessionTypeKey] ?? "subtle-secondary";
    const clientName = client ? `${client.nombre} ${client.apellidos}` : "Cliente";

    const embeddedCoherence = session.coherence ?? null;
    const legacyInjuryNote = client?.lesiones_relevantes?.trim() || null;

    return (
        <div className={cn("space-y-6", DASHBOARD_FIXED_FOOTER_PADDING_CLASS)}>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <button
                    type="button"
                    className="hover:text-foreground"
                    onClick={goBack}
                >
                    {backTarget?.includes("/clients/") && !backTarget.includes("/sessions/new")
                        ? "Cliente"
                        : "Sesiones"}
                </button>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                <span className="truncate font-medium text-foreground">{session.session_name}</span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                    <span className="relative flex h-14 w-14 shrink-0 overflow-hidden rounded-full">
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-success/20 text-lg font-bold text-success">
                            {getInitials(clientName)}
                        </span>
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl font-bold">{session.session_name}</h1>
                            <Badge variant={statusVariant}>{statusLabel}</Badge>
                            <Badge variant={typeVariant}>{typeLabel}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{clientName}</p>
                        {session.training_plan_id && plan?.name ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Plan: <span className="font-medium text-foreground">{plan.name}</span>
                            </p>
                        ) : null}
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" aria-hidden />
                                {formatLongDate(session.session_date)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" aria-hidden />
                                {session.session_time ? session.session_time.slice(0, 5) : "—"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Timer className="h-3.5 w-3.5" aria-hidden />
                                {session.planned_duration ?? 0} min
                            </span>
                        </div>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={goBack} className="shrink-0">
                    <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                    Volver
                </Button>
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
                periodBlockId={session.period_block_id ?? null}
                embeddedCoherence={embeddedCoherence}
                legacyInjuryNote={legacyInjuryNote}
            />

            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="rounded-lg bg-surface-2 p-2 text-primary">
                        <Dumbbell className="h-4 w-4" aria-hidden />
                    </div>
                    <h2 className="text-lg font-semibold">Ejercicios</h2>
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
                    <Alert variant="error">No se pudieron cargar los ejercicios</Alert>
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
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                        variant="outline-destructive"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                        Eliminar
                    </Button>
                    {session.period_block_id ? (
                        <Button
                            variant="outline-primary"
                            onClick={replicateFlow.openModal}
                        >
                            <Copy className="mr-1 h-4 w-4" aria-hidden />
                            Replicar
                        </Button>
                    ) : null}
                    <Button
                        variant="primary"
                        onClick={() => navigate(`/dashboard/session-programming/edit-session/${session.id}`)}
                    >
                        <Pencil className="mr-1 h-4 w-4" aria-hidden />
                        Editar sesión
                    </Button>
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
                    <Button
                        variant="danger"
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                </div>
            </BaseModal>
        </div>
    );
};

