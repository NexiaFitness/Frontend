/**
 * SessionPrescriptionEditAction.tsx — Entrada «Editar» o el motivo del candado B-33.
 *
 * Contexto: ficha y revisión. La regla está en @nexia/shared
 * isSessionPrescriptionLocked. El summary de ejecución se pide aquí para que
 * SessionReviewPage (ya >600) no crezca; RTK comparte la query de la ficha.
 *
 * @author Frontend Team
 * @since v6.6.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { isSessionPrescriptionLocked } from "@nexia/shared";
import { useGetSessionExecutionSummaryQuery } from "@nexia/shared/api/trainingSessionsApi";
import { Button, type ButtonVariant } from "@/components/ui/buttons";
import {
    SESSION_PRESCRIPTION_LOCKED_BODY,
    SESSION_PRESCRIPTION_LOCKED_FOOTER_CLASS,
} from "./sessionPrescriptionLockPresentation";

interface SessionPrescriptionFields {
    status: string;
    actual_duration?: number | null;
    actual_volume?: number | null;
    actual_intensity?: number | null;
}

interface SessionPrescriptionEditActionProps {
    sessionId: number;
    session: SessionPrescriptionFields;
    returnState?: unknown;
    label?: string;
    buttonVariant?: ButtonVariant;
}

export const SessionPrescriptionEditAction: React.FC<
    SessionPrescriptionEditActionProps
> = ({
    sessionId,
    session,
    returnState,
    label = "Editar sesión",
    buttonVariant = "primary",
}) => {
    const navigate = useNavigate();
    const { data: summary, isError, isFetching } = useGetSessionExecutionSummaryQuery(
        sessionId,
        { skip: !sessionId },
    );

    const locked = isSessionPrescriptionLocked({
        status: session.status,
        actual_duration: session.actual_duration,
        actual_volume: session.actual_volume,
        actual_intensity: session.actual_intensity,
        hasExecutions: summary?.has_executions === true,
    });

    if (isFetching && !summary && !isError && !locked) {
        return null;
    }

    if (locked) {
        return (
            <p className={SESSION_PRESCRIPTION_LOCKED_FOOTER_CLASS} role="status">
                {SESSION_PRESCRIPTION_LOCKED_BODY}
            </p>
        );
    }

    return (
        <Button
            variant={buttonVariant}
            size="sm"
            onClick={() =>
                navigate(`/dashboard/session-programming/edit-session/${sessionId}`, {
                    state: returnState,
                })
            }
        >
            <Pencil className="size-3.5 shrink-0" aria-hidden />
            {label}
        </Button>
    );
};
