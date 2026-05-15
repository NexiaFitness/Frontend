/**
 * SessionReviewPage.tsx — Página de revisión post-creación/edición de sesión
 *
 * Contexto:
 * - Fase A: unifica flujo post-guardado de CreateSession y EditSession.
 * - Fase B: enriquece la vista con contexto de cliente, ejercicios detallados
 *   (bloques + legacy), resumen plan vs real, y validación profesional.
 *
 * Layout:
 * - Desktop: 2 columnas (resumen izquierda 1fr, validación derecha 420px).
 * - Mobile: columna única, validación debajo.
 *
 * @author Frontend Team
 * @since v6.5.0 — Fase A review page
 * @updated v6.6.0 — Fase B enriched UX
 */

import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronRight,
    ArrowLeft,
    Pencil,
    CalendarPlus,
    Clock,
    Gauge,
    Dumbbell,
    FileText,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";

import { useGetTrainingSessionQuery, useGetSessionCoherenceQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetSessionExercisesQuery } from "@nexia/shared/api/trainingSessionsApi";
import {
    useGetSessionBlocksQuery,
    useGetSessionBlockExercisesQuery,
} from "@nexia/shared/api/sessionProgrammingApi";
import { useValidateSessionMutation } from "@nexia/shared/api/sessionValidationApi";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import {
    SESSION_TYPE_LABELS,
    TRAINING_SESSION_STATUS_LABELS,
} from "@nexia/shared/types/trainingSessions";
import type { TrainingSessionStatus } from "@nexia/shared/types/trainingSessions";
import type { SessionBlock, SessionBlockExercise } from "@nexia/shared/types/sessionProgramming";
import type { SessionExercise } from "@nexia/shared/types/trainingSessions";
import type { Client } from "@nexia/shared/types/client";

import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { SessionValidationContent } from "@/components/sessionProgramming/SessionValidationContent";
import { ClientAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY } from "@/utils/typography";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function statusIcon(status: string) {
    switch (status) {
        case "completed":
            return <CheckCircle2 className="size-4" />;
        case "skipped":
            return <AlertTriangle className="size-4" />;
        default:
            return null;
    }
}

function formatDuration(min: number | null): string {
    if (min == null) return "—";
    return `${min} min`;
}

function formatValue(v: number | null, suffix = ""): string {
    if (v == null) return "—";
    return `${v}${suffix}`;
}

function buildExercisesMap(exercises: Array<{ id: number; nombre: string }> | undefined): Map<number, string> {
    const map = new Map<number, string>();
    if (!exercises) return map;
    for (const ex of exercises) {
        map.set(ex.id, ex.nombre);
    }
    return map;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const MetricPair: React.FC<{
    label: string;
    planned: React.ReactNode;
    actual: React.ReactNode;
}> = ({ label, planned, actual }) => (
    <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">{actual}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{planned}</span>
        </div>
    </div>
);

const SessionReviewHeader: React.FC<{
    session: {
        session_name: string;
        status: string;
        session_type: string;
        client_id: number;
    };
    onBack: () => void;
    onEdit: () => void;
    onSchedule: () => void;
}> = ({ session, onBack, onEdit, onSchedule }) => {
    const { data: client, isLoading: isLoadingClient } = useGetClientQuery(session.client_id, {
        skip: !session.client_id,
    });

    const statusLabel = TRAINING_SESSION_STATUS_LABELS[session.status as TrainingSessionStatus] ?? session.status;

    return (
        <div className="space-y-4">
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <button type="button" onClick={onBack} className="hover:text-foreground transition-colors">
                    Sesiones
                </button>
                <ChevronRight className="size-4" />
                <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
                    {session.session_name}
                </span>
                <ChevronRight className="size-4" />
                <span className="text-foreground font-medium">Revisión</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                {isLoadingClient ? (
                    <div className="size-16 rounded-full bg-surface-2 animate-pulse" />
                ) : client ? (
                    <div className="flex-shrink-0">
                        <ClientAvatar
                            clientId={client.id}
                            nombre={client.nombre}
                            apellidos={client.apellidos}
                            size="lg"
                        />
                    </div>
                ) : null}

                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-3 gap-y-2">
                        <h1 className={cn(TYPOGRAPHY.detailPageTitle, "text-foreground")}>
                            {session.session_name}
                        </h1>
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                                statusBadgeClasses(session.status)
                            )}
                        >
                            {statusIcon(session.status)}
                            {statusLabel}
                        </span>
                    </div>

                    {client && (
                        <p className="text-sm text-muted-foreground">
                            {[
                                `${client.nombre} ${client.apellidos}`,
                                client.edad != null && `${client.edad} años`,
                                client.objetivo_entrenamiento,
                            ]
                                .filter(Boolean)
                                .join(" · ")}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onBack}>
                        <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                        Volver
                    </Button>
                    <Button variant="outline" size="sm" onClick={onEdit}>
                        <Pencil className="mr-1 h-4 w-4" aria-hidden />
                        Editar
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

const SessionSummaryCard: React.FC<{
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
    return (
        <div className="bg-card border border-border rounded-lg p-5 space-y-5">
            <div className="flex items-center gap-2">
                <FileText className="size-5 text-muted-foreground" />
                <h2 className={cn(TYPOGRAPHY.cardTitle, "text-foreground")}>Resumen de sesión</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Fecha</span>
                    <span className="text-sm font-medium text-foreground">
                        {session.session_date ?? "—"}
                    </span>
                </div>
                {session.session_time && (
                    <div className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Hora</span>
                        <span className="text-sm font-medium text-foreground">{session.session_time}</span>
                    </div>
                )}
                <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Tipo</span>
                    <span className="text-sm font-medium text-foreground">
                        {SESSION_TYPE_LABELS[session.session_type as keyof typeof SESSION_TYPE_LABELS] ?? session.session_type}
                    </span>
                </div>
                <MetricPair
                    label="Duración"
                    planned={formatDuration(session.planned_duration)}
                    actual={formatDuration(session.actual_duration)}
                />
                <MetricPair
                    label="Intensidad"
                    planned={formatValue(session.planned_intensity)}
                    actual={formatValue(session.actual_intensity)}
                />
                <MetricPair
                    label="Volumen"
                    planned={formatValue(session.planned_volume)}
                    actual={formatValue(session.actual_volume)}
                />
            </div>

            {session.notes && (
                <div className="rounded-md bg-surface p-3 space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Notas</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{session.notes}</p>
                </div>
            )}
        </div>
    );
};

const ExerciseRow: React.FC<{
    order: number;
    name: string;
    plannedSets: number | null;
    actualSets: number | null;
    plannedReps: string | number | null;
    actualReps: string | number | null;
    plannedWeight: number | null;
    actualWeight: number | null;
}> = ({ order, name, plannedSets, actualSets, plannedReps, actualReps, plannedWeight, actualWeight }) => {
    const hasActual = actualSets != null || actualReps != null || actualWeight != null;

    return (
        <div className="grid grid-cols-[2rem_1fr_5rem_5rem_5rem] sm:grid-cols-[2rem_1fr_6rem_6rem_6rem] gap-2 px-4 py-3 items-center hover:bg-surface/50 transition-colors text-sm">
            <span className="text-muted-foreground tabular-nums">{order}</span>
            <span className="text-foreground truncate font-medium" title={name}>{name}</span>
            <span className="text-muted-foreground tabular-nums text-right">
                {plannedSets ?? "—"} {actualSets != null ? <span className="text-foreground">/ {actualSets}</span> : ""}
            </span>
            <span className="text-muted-foreground tabular-nums text-right">
                {plannedReps ?? "—"} {actualReps != null ? <span className="text-foreground">/ {actualReps}</span> : ""}
            </span>
            <span className="text-muted-foreground tabular-nums text-right">
                {plannedWeight != null ? `${plannedWeight} kg` : "—"}{" "}
                {actualWeight != null ? <span className="text-foreground">/ {actualWeight} kg</span> : ""}
            </span>
            {hasActual && (
                <span className="hidden" aria-hidden />
            )}
        </div>
    );
};

const BlockExerciseCard: React.FC<{
    block: SessionBlock;
    exerciseNameMap: Map<number, string>;
}> = ({ block, exerciseNameMap }) => {
    const { data: exercises = [], isLoading } = useGetSessionBlockExercisesQuery(block.id, {
        skip: !block.id,
    });

    const hasExercises = exercises.length > 0;

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground w-6 shrink-0">{block.order_in_session}</span>
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground capitalize truncate">
                            {block.set_type?.replace(/_/g, " ") ?? "Bloque"}
                        </h3>
                        {block.rounds != null && (
                            <p className="text-xs text-muted-foreground">{block.rounds} rondas</p>
                        )}
                    </div>
                </div>
                {block.planned_volume != null && (
                    <Badge variant="subtle" className="shrink-0">
                        Vol {block.planned_volume}
                    </Badge>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-6">
                    <LoadingSpinner size="sm" />
                </div>
            ) : hasExercises ? (
                <div className="divide-y divide-border">
                    {/* Table header */}
                    <div className="grid grid-cols-[2rem_1fr_5rem_5rem_5rem] sm:grid-cols-[2rem_1fr_6rem_6rem_6rem] gap-2 px-4 py-2 bg-surface/50 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        <span>#</span>
                        <span>Ejercicio</span>
                        <span className="text-right">Sets</span>
                        <span className="text-right">Reps</span>
                        <span className="text-right">Peso</span>
                    </div>
                    {exercises.map((ex, idx) => (
                        <ExerciseRow
                            key={ex.id}
                            order={idx + 1}
                            name={exerciseNameMap.get(ex.exercise_id) ?? `Ejercicio #${ex.exercise_id}`}
                            plannedSets={ex.planned_sets}
                            actualSets={ex.actual_sets}
                            plannedReps={ex.planned_reps}
                            actualReps={ex.actual_reps}
                            plannedWeight={ex.planned_weight}
                            actualWeight={ex.actual_weight}
                        />
                    ))}
                </div>
            ) : (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Sin ejercicios en este bloque.
                </div>
            )}
        </div>
    );
};

const LegacyExercisesTable: React.FC<{
    exercises: SessionExercise[];
    exerciseNameMap: Map<number, string>;
}> = ({ exercises, exerciseNameMap }) => {
    if (exercises.length === 0) return null;

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-surface/50">
                <h3 className="text-sm font-semibold text-foreground">Ejercicios</h3>
            </div>
            <div className="divide-y divide-border">
                <div className="grid grid-cols-[2rem_1fr_5rem_5rem_5rem] sm:grid-cols-[2rem_1fr_6rem_6rem_6rem] gap-2 px-4 py-2 bg-surface/50 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    <span>#</span>
                    <span>Ejercicio</span>
                    <span className="text-right">Sets</span>
                    <span className="text-right">Reps</span>
                    <span className="text-right">Peso</span>
                </div>
                {exercises.map((ex, idx) => (
                    <ExerciseRow
                        key={ex.id}
                        order={idx + 1}
                        name={
                            ex.exercise?.nombre ??
                            exerciseNameMap.get(ex.exercise_id) ??
                            `Ejercicio #${ex.exercise_id}`
                        }
                        plannedSets={ex.planned_sets}
                        actualSets={ex.actual_sets}
                        plannedReps={ex.planned_reps}
                        actualReps={ex.actual_reps}
                        plannedWeight={ex.planned_weight}
                        actualWeight={ex.actual_weight}
                    />
                ))}
            </div>
        </div>
    );
};

const ValidationSection: React.FC<{
    coherenceWarnings: Array<{ message: string }> | undefined;
    validationData: import("@nexia/shared/types/sessionValidation").SessionValidationOut | null;
    isValidating: boolean;
    validationError: unknown | null;
}> = ({ coherenceWarnings, validationData, isValidating, validationError }) => {
    const hasWarnings = (coherenceWarnings?.length ?? 0) > 0;

    return (
        <div className="space-y-6">
            {hasWarnings && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-warning shrink-0" />
                        <h3 className="text-sm font-semibold text-foreground">Avisos de coherencia</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                        {coherenceWarnings!.map((w, i) => (
                            <li key={i}>{w.message}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Gauge className="size-5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">Validación del plan</h3>
                    {validationData && (
                        <span
                            className={cn(
                                "ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                                validationData.overall_status === "aligned"
                                    ? "bg-success/10 text-success border-success/30"
                                    : validationData.overall_status === "partially_aligned"
                                    ? "bg-primary/10 text-primary border-primary/30"
                                    : "bg-warning/10 text-warning border-warning/30"
                            )}
                        >
                            {validationData.overall_status === "aligned"
                                ? "Alineado"
                                : validationData.overall_status === "partially_aligned"
                                ? "Parcialmente alineado"
                                : "Revisar"}
                        </span>
                    )}
                </div>
                <SessionValidationContent
                    data={validationData}
                    isLoading={isValidating}
                    error={validationError}
                />
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export const SessionReviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const sessionId = id ? Number(id) : 0;

    const {
        data: session,
        isLoading: isLoadingSession,
        isError: isErrorSession,
    } = useGetTrainingSessionQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId),
    });

    const { data: blocks = [], isLoading: isLoadingBlocks } = useGetSessionBlocksQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId),
    });

    const { data: legacyExercises = [] } = useGetSessionExercisesQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId) || blocks.length > 0,
    });

    const { data: exercisesCatalog } = useGetExercisesQuery(
        { skip: 0, limit: 1000 },
        { skip: !sessionId || isNaN(sessionId) }
    );

    const { data: coherence } = useGetSessionCoherenceQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId),
    });

    const [validateSession, { isLoading: isValidating, data: validationData, error: validationError }] =
        useValidateSessionMutation();

    React.useEffect(() => {
        if (sessionId > 0) {
            validateSession({ trainingSessionId: sessionId });
        }
    }, [sessionId, validateSession]);

    const exerciseNameMap = useMemo(
        () => buildExercisesMap(exercisesCatalog?.exercises ?? []),
        [exercisesCatalog]
    );

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
                <p className="text-sm text-muted-foreground">Cargando sesión...</p>
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

    const hasBlocks = blocks.length > 0;
    const hasLegacy = legacyExercises.length > 0;

    return (
        <div className="space-y-8 pb-8 px-4 lg:px-8">
            <SessionReviewHeader
                session={session}
                onBack={() => navigate("/dashboard/sessions")}
                onEdit={() => navigate(`/dashboard/session-programming/edit-session/${sessionId}`)}
                onSchedule={() => navigate("/dashboard/scheduling/new")}
            />

            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Left column — Session summary + exercises */}
                <div className="flex-1 space-y-6">
                    <SessionSummaryCard session={session} />

                    {isLoadingBlocks ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : hasBlocks ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Dumbbell className="size-5 text-muted-foreground" />
                                <h2 className={cn(TYPOGRAPHY.cardTitle, "text-foreground")}>
                                    Bloques de ejercicios ({blocks.length})
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {blocks.map((block) => (
                                    <BlockExerciseCard
                                        key={block.id}
                                        block={block}
                                        exerciseNameMap={exerciseNameMap}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : hasLegacy ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Dumbbell className="size-5 text-muted-foreground" />
                                <h2 className={cn(TYPOGRAPHY.cardTitle, "text-foreground")}>
                                    Ejercicios ({legacyExercises.length})
                                </h2>
                            </div>
                            <LegacyExercisesTable
                                exercises={legacyExercises}
                                exerciseNameMap={exerciseNameMap}
                            />
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-lg p-5 text-center">
                            <p className="text-sm text-muted-foreground">Sin ejercicios registrados.</p>
                        </div>
                    )}
                </div>

                {/* Right column — Validation */}
                <div className="lg:w-[420px] shrink-0">
                    <ValidationSection
                        coherenceWarnings={coherence?.coherence_warnings}
                        validationData={validationData ?? null}
                        isValidating={isValidating}
                        validationError={validationError ?? null}
                    />
                </div>
            </div>
        </div>
    );
};
