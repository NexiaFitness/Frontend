/**
 * AthleteExercisePerformanceInfoSheet — CTX-1 popup «i» (1RM + última marca).
 */

import React from "react";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { LoadingSpinner } from "@/components/ui/feedback";
import { useGetAthleteExerciseLastPerformanceQuery } from "@nexia/shared/api/athleteApi";
import {
    formatLastMarkLine,
    formatOneRmLabel,
    formatOneRmValue,
} from "@nexia/shared/utils/athlete/athleteExerciseOneRm";

export interface AthleteExercisePerformanceInfoSheetProps {
    isOpen: boolean;
    exerciseId: number | null;
    exerciseTitle: string;
    onClose: () => void;
}

export const AthleteExercisePerformanceInfoSheet: React.FC<
    AthleteExercisePerformanceInfoSheetProps
> = ({ isOpen, exerciseId, exerciseTitle, onClose }) => {
    const { data, isFetching, isError } = useGetAthleteExerciseLastPerformanceQuery(
        exerciseId ?? 0,
        { skip: !isOpen || exerciseId == null }
    );

    const body = (() => {
        if (isFetching) {
            return (
                <div className="flex justify-center py-6">
                    <LoadingSpinner size="md" />
                </div>
            );
        }
        if (isError || !data) {
            return (
                <p className="text-sm text-muted-foreground">
                    No pudimos cargar el contexto de rendimiento. Inténtalo de nuevo.
                </p>
            );
        }
        if (!data.applies_one_rm) {
            return (
                <p className="text-sm text-muted-foreground">
                    Este ejercicio no usa carga externa; no aplica 1RM.
                </p>
            );
        }
        const lastLine = formatLastMarkLine(data);
        const oneRm = formatOneRmValue(data.one_rm_kg);
        if (!lastLine && !oneRm) {
            return (
                <p className="text-sm text-muted-foreground">
                    Aún no hay marcas registradas para este ejercicio.
                </p>
            );
        }
        return (
            <div className="space-y-3 text-sm text-foreground">
                {oneRm ? (
                    <p>
                        <span className="font-semibold">{formatOneRmLabel(data.one_rm_kind)}:</span>{" "}
                        {oneRm}
                    </p>
                ) : null}
                {lastLine ? <p className="text-muted-foreground">{lastLine}</p> : null}
                {data.one_rm_kind === "estimated" ? (
                    <p className="text-caption text-muted-foreground">
                        El 1RM estimado usa la fórmula de Epley (series de 1–10 reps).
                    </p>
                ) : null}
            </div>
        );
    })();

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={exerciseTitle}
            subtitle="Contexto de rendimiento"
        >
            {body}
        </BottomSheet>
    );
};
