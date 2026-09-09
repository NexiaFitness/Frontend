/**
 * BlockAuthoringStepPatterns.tsx — Asignación manual de patrones por día activo (D-ST F2).
 */

import React, { useCallback, useMemo, useState } from "react";
import { Pencil } from "lucide-react";

import type { MovementPattern } from "@nexia/shared/types/exercise";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

import {
    AUTHORING_PATTERN_DAY_CARD_EMPTY_CLASS,
    AUTHORING_PATTERN_DAY_CARD_EDIT_ICON_WRAP_CLASS,
    AUTHORING_PATTERN_DAY_CARD_TITLE_CLASS,
    AUTHORING_PATTERN_DAY_LIST_CLASS,
    authoringPatternDayCardClass,
} from "./blockAuthoringPatternsPresentation";
import { BlockPatternPickerSheet } from "./BlockPatternPickerSheet";
import { PatternBadge } from "./PatternBadge";
import { PeriodBlockIconButton } from "./PeriodBlockIconButton";
import {
    copyPatternsFromDayToDay,
    getCopyablePatternSourceDays,
    getPatternsForDayFromWeek1,
    togglePatternOnRecurringDay,
} from "./blockAuthoringPatternsUtils";
import type { PatternPickerCopySource } from "./PatternPickerDescription";
import {
    AUTHORING_STEP_META_CLASS,
    WEEKDAY_LABELS_ES,
    periodUnitPhrase,
} from "./phaseAuthoringPresentation";

interface Props {
    activeDays: readonly number[];
    weeklyStructure: readonly WeeklyStructureWeekCreate[];
    onWeeklyStructureChange: (next: WeeklyStructureWeekCreate[]) => void;
    catalog: MovementPattern[];
    catalogLoading?: boolean;
    catalogError?: boolean;
    periodUnit?: "fase" | "bloque";
    hideIntro?: boolean;
}

function patternDisplayName(pattern: MovementPattern): string {
    return pattern.name_es?.trim() || pattern.name_en;
}

const WEEKDAY_FULL_ES = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
];

export const BlockAuthoringStepPatterns: React.FC<Props> = ({
    activeDays,
    weeklyStructure,
    onWeeklyStructureChange,
    catalog,
    catalogLoading,
    catalogError,
    periodUnit = "fase",
    hideIntro = false,
}) => {
    const [pickerDay, setPickerDay] = useState<number | null>(null);
    const periodLabel = periodUnitPhrase(periodUnit);

    const catalogById = useMemo(
        () => new Map(catalog.map((p) => [p.id, p])),
        [catalog],
    );

    const sortedDays = useMemo(
        () => [...activeDays].sort((a, b) => a - b),
        [activeDays],
    );

    const handleToggle = useCallback(
        (dayOfWeek: number, patternId: number) => {
            onWeeklyStructureChange(
                togglePatternOnRecurringDay(
                    weeklyStructure,
                    dayOfWeek,
                    patternId,
                ),
            );
        },
        [weeklyStructure, onWeeklyStructureChange],
    );

    const pickerPatterns = pickerDay != null
        ? getPatternsForDayFromWeek1(weeklyStructure, pickerDay)
        : [];
    const pickerLabel =
        pickerDay != null ? WEEKDAY_FULL_ES[pickerDay - 1] ?? `Día ${pickerDay}` : "";

    const pickerCopySources = useMemo((): PatternPickerCopySource[] => {
        if (pickerDay == null) return [];
        return getCopyablePatternSourceDays(
            weeklyStructure,
            activeDays,
            pickerDay,
        ).map((source) => ({
            dayOfWeek: source.dayOfWeek,
            dayLabel:
                WEEKDAY_FULL_ES[source.dayOfWeek - 1] ??
                `Día ${source.dayOfWeek}`,
        }));
    }, [pickerDay, weeklyStructure, activeDays]);

    const handleCopyFromDay = useCallback(
        (fromDayOfWeek: number) => {
            if (pickerDay == null) return;
            onWeeklyStructureChange(
                copyPatternsFromDayToDay(
                    weeklyStructure,
                    fromDayOfWeek,
                    pickerDay,
                ),
            );
        },
        [pickerDay, weeklyStructure, onWeeklyStructureChange],
    );

    if (activeDays.length === 0) {
        return (
            <p className="text-sm leading-relaxed text-muted-foreground">
                Selecciona al menos un día en el paso anterior.
            </p>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {!hideIntro ? (
                <>
                    <p className={AUTHORING_STEP_META_CLASS}>Patrones por día</p>
                    <p className="text-sm text-muted-foreground">
                        Asigna manualmente los patrones de movimiento a cada día de
                        entrenamiento. La configuración se aplicará a todas las semanas de{" "}
                        {periodLabel}.
                    </p>
                </>
            ) : null}

            <ul className={AUTHORING_PATTERN_DAY_LIST_CLASS}>
                {sortedDays.map((dayOfWeek) => {
                    const patterns = getPatternsForDayFromWeek1(
                        weeklyStructure,
                        dayOfWeek,
                    );
                    const shortLabel = WEEKDAY_LABELS_ES[dayOfWeek - 1];
                    const dayName =
                        WEEKDAY_FULL_ES[dayOfWeek - 1] ?? shortLabel ?? `Día ${dayOfWeek}`;
                    const isEditing = pickerDay === dayOfWeek;
                    const hasPatterns = patterns.length > 0;

                    return (
                        <li key={dayOfWeek}>
                            <button
                                type="button"
                                className={authoringPatternDayCardClass({
                                    hasPatterns,
                                    isEditing,
                                })}
                                onClick={() => setPickerDay(dayOfWeek)}
                                aria-expanded={isEditing}
                                aria-label={
                                    hasPatterns
                                        ? `${dayName}: ${patterns.length} patrones asignados. Pulsa para editar.`
                                        : `${dayName}: sin patrones. Pulsa para asignar.`
                                }
                                data-testid={`authoring-pattern-day-${dayOfWeek}`}
                            >
                                <div className="min-w-0 space-y-2 pr-8">
                                    <p className={AUTHORING_PATTERN_DAY_CARD_TITLE_CLASS}>
                                        {dayName}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {!hasPatterns ? (
                                            <span
                                                className={
                                                    AUTHORING_PATTERN_DAY_CARD_EMPTY_CLASS
                                                }
                                            >
                                                Pulsa para asignar patrones
                                            </span>
                                        ) : (
                                            patterns.map((assignment) => {
                                                const pattern = catalogById.get(
                                                    assignment.movement_pattern_id,
                                                );
                                                if (!pattern) return null;
                                                return (
                                                    <PatternBadge
                                                        key={
                                                            assignment.movement_pattern_id
                                                        }
                                                        name={patternDisplayName(
                                                            pattern,
                                                        )}
                                                        uiBucket={pattern.ui_bucket}
                                                        selected
                                                        size="sm"
                                                    />
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                                {isEditing ? (
                                    <span
                                        className={
                                            AUTHORING_PATTERN_DAY_CARD_EDIT_ICON_WRAP_CLASS
                                        }
                                        aria-hidden
                                    >
                                        <PeriodBlockIconButton
                                            variant="edit"
                                            tabIndex={-1}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </PeriodBlockIconButton>
                                    </span>
                                ) : null}
                            </button>
                        </li>
                    );
                })}
            </ul>

            <BlockPatternPickerSheet
                open={pickerDay != null}
                onClose={() => setPickerDay(null)}
                dayLabel={pickerLabel}
                catalog={catalog}
                catalogLoading={catalogLoading}
                catalogError={catalogError}
                selectedPatternIds={pickerPatterns.map(
                    (p) => p.movement_pattern_id,
                )}
                copySources={pickerCopySources}
                onCopyFromDay={handleCopyFromDay}
                onToggle={(patternId) => {
                    if (pickerDay == null) return;
                    handleToggle(pickerDay, patternId);
                }}
            />
        </div>
    );
};
