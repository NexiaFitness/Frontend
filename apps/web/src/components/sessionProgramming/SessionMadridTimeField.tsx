/**
 * SessionMadridTimeField — hora opcional de sesión con validación civil Europe/Madrid (I17).
 *
 * @author Frontend Team
 * @since 2026-10-06
 */

import React from "react";
import { TimePickerButton } from "@/components/ui/forms";
import { madridTrainerTimeError } from "@nexia/shared/utils/athlete/athleteCalendarUtils";
import {
    SESSION_PROGRAMMING_FIELD_COMPACT,
    SESSION_PROGRAMMING_FIELD_CONTROL,
    SESSION_PROGRAMMING_FIELD_ERROR,
    SESSION_PROGRAMMING_FIELD_HINT,
    SESSION_PROGRAMMING_FIELD_LABEL,
} from "@/components/sessionProgramming/sessionProgrammingPresentation";
import { cn } from "@/lib/utils";

export interface SessionMadridTimeFieldProps {
    dateKey: string;
    value: string;
    onChange: (value: string) => void;
    hint?: string;
}

export const SessionMadridTimeField: React.FC<SessionMadridTimeFieldProps> = ({
    dateKey,
    value,
    onChange,
    hint,
}) => {
    const error = value ? madridTrainerTimeError(dateKey, value) : null;
    return (
        <div className={SESSION_PROGRAMMING_FIELD_COMPACT}>
            <span className={SESSION_PROGRAMMING_FIELD_LABEL}>Hora (opcional)</span>
            <div
                className={cn(SESSION_PROGRAMMING_FIELD_CONTROL, "flex flex-wrap items-center gap-2")}
            >
                <TimePickerButton
                    label="Sin hora fijada"
                    value={value}
                    onChange={onChange}
                    aria-label="Hora de la sesión"
                />
                {value ? (
                    <button
                        type="button"
                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                        onClick={() => onChange("")}
                    >
                        Quitar hora
                    </button>
                ) : null}
            </div>
            {error ? (
                <p className={SESSION_PROGRAMMING_FIELD_ERROR} role="alert">
                    {error}
                </p>
            ) : hint ? (
                <p className={SESSION_PROGRAMMING_FIELD_HINT}>{hint}</p>
            ) : null}
        </div>
    );
};
