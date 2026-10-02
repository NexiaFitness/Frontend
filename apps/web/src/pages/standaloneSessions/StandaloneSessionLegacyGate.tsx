/**
 * D10 — Rutas /standalone-sessions/:id*: legacy StandaloneSession o redirect a TrainingSession.
 * Evita colisión de IDs: primero standalone; si 404, training session unificada.
 */

import React from "react";
import { Navigate, useParams } from "react-router-dom";

import { useGetStandaloneSessionQuery } from "@nexia/shared/api/standaloneSessionsApi";
import { useGetTrainingSessionQuery } from "@nexia/shared/api/trainingSessionsApi";
import { LoadingSpinner } from "@/components/ui/feedback";

import { StandaloneSessionDetail } from "./StandaloneSessionDetail";
import { EditStandaloneSession } from "./EditStandaloneSession";

type GateMode = "detail" | "edit";

function trainingSessionPath(id: number, mode: GateMode): string {
    return mode === "edit"
        ? `/dashboard/session-programming/edit-session/${id}`
        : `/dashboard/session-programming/sessions/${id}`;
}

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
        return mode === "edit" ? <EditStandaloneSession /> : <StandaloneSessionDetail />;
    }

    if (training.isSuccess && training.data) {
        return <Navigate to={trainingSessionPath(sessionId, mode)} replace />;
    }

    return <Navigate to="/dashboard/sessions" replace />;
};
