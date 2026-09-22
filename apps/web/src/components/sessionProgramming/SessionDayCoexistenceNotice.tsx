/**
 * SessionDayCoexistenceNotice — QA-9 en constructor: día con sesión(es) ya creada(s).
 */

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { SessionListItem } from "@nexia/shared/types/standaloneSessions";
import {
    SESSION_DAY_COEXISTENCE_COPY,
    sessionDayCoexistenceHeadline,
    type SessionDayCoexistenceKind,
} from "@nexia/shared/training/sessionDayCoexistenceCopy";
import { ClientDaySessionsPickerSheet } from "@/components/clients/session/ClientDaySessionsPickerSheet";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";

import {
    SESSION_DAY_COEXISTENCE_ACTIONS,
    SESSION_DAY_COEXISTENCE_BODY,
    SESSION_DAY_COEXISTENCE_SHELL,
    SESSION_DAY_COEXISTENCE_TITLE,
} from "./sessionDayCoexistencePresentation";

function sessionDetailPath(session: SessionListItem): string {
    return session.session_kind === "standalone"
        ? `/dashboard/standalone-sessions/${session.id}`
        : `/dashboard/session-programming/sessions/${session.id}`;
}

export interface SessionDayCoexistenceNoticeProps {
    sessions: readonly SessionListItem[];
    sessionDate: string;
    creatingKind: SessionDayCoexistenceKind;
    activePlanCoversDate: boolean;
    onChooseStandalone?: () => void;
    className?: string;
}

export const SessionDayCoexistenceNotice: React.FC<SessionDayCoexistenceNoticeProps> = ({
    sessions,
    sessionDate,
    creatingKind,
    activePlanCoversDate,
    onChooseStandalone,
    className,
}) => {
    const navigate = useNavigate();
    const [pickerOpen, setPickerOpen] = useState(false);

    const dateLabel = useMemo(() => {
        return new Date(`${sessionDate}T12:00:00`).toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }, [sessionDate]);

    if (sessions.length === 0) return null;

    const headline = sessionDayCoexistenceHeadline(sessions.length);
    const body =
        creatingKind === "program"
            ? SESSION_DAY_COEXISTENCE_COPY.bodyProgram
            : SESSION_DAY_COEXISTENCE_COPY.bodyStandalone;

    const openExisting = () => {
        if (sessions.length === 1) {
            navigate(sessionDetailPath(sessions[0]!));
            return;
        }
        setPickerOpen(true);
    };

    return (
        <>
            <div
                className={cn(SESSION_DAY_COEXISTENCE_SHELL, className)}
                role="status"
                aria-live="polite"
            >
                <p className={SESSION_DAY_COEXISTENCE_TITLE}>{headline}</p>
                <p className={SESSION_DAY_COEXISTENCE_BODY}>{body}</p>
                <div className={SESSION_DAY_COEXISTENCE_ACTIONS}>
                    <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={openExisting}
                    >
                        {sessions.length === 1
                            ? SESSION_DAY_COEXISTENCE_COPY.openSession
                            : SESSION_DAY_COEXISTENCE_COPY.pickSession}
                    </Button>
                    {creatingKind === "program" &&
                    activePlanCoversDate &&
                    onChooseStandalone ? (
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={onChooseStandalone}
                        >
                            {SESSION_DAY_COEXISTENCE_COPY.createStandalone}
                        </Button>
                    ) : null}
                </div>
            </div>

            <ClientDaySessionsPickerSheet
                isOpen={pickerOpen}
                dateLabel={dateLabel}
                sessions={[...sessions]}
                onClose={() => setPickerOpen(false)}
                onSelect={(session) => {
                    setPickerOpen(false);
                    navigate(sessionDetailPath(session));
                }}
            />
        </>
    );
};
