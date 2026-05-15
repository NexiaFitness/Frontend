/**
 * SessionReviewPage.tsx — Página de revisión post-creación/edición de sesión
 *
 * Contexto:
 * - Fase A: unifica el flujo post-guardado de CreateSession y EditSession.
 * - Reemplaza el drawer de SessionValidationPanel con una vista de página completa.
 * - Recibe trainingSessionId por URL params; hace fetch de sesión, bloques,
 *   coherencia y validación independientemente.
 *
 * Layout:
 * - Desktop: 2 columnas (resumen izquierda 1fr, validación derecha 420px).
 * - Mobile: columna única, validación debajo del resumen.
 *
 * @author Frontend Team
 * @since v6.5.0 — Fase A review page
 */

import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, Pencil, CalendarPlus } from "lucide-react";

import { useGetTrainingSessionQuery, useGetSessionCoherenceQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetSessionBlocksQuery } from "@nexia/shared/api/sessionProgrammingApi";
import { useValidateSessionMutation } from "@nexia/shared/api/sessionValidationApi";
import {
    SESSION_TYPE_LABELS,
    TRAINING_SESSION_STATUS_LABELS,
} from "@nexia/shared/types/trainingSessions";
import type { TrainingSessionStatus } from "@nexia/shared/types/trainingSessions";

import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { SessionValidationContent } from "@/components/sessionProgramming/SessionValidationContent";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY } from "@/utils/typography";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" | "subtle" {
    switch (status) {
        case "completed":
            return "secondary";
        case "planned":
            return "default";
        case "skipped":
            return "destructive";
        case "modified":
            return "outline";
        default:
            return "subtle";
    }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SessionSummaryCard: React.FC<{
    session: {
        session_name: string;
        session_date: string | null;
        session_time?: string | null;
        session_type: string;
        status: string;
        planned_duration: number | null;
        actual_duration: number | null;
        notes: string | null;
        client_id: number;
    };
}> = ({ session }) => {
    return (
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className={cn(TYPOGRAPHY.cardTitle, "text-foreground")}>{session.session_name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {session.session_date ?? "Sin fecha"}
                        {session.session_time ? ` · ${session.session_time}` : ""}
                    </p>
                </div>
                <Badge variant={statusBadgeVariant(session.status)}>
                    {TRAINING_SESSION_STATUS_LABELS[session.status as TrainingSessionStatus] ?? session.status}
                </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Tipo</span>
                    <span className="text-sm font-medium text-foreground">
                        {SESSION_TYPE_LABELS[session.session_type as keyof typeof SESSION_TYPE_LABELS] ?? session.session_type}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Duración plan</span>
                    <span className="text-sm font-medium text-foreground">
                        {session.planned_duration ? `${session.planned_duration} min` : "—"}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Duración real</span>
                    <span className="text-sm font-medium text-foreground">
                        {session.actual_duration ? `${session.actual_duration} min` : "—"}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Cliente ID</span>
                    <span className="text-sm font-medium text-foreground">{session.client_id}</span>
                </div>
            </div>

            {session.notes && (
                <div className="rounded-md bg-surface p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Notas</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{session.notes}</p>
                </div>
            )}
        </div>
    );
};

const BlocksSummary: React.FC<{
    blocks: Array<{
        id: number;
        order_in_session: number;
        set_type: string | null;
        rounds: number | null;
        planned_volume: number | null;
    }>;
}> = ({ blocks }) => {
    if (blocks.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg p-5">
                <p className="text-sm text-muted-foreground">Sin bloques de ejercicios.</p>
            </div>
        );
    }
    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-surface/50">
                <h3 className="text-sm font-semibold text-foreground">Bloques ({blocks.length})</h3>
            </div>
            <div className="divide-y divide-border">
                {blocks.map((block) => (
                    <div key={block.id} className="px-4 py-3 flex items-center justify-between hover:bg-surface/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-muted-foreground w-6">{block.order_in_session}</span>
                            <span className="text-sm text-foreground capitalize">{block.set_type?.replace(/_/g, " ") ?? "Bloque"}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {block.rounds != null && <span>{block.rounds} rondas</span>}
                            {block.planned_volume != null && <span>Vol: {block.planned_volume}</span>}
                        </div>
                    </div>
                ))}
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

    const { data: coherence } = useGetSessionCoherenceQuery(sessionId, {
        skip: !sessionId || isNaN(sessionId),
    });

    const [validateSession, { isLoading: isValidating, data: validationData, error: validationError }] =
        useValidateSessionMutation();

    useEffect(() => {
        if (sessionId > 0) {
            validateSession({ trainingSessionId: sessionId });
        }
    }, [sessionId, validateSession]);

    const hasCoherenceWarnings = useMemo(() => {
        return (coherence?.coherence_warnings?.length ?? 0) > 0;
    }, [coherence]);

    if (!sessionId || isNaN(sessionId)) {
        return (
            <div className="px-4 lg:px-8 py-8">
                <Alert variant="error">ID de sesión inválido.</Alert>
            </div>
        );
    }

    if (isLoadingSession) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
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

    return (
        <div className="space-y-8 pb-8 px-4 lg:px-8">
            {/* Header */}
            <div className="space-y-4">
                <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/sessions")}
                        className="hover:text-foreground transition-colors"
                    >
                        Sesiones
                    </button>
                    <ChevronRight className="size-4" />
                    <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
                        {session.session_name}
                    </span>
                    <ChevronRight className="size-4" />
                    <span className="text-foreground font-medium">Revisión</span>
                </nav>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className={cn(TYPOGRAPHY.pageTitle, "text-foreground")}>Revisión de sesión</h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                            Volver
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/session-programming/edit-session/${sessionId}`)}
                        >
                            <Pencil className="mr-1 h-4 w-4" aria-hidden />
                            Editar
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/dashboard/scheduling/new")}
                        >
                            <CalendarPlus className="mr-1 h-4 w-4" aria-hidden />
                            Programar siguiente
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Left column — Session summary */}
                <div className="flex-1 space-y-6">
                    <SessionSummaryCard session={session} />
                    {isLoadingBlocks ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : (
                        <BlocksSummary blocks={blocks} />
                    )}
                </div>

                {/* Right column — Validation */}
                <div className="lg:w-[420px] shrink-0 space-y-6">
                    {hasCoherenceWarnings && (
                        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 space-y-2">
                            <h3 className="text-sm font-semibold text-foreground">Avisos de coherencia</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                                {coherence!.coherence_warnings.map((w, i) => (
                                    <li key={i}>{w.message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="bg-card border border-border rounded-lg p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Validación del plan</h3>
                        <SessionValidationContent
                            data={validationData ?? null}
                            isLoading={isValidating}
                            error={validationError ?? null}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
