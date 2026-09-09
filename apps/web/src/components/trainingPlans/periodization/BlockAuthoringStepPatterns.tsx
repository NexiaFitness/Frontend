/**
 * BlockAuthoringStepPatterns.tsx — Asignación manual de patrones por día activo (D-ST F2).
 */

import React, { useCallback, useMemo, useState } from "react";
import { Pencil } from "lucide-react";

import type { MovementPattern } from "@nexia/shared/types/exercise";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

import { Button } from "@/components/ui/buttons";
import { PLATFORM_ALT_ITEM } from "@/components/ui/surface/platformPremiumPresentation";
import { cn } from "@/lib/utils";

import { BlockPatternPickerSheet } from "./BlockPatternPickerSheet";
import { PatternBadge } from "./PatternBadge";
import {
    getPatternsForDayFromWeek1,
    togglePatternOnRecurringDay,
} from "./blockAuthoringPatternsUtils";
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

    if (activeDays.length === 0) {
        return (
            <div className="space-y-4">
                <p className={AUTHORING_STEP_META_CLASS}>Patrones por día</p>
                <p className="text-sm text-muted-foreground">
                    Selecciona al menos un día en el paso anterior.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className={AUTHORING_STEP_META_CLASS}>Patrones por día</p>
            <p className="text-sm text-muted-foreground">
                Asigna manualmente los patrones de movimiento a cada día de
                entrenamiento. La configuración se aplicará a todas las semanas de{" "}
                {periodLabel}.
            </p>

            <ul className="space-y-2">
                {sortedDays.map((dayOfWeek) => {
                    const patterns = getPatternsForDayFromWeek1(
                        weeklyStructure,
                        dayOfWeek,
                    );
                    const shortLabel = WEEKDAY_LABELS_ES[dayOfWeek - 1];
                    const missingPatterns = patterns.length === 0;
                    return (
                        <li
                            key={dayOfWeek}
                            className={cn(
                                PLATFORM_ALT_ITEM,
                                missingPatterns &&
                                    "border-warning/50 bg-warning/5 ring-1 ring-warning/30",
                            )}
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <p className="text-sm font-semibold text-foreground">
                                        {WEEKDAY_FULL_ES[dayOfWeek - 1] ?? shortLabel}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {patterns.length === 0 ? (
                                            <span className="text-xs text-muted-foreground">
                                                Sin patrones — pulsa Editar
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0 gap-1.5"
                                    onClick={() => setPickerDay(dayOfWeek)}
                                >
                                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                                    Editar
                                </Button>
                            </div>
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
                onToggle={(patternId) => {
                    if (pickerDay == null) return;
                    handleToggle(pickerDay, patternId);
                }}
            />
        </div>
    );
};
