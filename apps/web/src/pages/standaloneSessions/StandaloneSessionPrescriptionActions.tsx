/**
 * StandaloneSessionPrescriptionActions.tsx — Editar / cancelar de una suelta (B-33).
 *
 * Contexto: StandaloneSessionDetail no debe crecer con la regla de candado.
 * El aviso largo no cabe en SESSION_DETAIL_TOOLBAR (fila md); va en slot notice.
 */

import React, { useMemo } from "react";
import {
    isSessionPrescriptionLocked,
    standaloneExercisesHaveExecutions,
} from "@nexia/shared";
import type {
    StandaloneSessionExerciseOut,
    StandaloneSessionOut,
} from "@nexia/shared/types/standaloneSessions";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { SessionPrescriptionEditAction } from "@/components/sessionProgramming/SessionPrescriptionEditAction";
import {
    SESSION_PRESCRIPTION_LOCKED_BODY,
    SESSION_PRESCRIPTION_LOCKED_TITLE,
} from "@/components/sessionProgramming/sessionPrescriptionLockPresentation";

interface StandaloneSessionPrescriptionActionsProps {
    session: StandaloneSessionOut;
    exercises: StandaloneSessionExerciseOut[];
    returnState: unknown;
    isCancelling: boolean;
    onCancel: () => void;
    slot: "toolbar" | "notice";
}

export const StandaloneSessionPrescriptionActions: React.FC<
    StandaloneSessionPrescriptionActionsProps
> = ({ session, exercises, returnState, isCancelling, onCancel, slot }) => {
    const hasExecutions = useMemo(
        () => standaloneExercisesHaveExecutions(exercises),
        [exercises],
    );
    const locked = isSessionPrescriptionLocked({
        status: session.status,
        actual_duration: session.actual_duration,
        hasExecutions,
    });

    if (slot === "notice") {
        if (!locked) {
            return null;
        }
        return (
            <Alert
                variant="info"
                title={SESSION_PRESCRIPTION_LOCKED_TITLE}
                description={SESSION_PRESCRIPTION_LOCKED_BODY}
            />
        );
    }

    if (locked) {
        return null;
    }

    const canCancel =
        session.status === "planned" || session.status === "in_progress";

    return (
        <>
            <SessionPrescriptionEditAction
                sessionId={session.id}
                session={session}
                returnState={returnState}
                label="Editar"
                buttonVariant="outline-primary"
                editHref={`/dashboard/standalone-sessions/${session.id}/edit`}
                skipExecutionSummary
                hasExecutions={hasExecutions}
                className="min-h-touch-athlete w-full md:min-h-0 md:w-auto"
            />
            {canCancel ? (
                <Button
                    variant="outline"
                    disabled={isCancelling}
                    onClick={onCancel}
                >
                    Cancelar sesión
                </Button>
            ) : null}
        </>
    );
};
