/**
 * ExercisePickerRow.tsx — Una fila del selector de ejercicios con su estado de seguridad.
 *
 * Contexto: extraído de ExercisePickerPanel (H4). Estados: seguro (un clic añade),
 * contraindicado (detalle con alternativas y «Añadir con precaución») y no verificable
 * (detalle con el motivo y «Añadir sin verificar»); sin comprobar (falló el lote) se añade
 * con un clic pero con icono neutro. El motor recomienda; el entrenador
 * decide (nunca bloqueo duro en UI). «No verificable» nunca se pinta como seguro.
 * Notas de mantenimiento: estado con `exerciseSafetyUiState` (shared); copy y clases en
 * exercisePickerPresentation.ts.
 *
 * @author Frontend Team
 * @since @nexia/shared 2.0.0 (H4)
 */

import React from "react";
import { CircleHelp, Plus, ShieldAlert, TriangleAlert } from "lucide-react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import type { ExerciseSafetyResponse } from "@nexia/shared/types/engineSafety";
import { exerciseDisplayName } from "@nexia/shared";
import type { ExerciseSafetyUiState } from "@nexia/shared/utils/exerciseSafetyState";
import { cn } from "@/lib/utils";
import {
    EXERCISE_PICKER_ACTION_ALTERNATIVES,
    EXERCISE_PICKER_ACTION_CAUTION,
    EXERCISE_PICKER_BADGE_UNSAFE,
    EXERCISE_PICKER_BADGE_UNVERIFIABLE,
    EXERCISE_PICKER_COPY,
    EXERCISE_PICKER_DETAIL_ACTIONS,
    EXERCISE_PICKER_DETAIL_BODY,
    EXERCISE_PICKER_DETAIL_HEAD,
    EXERCISE_PICKER_DETAIL_ICON,
    EXERCISE_PICKER_DETAIL_TEXT,
    EXERCISE_PICKER_DETAIL_TITLE,
    EXERCISE_PICKER_DETAIL_UNSAFE,
    EXERCISE_PICKER_DETAIL_UNVERIFIABLE,
    EXERCISE_PICKER_ROW,
    EXERCISE_PICKER_ROW_ADD_ICON,
    EXERCISE_PICKER_ROW_FLAGGED,
    EXERCISE_PICKER_ROW_ICON,
    EXERCISE_PICKER_ROW_ICON_UNSAFE,
    EXERCISE_PICKER_ROW_ICON_UNVERIFIABLE,
    EXERCISE_PICKER_ROW_NAME,
    EXERCISE_PICKER_ROW_UNCHECKED_ICON,
} from "./exercisePickerPresentation";

export interface ExercisePickerRowProps {
    exercise: Exercise;
    state: ExerciseSafetyUiState;
    safety: ExerciseSafetyResponse | undefined;
    isExpanded: boolean;
    onToggle: () => void;
    onSelect: (exercise: Exercise) => void;
    onShowAlternatives: (exerciseId: number) => void;
}

export const ExercisePickerRow: React.FC<ExercisePickerRowProps> = ({
    exercise,
    state,
    safety,
    isExpanded,
    onToggle,
    onSelect,
    onShowAlternatives,
}) => {
    const unsafe = state === "unsafe";
    const unverifiable = state === "not_verifiable";
    const flagged = unsafe || unverifiable;
    const reason =
        safety?.reason?.trim() ||
        (unsafe ? EXERCISE_PICKER_COPY.unsafeFallback : EXERCISE_PICKER_COPY.unverifiableFallback);

    return (
        <div>
            <button
                type="button"
                aria-expanded={flagged ? isExpanded : undefined}
                onClick={() => (flagged ? onToggle() : onSelect(exercise))}
                title={flagged ? reason : undefined}
                className={cn(EXERCISE_PICKER_ROW, flagged && EXERCISE_PICKER_ROW_FLAGGED)}
            >
                {unsafe ? <TriangleAlert className={EXERCISE_PICKER_ROW_ICON_UNSAFE} aria-hidden /> : null}
                {unverifiable ? (
                    <CircleHelp className={EXERCISE_PICKER_ROW_ICON_UNVERIFIABLE} aria-hidden />
                ) : null}
                <span className={EXERCISE_PICKER_ROW_NAME}>{exerciseDisplayName(exercise)}</span>
                {unsafe ? (
                    <span className={EXERCISE_PICKER_BADGE_UNSAFE}>{EXERCISE_PICKER_COPY.unsafeBadge}</span>
                ) : unverifiable ? (
                    <span className={EXERCISE_PICKER_BADGE_UNVERIFIABLE}>
                        {EXERCISE_PICKER_COPY.unverifiableBadge}
                    </span>
                ) : state === "unchecked" ? (
                    <CircleHelp
                        className={EXERCISE_PICKER_ROW_UNCHECKED_ICON}
                        aria-label={EXERCISE_PICKER_COPY.uncheckedLabel}
                    />
                ) : (
                    <Plus className={EXERCISE_PICKER_ROW_ADD_ICON} aria-hidden />
                )}
            </button>

            {flagged && isExpanded ? (
                <div className={unsafe ? EXERCISE_PICKER_DETAIL_UNSAFE : EXERCISE_PICKER_DETAIL_UNVERIFIABLE}>
                    <div className={EXERCISE_PICKER_DETAIL_HEAD}>
                        <ShieldAlert className={EXERCISE_PICKER_DETAIL_ICON} aria-hidden />
                        <div className={EXERCISE_PICKER_DETAIL_BODY}>
                            <p className={EXERCISE_PICKER_DETAIL_TITLE}>
                                {unsafe ? EXERCISE_PICKER_COPY.unsafeTitle : EXERCISE_PICKER_COPY.unverifiableTitle}
                            </p>
                            <p className={EXERCISE_PICKER_DETAIL_TEXT}>{reason}</p>
                        </div>
                    </div>
                    <div className={EXERCISE_PICKER_DETAIL_ACTIONS}>
                        {unsafe ? (
                            <button
                                type="button"
                                onClick={() => onShowAlternatives(exercise.id)}
                                className={EXERCISE_PICKER_ACTION_ALTERNATIVES}
                            >
                                <ShieldAlert className={EXERCISE_PICKER_ROW_ICON} aria-hidden />
                                {EXERCISE_PICKER_COPY.showAlternatives}
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => {
                                onSelect(exercise);
                                onToggle();
                            }}
                            className={EXERCISE_PICKER_ACTION_CAUTION}
                        >
                            <Plus className={EXERCISE_PICKER_ROW_ICON} aria-hidden />
                            {unsafe ? EXERCISE_PICKER_COPY.addWithCaution : EXERCISE_PICKER_COPY.addUnverified}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
