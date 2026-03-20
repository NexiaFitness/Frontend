/**
 * SessionDetail.tsx — Detalle de sesión con layout estilo dashboard.
 * Contexto: muestra estado, cliente, plan del día, lesiones y ejercicios.
 * Notas de mantenimiento: usa contratos de @nexia/shared sin lógica hardcodeada.
 * @author Frontend Team
 * @since v6.3.0
 */

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, CheckCircle, ChevronRight, Clock, Dumbbell, Flame, Gauge, Pencil, Target, Timer } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Badge } from "@/components/ui/Badge";
import { useGetTrainingSessionQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useSessionExercisesDisplay } from "@nexia/shared/hooks/sessionProgramming";
import { cn } from "@/lib/utils";
const STATUS_LABELS: Record<string, string> = {
    planned: "Planificada",
    completed: "Completada",
    cancelled: "Cancelada",
    skipped: "Cancelada",
    modified: "Planificada",
    in_progress: "Planificada",
};

const STATUS_STYLES: Record<string, string> = {
    planned: "bg-primary/15 text-primary",
    completed: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
    cancelled: "bg-destructive/15 text-destructive",
    skipped: "bg-destructive/15 text-destructive",
    modified: "bg-primary/15 text-primary",
    in_progress: "bg-primary/15 text-primary",
};

const TYPE_LABELS: Record<string, string> = {
    strength: "Fuerza",
    cardio: "Cardio",
    technique: "Técnica",
    assessment: "Evaluación",
};

const TYPE_STYLES: Record<string, string> = {
    strength: "bg-primary/20 text-primary",
    cardio: "bg-warning/20 text-warning",
    technique: "bg-info/20 text-info",
    assessment: "bg-[hsl(270,60%,60%)]/20 text-[hsl(270,60%,60%)]",
};

type DayPlanSource = "daily_override" | "weekly_override" | "monthly_baseline";

interface DerivedDayPlan {
    source: DayPlanSource;
    qualities: Array<{ name: string; pct: number }>;
    volume: number;
    intensity: number;
}

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

export const SessionDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const sessionId = id ? Number(id) : 0;
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const { data: session, isLoading, isError, error } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId || Number.isNaN(sessionId) || !isAuthenticated,
    });

    const {
        exercises,
        isLoading: isLoadingExercises,
        isError: isErrorExercises,
    } = useSessionExercisesDisplay(
        sessionId && !Number.isNaN(sessionId) && isAuthenticated ? sessionId : null
    );

    const { data: plan } = useGetTrainingPlanQuery(session?.training_plan_id || 0, {
        skip: !session?.training_plan_id,
    });

    const { data: client } = useGetClientQuery(session?.client_id || 0, {
        skip: !session?.client_id,
    });

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
                        onClick={() => navigate("/dashboard/sessions")}
                    >
                        Volver a sesiones
                    </Button>
                </div>
            </div>
        );
    }

    const statusLabel = STATUS_LABELS[session.status] || "Planificada";
    const statusStyle = STATUS_STYLES[session.status] || "bg-primary/15 text-primary";
    const sessionTypeKey = String(session.session_type || "").toLowerCase();
    const typeLabel = TYPE_LABELS[sessionTypeKey] || session.session_type || "—";
    const typeStyle = TYPE_STYLES[sessionTypeKey] || "bg-primary/20 text-primary";
    const clientName = client ? `${client.nombre} ${client.apellidos}` : "Cliente";
    const injuryWarning = client?.lesiones_relevantes?.trim() || null;

    const dayPlan: DerivedDayPlan | null = (() => {
        if (!session.training_plan_id) return null;
        if (session.planned_intensity == null && session.planned_volume == null) return null;
        const volume = Math.max(0, Math.min(10, Number(session.planned_volume ?? 0)));
        const intensity = Math.max(0, Math.min(10, Number(session.planned_intensity ?? 0)));
        const qualities = [
            { name: "Volumen", pct: Math.round((volume / 10) * 100) },
            { name: "Intensidad", pct: Math.round((intensity / 10) * 100) },
        ];
        return {
            source: "monthly_baseline",
            qualities,
            volume,
            intensity,
        };
    })();

    const dayPlanSourceLabel = {
        daily_override: "Override diario",
        weekly_override: "Override semanal",
        monthly_baseline: "Baseline mensual",
    }[dayPlan?.source ?? "monthly_baseline"];

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

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <span className="relative flex h-14 w-14 shrink-0 overflow-hidden rounded-full">
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-success/20 text-lg font-bold text-success">
                            {getInitials(clientName)}
                        </span>
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-xl font-bold">{session.session_name}</h1>
                            <Badge className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border-0", statusStyle)}>
                                {statusLabel}
                            </Badge>
                            <Badge className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border-0", typeStyle)}>
                                {typeLabel}
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
                                {session.session_time ? session.session_time.slice(0, 5) : "—"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Timer className="h-3.5 w-3.5" aria-hidden />
                                {session.planned_duration ?? 0} min
                            </span>
                        </div>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary/30 bg-transparent px-4 py-2 text-sm font-medium text-primary hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.25)]"
                    onClick={() => navigate(`/dashboard/sessions/${session.id}/edit`)}
                >
                    <Pencil className="mr-1 h-4 w-4" aria-hidden />
                    Editar sesión
                </Button>
            </div>

            {dayPlan && (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
                    <div className="rounded-lg bg-surface p-4 col-span-2 lg:col-span-2 border-l-2 border-l-primary overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="rounded-lg bg-surface-2 p-2 text-primary">
                                <Target className="h-4 w-4" aria-hidden />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Plan del día</p>
                                <p className="text-xs text-muted-foreground">{dayPlanSourceLabel}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {dayPlan.qualities.map((q) => (
                                <span key={q.name} className="rounded-full bg-surface-2 border border-border/30 px-3 py-1 text-[11px] font-semibold">
                                    {q.name} <span className="text-primary ml-0.5">{q.pct}%</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg bg-surface p-4 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Volumen</p>
                                <p className="mt-1 text-3xl font-bold text-foreground">
                                    {dayPlan.volume}
                                    <span className="text-base font-normal text-muted-foreground">/10</span>
                                </p>
                            </div>
                            <div className="rounded-lg bg-surface-2 p-2.5 text-primary">
                                <Gauge className="h-5 w-5" aria-hidden />
                            </div>
                        </div>
                        <div className="mt-3 h-1.5 w-full rounded-full bg-surface-2">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${dayPlan.volume * 10}%` }}
                            />
                        </div>
                    </div>

                    <div className="rounded-lg bg-surface p-4 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_20px_hsl(var(--warning)/0.2)]">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Intensidad</p>
                                <p className="mt-1 text-3xl font-bold text-foreground">
                                    {dayPlan.intensity}
                                    <span className="text-base font-normal text-muted-foreground">/10</span>
                                </p>
                            </div>
                            <div className="rounded-lg bg-surface-2 p-2.5 text-[hsl(var(--warning))]">
                                <Flame className="h-5 w-5" aria-hidden />
                            </div>
                        </div>
                        <div className="mt-3 h-1.5 w-full rounded-full bg-surface-2">
                            <div
                                className="h-full rounded-full bg-[hsl(var(--warning))] transition-all"
                                style={{ width: `${dayPlan.intensity * 10}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {injuryWarning && (
                <Alert variant="warning">{injuryWarning}</Alert>
            )}

            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="rounded-lg bg-surface-2 p-2 text-primary">
                        <Dumbbell className="h-4 w-4" aria-hidden />
                    </div>
                    <h2 className="text-lg font-semibold">Ejercicios</h2>
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {exercises.length}
                    </span>
                </div>
                {isLoadingExercises ? (
                    <div className="flex items-center justify-center py-8">
                        <LoadingSpinner size="md" />
                    </div>
                ) : isErrorExercises ? (
                    <Alert variant="error">No se pudieron cargar los ejercicios</Alert>
                ) : (
                    <div className="space-y-2">
                        {exercises.map((exercise) => (
                            (() => {
                                const sets = Math.max(1, exercise.plannedSets ?? 1);
                                const hasProgressive =
                                    typeof exercise.plannedReps === "string" && exercise.plannedReps.includes(",");
                                const repSchemeLabel = hasProgressive ? "reps progresivas" : "reps fijas";
                                const repsToShow = hasProgressive
                                    ? exercise.plannedReps
                                          .split(",")
                                          .map((v) => v.trim())
                                          .filter(Boolean)
                                          .slice(0, sets)
                                    : Array.from({ length: sets }, () => String(exercise.plannedReps ?? 0));
                                const normalizedRepsToShow =
                                    repsToShow.length === sets
                                        ? repsToShow
                                        : [...repsToShow, ...Array.from({ length: sets - repsToShow.length }, () => String(exercise.plannedReps ?? 0))];

                                return (
                                    <div
                                        key={exercise.id}
                                        className="rounded-lg bg-surface border border-border/30 overflow-hidden transition-all duration-150 hover:border-border/60"
                                    >
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary tabular-nums">
                                                {exercise.order}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-sm font-semibold">{exercise.exerciseName}</span>
                                            </div>
                                        </div>
                                        <div className="border-t border-border/30 bg-surface-2/30 px-4 py-3">
                                            <div className="flex items-center justify-between mb-2.5">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                    {sets} series · {repSchemeLabel}
                                                </span>
                                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Timer className="h-3 w-3" aria-hidden />
                                                    {exercise.plannedRest ?? 0}s descanso entre series
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                {normalizedRepsToShow.map((reps, i) => (
                                                    <div
                                                        key={`${exercise.id}-set-${i + 1}`}
                                                        className="flex-1 flex flex-col items-center gap-0.5 rounded-lg bg-primary/10 border border-primary/20 py-3"
                                                    >
                                                        <span className="text-[10px] font-medium text-primary/60">S{i + 1}</span>
                                                        <span className="text-lg font-bold tabular-nums text-primary leading-none">
                                                            {reps}
                                                        </span>
                                                        <span className="text-[9px] text-primary/50">reps</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        ))}
                    </div>
                )}
            </div>

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
        </div>
    );
};

