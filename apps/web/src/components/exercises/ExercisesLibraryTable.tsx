/**
 * ExercisesLibraryTable.tsx — Vista lista premium biblioteca de ejercicios.
 */

import React from "react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName } from "@nexia/shared";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    EXERCISES_LIBRARY_TABLE,
    EXERCISES_LIBRARY_TABLE_COL_EQUIP,
    EXERCISES_LIBRARY_TABLE_COL_LEVEL,
    EXERCISES_LIBRARY_TABLE_COL_MUSCLE,
    EXERCISES_LIBRARY_TABLE_COL_NAME,
    EXERCISES_LIBRARY_TABLE_COL_TYPE,
    EXERCISES_LIBRARY_TABLE_HEAD,
    EXERCISES_LIBRARY_TABLE_LEVEL,
    EXERCISES_LIBRARY_TABLE_META,
    EXERCISES_LIBRARY_TABLE_EQUIP,
    EXERCISES_LIBRARY_TABLE_MUSCLE_BADGE,
    EXERCISES_LIBRARY_TABLE_NAME,
    EXERCISES_LIBRARY_TABLE_ROW,
    EXERCISES_LIBRARY_TABLE_SHELL,
    EXERCISES_LIBRARY_TABLE_TD,
    EXERCISES_LIBRARY_TABLE_TH,
} from "./exercisesLibraryPresentation";
import {
    equipmentDisplayLine,
    getEquipmentLabel,
    getLevelLabel,
    getLevelTextClass,
    normalizeLevel,
    tipoLabelFromBackend,
} from "@/utils/exercises";
import { ExercisePrimeMoverBadges } from "@/components/exercises/ExercisePrimeMoverBadges";

export interface ExercisesLibraryTableProps {
    exercises: Exercise[];
    onSelect: (exercise: Exercise) => void;
}

export const ExercisesLibraryTable: React.FC<ExercisesLibraryTableProps> = ({
    exercises,
    onSelect,
}) => (
    <div className={EXERCISES_LIBRARY_TABLE_SHELL}>
        <NexiaGlassAccentRim />
        <table className={EXERCISES_LIBRARY_TABLE}>
            <colgroup>
                <col className={EXERCISES_LIBRARY_TABLE_COL_NAME} />
                <col className={EXERCISES_LIBRARY_TABLE_COL_MUSCLE} />
                <col className={EXERCISES_LIBRARY_TABLE_COL_TYPE} />
                <col className={EXERCISES_LIBRARY_TABLE_COL_EQUIP} />
                <col className={EXERCISES_LIBRARY_TABLE_COL_LEVEL} />
            </colgroup>
            <thead>
                <tr className={EXERCISES_LIBRARY_TABLE_HEAD}>
                    <th className={EXERCISES_LIBRARY_TABLE_TH}>Nombre</th>
                    <th className={EXERCISES_LIBRARY_TABLE_TH}>Grupo muscular</th>
                    <th className={EXERCISES_LIBRARY_TABLE_TH}>Tipo</th>
                    <th className={EXERCISES_LIBRARY_TABLE_TH}>Equipamiento</th>
                    <th className={EXERCISES_LIBRARY_TABLE_TH}>Nivel</th>
                </tr>
            </thead>
            <tbody>
                {exercises.map((ex) => {
                    const ln = normalizeLevel(ex.nivel || "");
                    const rowKey = ex.exercise_id.startsWith("ex-new")
                        ? ex.exercise_id
                        : String(ex.id);
                    const equipLine = equipmentDisplayLine(ex);

                    return (
                        <tr
                            key={rowKey}
                            className={EXERCISES_LIBRARY_TABLE_ROW}
                            onClick={() => onSelect(ex)}
                        >
                            <td className={cn(EXERCISES_LIBRARY_TABLE_TD, EXERCISES_LIBRARY_TABLE_NAME)}>
                                {exerciseDisplayName(ex)}
                            </td>
                            <td className={EXERCISES_LIBRARY_TABLE_TD}>
                                <div className="flex flex-wrap gap-1">
                                    <ExercisePrimeMoverBadges
                                        exercise={ex}
                                        badgeClassName={EXERCISES_LIBRARY_TABLE_MUSCLE_BADGE}
                                        accentFirstOnly
                                    />
                                </div>
                            </td>
                            <td className={cn(EXERCISES_LIBRARY_TABLE_TD, EXERCISES_LIBRARY_TABLE_META)}>
                                {tipoLabelFromBackend(ex.tipo || "")}
                            </td>
                            <td className={cn(EXERCISES_LIBRARY_TABLE_TD, EXERCISES_LIBRARY_TABLE_EQUIP)}>
                                {equipLine || getEquipmentLabel(ex.equipo || "")}
                            </td>
                            <td
                                className={cn(
                                    EXERCISES_LIBRARY_TABLE_TD,
                                    EXERCISES_LIBRARY_TABLE_LEVEL,
                                    getLevelTextClass(ln)
                                )}
                            >
                                {getLevelLabel(ex.nivel || "")}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);
