/**
 * StandaloneSessionDetail.tsx — Vista de detalle de sesión libre (sin plan)
 *
 * Contexto:
 * - P2: Sesiones creadas cuando no hay plan activo para la fecha
 * - Navegación desde ClientSessionsTab
 * - Fase 5: métrica planned_sets vs actual_sets por ejercicio y total de sesión
 *
 * @author Frontend Team
 * @since P2 — Plan integración flujo planificación UX
 */

import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Calendar, ChevronRight, Clock, Timer } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { PlatformHeaderBackButton } from "@/components/ui/surface/PlatformHeaderBackButton";
import {
    SESSION_DETAIL_AVATAR,
    SESSION_DETAIL_AVATAR_INNER,
    SESSION_DETAIL_BADGE_ROW,
    SESSION_DETAIL_BODY,
    SESSION_DETAIL_BREADCRUMB,
    SESSION_DETAIL_BREADCRUMB_CURRENT,
    SESSION_DETAIL_BREADCRUMB_LINK,
    SESSION_DETAIL_CLIENT,
    SESSION_DETAIL_HEADER,
    SESSION_DETAIL_MOBILE_BLOCK,
    SESSION_DETAIL_IDENTITY,
    SESSION_DETAIL_META,
    SESSION_DETAIL_META_ITEM,
    SESSION_DETAIL_TITLE,
    SESSION_DETAIL_TITLE_GROUP,
    SESSION_DETAIL_TOOLBAR,
} from "@/components/sessionProgramming/detail/sessionDetailPresentation";
import { useToast, LoadingSpinner, Alert } from "@/components/ui/feedback";
import { NexiaPremiumConfirmModal } from "@/components/ui/modals";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import {
    useDeleteStandaloneSessionMutation,
    useUpdateStandaloneSessionMutation,
    useGetStandaloneSessionFeedbackQuery,
    useGetStandaloneSessionQuery,
    useGetStandaloneSessionExercisesQuery,
} from "@nexia/shared/api/standaloneSessionsApi";
import { Badge } from "@/components/ui/Badge";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import type { SessionExerciseDisplay } from "@nexia/shared/hooks/sessionProgramming";
import { SessionDetailExerciseCard } from "@/components/sessionProgramming";
import { StandaloneSessionLoadSummary } from "@/components/standaloneSessions/StandaloneSessionLoadSummary";
import { StandaloneSessionClientFeedbackPanel } from "@/components/standaloneSessions/StandaloneSessionClientFeedbackPanel";
import { cn } from "@/lib/utils";
import { navigateDashboardBack, readSafeReturnTo } from "@/lib/sessionDetailNavigation";

const DEFAULT_STANDALONE_BACK = "/dashboard/sessions";

const STATUS_LABELS: Record<string, string> = {
    planned: "Planificada",
    completed: "Completada",
    cancelled: "Cancelada",
    skipped: "Saltada",
    in_progress: "En curso",
    modified: "Modificada",
    archived: "Archivada",
};

const STATUS_STYLES: Record<string, string> = {
    planned: "bg-primary/15 text-primary",
    completed: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
    cancelled: "bg-destructive/15 text-destructive",
    skipped: "bg-destructive/15 text-destructive",
    in_progress: "bg-primary/15 text-primary",
};

const TYPE_LABELS: Record<string, string> = {
    strength: "Fuerza",
    cardio: "Cardio",
    technique: "Tecnica",
    assessment: "Evaluacion",
};

const TYPE_STYLES: Record<string, string> = {
    strength: "bg-primary/20 text-primary",
    cardio: "bg-warning/20 text-warning",
    technique: "bg-info/20 text-info",
    assessment: "bg-[hsl(270,60%,60%)]/20 text-[hsl(270,60%,60%)]",
};

function getInitials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "--";
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return `${first}${last}`.toUpperCase();
}

function formatLongDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "Sin fecha";
    return new Date(`${dateStr}T12:00:00`)
        .toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        .replace(",", "");
}

export const StandaloneSessionDetail: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError } = useToast();
    const backTarget = readSafeReturnTo(location.state) ?? null;
    const goBack = useCallback(() => {
        navigateDashboardBack(navigate, location.state, DEFAULT_STANDALONE_BACK);
    }, [navigate, location.state]);
    const { id } = useParams<{ id: string }>();
    const sessionId = id ? Number(id) : 0;

    const { data: session, isLoading, isError, error } = useGetStandaloneSessionQuery(sessionId, {
        skip: !sessionId || Number.isNaN(sessionId),
    });

    const {
        data: exercises = [],
        isLoading: isLoadingExercises,
        isError: isErrorExercises,
    } = useGetStandaloneSessionExercisesQuery(sessionId, {
        skip: !sessionId || Number.isNaN(sessionId),
    });

    const {
        data: clientFeedback,
        isLoading: isLoadingFeedback,
        isError: isErrorFeedback,
    } = useGetStandaloneSessionFeedbackQuery(sessionId, {
        skip: !sessionId || Number.isNaN(sessionId),
    });

    const { data: client } = useGetClientQuery(session?.client_id || 0, {
        skip: !session?.client_id,
    });

    const { data: exercisesCatalog } = useGetExercisesQuery({ skip: 0, limit: 1000 });
    const exerciseNameById = useMemo(() => {
        const map = new Map<number, string>();
        for (const ex of exercisesCatalog?.exercises ?? []) {
            map.set(ex.id, exerciseDisplayName(ex));
        }
        return map;
    }, [exercisesCatalog?.exercises]);

    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined);
    const trainerId = trainerProfile?.id ?? 0;
    const [updateSession, { isLoading: isCancelling }] = useUpdateStandaloneSessionMutation();
    const [deleteSession, { isLoading: isDeleting }] = useDeleteStandaloneSessionMutation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleCancelSession = async () => {
        if (!session) return;
        try {
            await updateSession({
                sessionId: session.id,
                body: { status: "cancelled" },
            }).unwrap();
            showSuccess("Sesión cancelada.");
        } catch {
            showError("No se pudo cancelar la sesión.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!session || !trainerId) return;
        try {
            await deleteSession({
                sessionId: session.id,
                clientId: session.client_id,
                trainerId,
            }).unwrap();
            setShowDeleteModal(false);
            showSuccess("Sesión eliminada.");
            goBack();
        } catch {
            showError("No se pudo eliminar la sesión.");
        }
    };

    const displayExercises: SessionExerciseDisplay[] = useMemo(
        () =>
            exercises.map((exercise) => ({
                id: exercise.id,
                exerciseId: exercise.exercise_id,
                exerciseName:
                    exerciseNameById.get(exercise.exercise_id) ??
                    `Ejercicio #${exercise.exercise_id}`,
                order: exercise.order_in_session,
                plannedSets: exercise.planned_sets,
                plannedReps:
                    exercise.planned_reps != null ? String(exercise.planned_reps) : null,
                plannedDuration: exercise.planned_duration,
                plannedWeight: exercise.planned_weight,
                plannedRest: exercise.planned_rest,
                effortCharacter: null,
                effortValue: null,
                actualSets: exercise.actual_sets,
                actualReps: exercise.actual_reps != null ? String(exercise.actual_reps) : null,
                notes: exercise.notes,
            })),
        [exerciseNameById, exercises]
    );

    if (!sessionId || Number.isNaN(sessionId)) {
        return (
            <div className="p-6">
                <Alert variant="error">ID de sesión inválido</Alert>
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
                : "No se pudo cargar la sesión";

        return (
            <div className="p-6">
                <Alert variant="error">{errorMessage}</Alert>
                <div className="flex gap-3 mt-4">
                    <Button variant="outline" onClick={goBack}>
                        {backTarget ? "Volver" : "Volver a clientes"}
                    </Button>
                </div>
            </div>
        );
    }

    const statusLabel = STATUS_LABELS[session.status] || "Planificada";
    const statusStyle = STATUS_STYLES[session.status] || "bg-primary/15 text-primary";
    const sessionTypeKey = String(session.session_type || "").toLowerCase();
    const typeLabel = TYPE_LABELS[sessionTypeKey] || session.session_type || "--";
    const typeStyle = TYPE_STYLES[sessionTypeKey] || "bg-primary/20 text-primary";
    const clientName = client ? `${client.nombre} ${client.apellidos}` : "Cliente";

    return (
        <div className="space-y-6">
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
                                <Badge
                                    className={cn(
                                        "inline-flex items-center rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold",
                                        statusStyle
                                    )}
                                >
                                    {statusLabel}
                                </Badge>
                                <Badge
                                    className={cn(
                                        "inline-flex items-center rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold",
                                        typeStyle
                                    )}
                                >
                                    {typeLabel}
                                </Badge>
                                <Badge className="inline-flex items-center rounded-full border-0 bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                    Sesion libre
                                </Badge>
                            </div>
                        </div>
                        <p className={SESSION_DETAIL_CLIENT}>{clientName}</p>
                        <div className={SESSION_DETAIL_META}>
                            <span className={SESSION_DETAIL_META_ITEM}>
                                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                {formatLongDate(session.session_date)}
                            </span>
                            <span className={SESSION_DETAIL_META_ITEM}>
                                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                —
                            </span>
                            <span className={SESSION_DETAIL_META_ITEM}>
                                <Timer className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                {session.planned_duration ?? 0} min
                            </span>
                        </div>
                    </div>
                </div>
                <div className={SESSION_DETAIL_TOOLBAR}>
                    <PlatformHeaderBackButton onClick={goBack} />
                    <Button
                        variant="outline-primary"
                        className="min-h-touch-athlete w-full md:min-h-0 md:w-auto"
                        onClick={() =>
                            navigate(`/dashboard/standalone-sessions/${session.id}/edit`, {
                                state: location.state,
                            })
                        }
                    >
                        Editar
                    </Button>
                    {session.status === "planned" || session.status === "in_progress" ? (
                        <Button
                            variant="outline"
                            disabled={isCancelling}
                            onClick={handleCancelSession}
                        >
                            Cancelar sesión
                        </Button>
                    ) : null}
                    <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                        Eliminar
                    </Button>
                    {session.client_id ? (
                        <Button
                            variant="primary"
                            onClick={() =>
                                navigate(`/dashboard/clients/${session.client_id}?tab=sessions`)
                            }
                        >
                            Ver cliente
                        </Button>
                    ) : null}
                </div>
            </div>
            </div>

            {session.status === "completed" && (
                <StandaloneSessionLoadSummary
                    exercises={exercises}
                    enabled={session.status === "completed"}
                />
            )}

            <div>
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-semibold">Ejercicios</h2>
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {displayExercises.length}
                    </span>
                </div>
                {isLoadingExercises ? (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner size="md" />
                    </div>
                ) : isErrorExercises ? (
                    <Alert variant="error">No se pudieron cargar los ejercicios</Alert>
                ) : displayExercises.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No hay ejercicios registrados.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayExercises.map((exercise) => (
                            <SessionDetailExerciseCard key={exercise.id} exercise={exercise} />
                        ))}
                    </div>
                )}
            </div>

            <StandaloneSessionClientFeedbackPanel
                feedback={clientFeedback}
                isLoading={isLoadingFeedback}
                isError={isErrorFeedback}
            />

            {session.notes && (
                <div className="rounded-xl bg-card p-5">
                    <h3 className="mb-3 text-sm font-semibold">Notas</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {session.notes}
                    </p>
                </div>
            )}

            <NexiaPremiumConfirmModal
                isOpen={showDeleteModal}
                onClose={() => {
                    if (!isDeleting) setShowDeleteModal(false);
                }}
                onConfirm={handleConfirmDelete}
                title="Eliminar sesión suelta"
                description="Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                isLoading={isDeleting}
                loadingConfirmLabel="Eliminando…"
                closeOnBackdrop={!isDeleting}
                closeOnEsc={!isDeleting}
            />
        </div>
    );
};
