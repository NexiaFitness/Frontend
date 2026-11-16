/**
 * D10 — Rutas /standalone-sessions/:id*: legacy StandaloneSession o redirect a TrainingSession.
 * Evita colisión de IDs: primero standalone; si 404, training session unificada.
 * B-33: el modo edit de una suelta ejecutada no monta EditStandaloneSession.
 */

import React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import {
    isSessionPrescriptionLocked,
    standaloneExercisesHaveExecutions,
} from "@nexia/shared";
import {
    useGetStandaloneSessionExercisesQuery,
    useGetStandaloneSessionQuery,
} from "@nexia/shared/api/standaloneSessionsApi";
import { useGetTrainingSessionQuery } from "@nexia/shared/api/trainingSessionsApi";
import { Alert, LoadingSpinner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import {
    SESSION_PRESCRIPTION_LOCKED_BODY,
    SESSION_PRESCRIPTION_LOCKED_PAGE_STACK,
    SESSION_PRESCRIPTION_LOCKED_TITLE,
} from "@/components/sessionProgramming/sessionPrescriptionLockPresentation";

import { StandaloneSessionDetail } from "./StandaloneSessionDetail";
import { EditStandaloneSession } from "./EditStandaloneSession";

type GateMode = "detail" | "edit";

function trainingSessionPath(id: number, mode: GateMode): string {
    return mode === "edit"
        ? `/dashboard/session-programming/edit-session/${id}`
        : `/dashboard/session-programming/sessions/${id}`;
}

const StandaloneEditLockGate: React.FC<{ sessionId: number }> = ({ sessionId }) => {
    const navigate = useNavigate();
    const sessionQuery = useGetStandaloneSessionQuery(sessionId);
    const exercisesQuery = useGetStandaloneSessionExercisesQuery(sessionId, {
        skip: !sessionQuery.data,
    });

    if (sessionQuery.isLoading || (sessionQuery.data && exercisesQuery.isLoading)) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const session = sessionQuery.data;
    if (!session) {
        return <Navigate to="/dashboard/sessions" replace />;
    }

    const locked = isSessionPrescriptionLocked({
        status: session.status,
        actual_duration: session.actual_duration,
        hasExecutions: standaloneExercisesHaveExecutions(exercisesQuery.data),
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
                        navigate(`/dashboard/standalone-sessions/${session.id}`)
                    }
                >
                    Volver a la sesión
                </Button>
            </div>
        );
    }

    return <EditStandaloneSession />;
};

export const StandaloneSessionLegacyGate: React.FC<{ mode: GateMode }> = ({ mode }) => {
    const { id: idParam } = useParams<{ id: string }>();
    const sessionId = Number(idParam);

    const skip = !Number.isFinite(sessionId) || sessionId <= 0;

    const standalone = useGetStandaloneSessionQuery(sessionId, { skip });
    const hasLegacyStandalone =
        standalone.isSuccess && standalone.data != null;

    const training = useGetTrainingSessionQuery(sessionId, {
        skip: skip || standalone.isLoading || hasLegacyStandalone,
    });

    if (skip) {
        return <Navigate to="/dashboard/sessions" replace />;
    }

    if (standalone.isLoading || training.isLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (standalone.isSuccess && standalone.data) {
        return mode === "edit" ? (
            <StandaloneEditLockGate sessionId={sessionId} />
        ) : (
            <StandaloneSessionDetail />
        );
    }

    if (training.isSuccess && training.data) {
        return <Navigate to={trainingSessionPath(sessionId, mode)} replace />;
    }

    return <Navigate to="/dashboard/sessions" replace />;
};
