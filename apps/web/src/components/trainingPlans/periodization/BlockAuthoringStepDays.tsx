/**
 * BlockAuthoringStepDays.tsx — Toggles L M X J V S D (regla recurrente del bloque).
 *
 * N4: solo días ISO presentes en [start_date, end_date]. Opt-in días habituales del cliente (edit).
 */

import React, { useCallback, useMemo } from "react";

import {
    blockWeekdayUnavailableReason,
    getWeekdaysPresentInBlockRange,
} from "@nexia/shared";

import { Button } from "@/components/ui/buttons";

import {
    AUTHORING_DAY_TOGGLE_TRACK_CLASS,
    AUTHORING_STEP_META_CLASS,
    WEEKDAY_ISO_ORDER,
    WEEKDAY_LABELS_ES,
    authoringDayToggleClass,
    periodUnitPhrase,
} from "./phaseAuthoringPresentation";

interface Props {
    activeDays: readonly number[];
    onToggleDay: (dayOfWeek: number) => void;
    startDate: string | null;
    endDate: string | null;
    /** Unidad de copy en toggles: «fase» (autoría local) o «bloque» (D-PAP persistido). */
    periodUnit?: "fase" | "bloque";
    hideIntro?: boolean;
    showApplyHabitualDays?: boolean;
    onApplyHabitualDays?: () => void;
}

export const BlockAuthoringStepDays: React.FC<Props> = ({
    activeDays,
    onToggleDay,
    startDate,
    endDate,
    periodUnit = "fase",
    hideIntro = false,
    showApplyHabitualDays = false,
    onApplyHabitualDays,
}) => {
    const activeSet = new Set(activeDays);
    const periodLabel = periodUnitPhrase(periodUnit);

    const selectableDays = useMemo(() => {
        if (!startDate || !endDate) {
            return new Set(WEEKDAY_ISO_ORDER);
        }
        return new Set(getWeekdaysPresentInBlockRange(startDate, endDate));
    }, [startDate, endDate]);

    const handleKey = useCallback(
        (dayOfWeek: number) => () => {
            if (!selectableDays.has(dayOfWeek)) {
                return;
            }
            onToggleDay(dayOfWeek);
        },
        [onToggleDay, selectableDays],
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {!hideIntro ? (
                <>
                    <p className={AUTHORING_STEP_META_CLASS}>
                        Días de entrenamiento en {periodLabel}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Regla recurrente para todas las semanas de {periodLabel}. No modifica el
                        perfil del cliente.
                    </p>
                </>
            ) : null}
            {showApplyHabitualDays && onApplyHabitualDays ? (
                <div className="flex flex-wrap items-center gap-3">
                    <Button type="button" variant="secondary" size="sm" onClick={onApplyHabitualDays}>
                        Usar días habituales del cliente
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        Solo se activan los días que caen dentro del rango del bloque.
                    </p>
                </div>
            ) : null}
            <div
                className={AUTHORING_DAY_TOGGLE_TRACK_CLASS}
                role="group"
                aria-label="Días de la semana"
            >
                {WEEKDAY_ISO_ORDER.map((iso, index) => {
                    const active = activeSet.has(iso);
                    const enabled =
                        selectableDays.size === 0 || selectableDays.has(iso);
                    const disabledReason =
                        startDate && endDate
                            ? blockWeekdayUnavailableReason(iso, startDate, endDate)
                            : null;
                    return (
                        <button
                            key={iso}
                            type="button"
                            aria-pressed={active}
                            aria-disabled={!enabled}
                            disabled={!enabled}
                            title={disabledReason ?? WEEKDAY_LABELS_ES[index]}
                            aria-label={
                                disabledReason
                                    ? `${WEEKDAY_LABELS_ES[index]}: ${disabledReason}`
                                    : WEEKDAY_LABELS_ES[index]
                            }
                            onClick={handleKey(iso)}
                            className={authoringDayToggleClass(active, !enabled)}
                        >
                            {WEEKDAY_LABELS_ES[index]}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
