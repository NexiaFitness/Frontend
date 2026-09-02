/**
 * BlockAuthoringStepDays.tsx — Toggles L M X J V S D (regla recurrente del bloque).
 */

import React, { useCallback } from "react";

import {
    AUTHORING_DAY_TOGGLE_TRACK_CLASS,
    AUTHORING_STEP_META_CLASS,
    WEEKDAY_ISO_ORDER,
    WEEKDAY_LABELS_ES,
    authoringDayToggleClass,
} from "./phaseAuthoringPresentation";

interface Props {
    activeDays: readonly number[];
    onToggleDay: (dayOfWeek: number) => void;
}

export const BlockAuthoringStepDays: React.FC<Props> = ({
    activeDays,
    onToggleDay,
}) => {
    const activeSet = new Set(activeDays);

    const handleKey = useCallback(
        (dayOfWeek: number) => () => onToggleDay(dayOfWeek),
        [onToggleDay],
    );

    return (
        <div className="space-y-4">
            <p className={AUTHORING_STEP_META_CLASS}>
                Días de entrenamiento en el bloque
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
                Regla recurrente para todas las semanas del bloque. No modifica el
                perfil del cliente.
            </p>
            <div
                className={AUTHORING_DAY_TOGGLE_TRACK_CLASS}
                role="group"
                aria-label="Días de la semana"
            >
                {WEEKDAY_ISO_ORDER.map((iso, index) => {
                    const active = activeSet.has(iso);
                    return (
                        <button
                            key={iso}
                            type="button"
                            aria-pressed={active}
                            aria-label={WEEKDAY_LABELS_ES[index]}
                            onClick={handleKey(iso)}
                            className={authoringDayToggleClass(active)}
                        >
                            {WEEKDAY_LABELS_ES[index]}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
