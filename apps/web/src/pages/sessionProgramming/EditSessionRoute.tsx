/**
 * EditSessionRoute.tsx — Gate B-33 delante del constructor (EditSession.tsx
 * ya supera 1000 líneas y no puede crecer).
 *
 * Contexto: deep link /edit-session/:id. Si la sesión está ejecutada, no se
 * monta el editor; se explica el motivo. El 409 del PUT /full sigue existiendo
 * por si el estado cambia entre la lectura y el guardado.
 *
 * @author Frontend Team
 * @since v6.6.0
 */

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isSessionPrescriptionLocked } from "@nexia/shared";
import {
    useGetSessionExecutionSummaryQuery,
    useGetTrainingSessionQuery,
} from "@nexia/shared/api/trainingSessionsApi";
import { Alert, LoadingSpinner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { ResourceQueryState } from "@/components/ui/feedback/ResourceQueryState";
import {
    SESSION_PRESCRIPTION_LOCKED_BODY,
    SESSION_PRESCRIPTION_LOCKED_PAGE_STACK,
    SESSION_PRESCRIPTION_LOCKED_TITLE,
} from "@/components/sessionProgramming/sessionPrescriptionLockPresentation";
import { EditSession } from "./EditSession";

export const EditSessionRoute: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const sessionId = id ? Number(id) : NaN;
    const skip = !sessionId || Number.isNaN(sessionId);

    const {
        data: session,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetTrainingSessionQuery(sessionId, { skip });
    const { data: summary, isFetching: summaryFetching } =
        useGetSessionExecutionSummaryQuery(sessionId, {
            skip: skip || !session,
        });

    if (skip) {
        return (
            <div className="p-6">
                <Alert variant="error" title="ID de sesión inválido" />
            </div>
        );
    }

    if (isLoading || (session && summaryFetching && summary === undefined)) {
        return (
            <div
                className="flex min-h-screen items-center justify-center"
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
                onRetry={() => {
                    void refetch();
                }}
                fallbackPath="/dashboard/sessions"
            />
        );
    }

    const locked = isSessionPrescriptionLocked({
        status: session.status,
        actual_duration: session.actual_duration,
        actual_volume: session.actual_volume,
        actual_intensity: session.actual_intensity,
        hasExecutions: summary?.has_executions === true,
    });

    if (locked) {
        return (
            <div className={SESSION_PRESCRIPTION_LOCKED_PAGE_STACK}>
                <Alert
                    variant="info"
                    title={SESSION_PRESCRIPTION_LOCKED_TITLE}
                    description={SESSION_PRESCRIPTION_LOCKED_BODY}
                />
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                        navigate(`/dashboard/session-programming/sessions/${session.id}`)
                    }
                >
                    Volver a la sesión
                </Button>
            </div>
        );
    }

    return <EditSession />;
};
