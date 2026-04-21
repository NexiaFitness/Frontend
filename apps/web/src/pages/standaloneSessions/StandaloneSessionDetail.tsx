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

import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, ChevronRight, Clock, Timer } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/Badge";
import {
    useGetStandaloneSessionQuery,
    useGetStandaloneSessionExercisesQuery,
} from "@nexia/shared/api/standaloneSessionsApi";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import type { SessionExerciseDisplay } from "@nexia/shared/hooks/sessionProgramming";
import { SessionDetailExerciseCard } from "@/components/sessionProgramming";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
    planned: "Planificada",
    completed: "Completada",
    cancelled: "Cancelada",
    skipped: "Cancelada",
    in_progress: "Planificada",
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

    const { data: client } = useGetClientQuery(session?.client_id || 0, {
        skip: !session?.client_id,
    });

    const displayExercises: SessionExerciseDisplay[] = useMemo(
        () =>
            exercises.map((exercise) => ({
                id: exercise.id,
                exerciseId: exercise.exercise_id,
                exerciseName: `Ejercicio #${exercise.exercise_id}`,
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
        [exercises]
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
                    <Button variant="outline" onClick={() => navigate("/dashboard/clients")}>
                        Volver a clientes
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
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <button
                    type="button"
                    className="hover:text-foreground"
                    onClick={() => navigate("/dashboard/sessions")}
                >
                    Sesiones
                </button>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                <span className="truncate font-medium text-foreground">{session.session_name}</span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                    <span className="relative flex h-14 w-14 shrink-0 overflow-hidden rounded-full">
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-success/20 text-lg font-bold text-success">
                            {getInitials(clientName)}
                        </span>
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl font-bold">{session.session_name}</h1>
                            <Badge
                                className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border-0",
                                    statusStyle
                                )}
                            >
                                {statusLabel}
                            </Badge>
                            <Badge
                                className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border-0",
                                    typeStyle
                                )}
                            >
                                {typeLabel}
                            </Badge>
                            <Badge className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border-0 bg-muted text-muted-foreground">
                                Sesion libre
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{clientName}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" aria-hidden />
                                {formatLongDate(session.session_date)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" aria-hidden />
                                --
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Timer className="h-3.5 w-3.5" aria-hidden />
                                {session.planned_duration ?? 0} min
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" onClick={() => navigate("/dashboard/sessions")}>
                        <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                        Volver
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

            {session.notes && (
                <div className="rounded-xl bg-card p-5">
                    <h3 className="mb-3 text-sm font-semibold">Notas</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {session.notes}
                    </p>
                </div>
            )}
        </div>
    );
};
