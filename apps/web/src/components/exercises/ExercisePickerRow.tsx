/**
 * ExercisePickerRow.tsx — Una fila del selector de ejercicios con su estado de seguridad.
 *
 * Contexto: extraído de ExercisePickerPanel (H4). H7 añade el tope. H11: ningún hallazgo
 * impide añadir; avisa y decide el entrenador. Sin hallazgo: un clic añade. Aviso articular
 * o tope: detalle, alternativas y «Añadir con precaución». No verificable: «Añadir sin
 * verificar». Sin comprobar (falló el lote): insignia explícita y un clic añade; nunca se
 * pinta como sin hallazgo. Mientras el lote carga, la fila espera al veredicto para no
 * saltarse un aviso. Sin cliente (estado null) no hay comprobación: un clic añade.
 * Notas de mantenimiento: estado con `exerciseSafetyUiState` (shared); copy y clases en
 * exercisePickerPresentation.ts.
 *
 * @author Frontend Team
 * @since @nexia/shared 2.0.0 (H4)
 */

import React from "react";
import { CircleHelp, Plus, ShieldAlert, TriangleAlert } from "lucide-react";
import type { ExercisePickerOut } from "@nexia/shared/hooks/exercises";
import type { ExerciseSafetyResponse } from "@nexia/shared/types/engineSafety";
import { exerciseDisplayName } from "@nexia/shared";
import type { ExerciseSafetyUiState } from "@nexia/shared/utils/exerciseSafetyState";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import {
    EXERCISE_PICKER_BADGE_EXCEEDS,
    EXERCISE_PICKER_BADGE_UNCHECKED,
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
} from "./exercisePickerPresentation";

export interface ExercisePickerRowProps {
    exercise: ExercisePickerOut;
    /** null: sin cliente (plantilla) no hay seguridad que comprobar. */
    state: ExerciseSafetyUiState | null;
    /** Lote en curso: la fila espera al veredicto. Si el lote falló, sí se añade. */
    checkPending: boolean;
    safety: ExerciseSafetyResponse | undefined;
    isExpanded: boolean;
    onToggle: () => void;
    onSelect: (exercise: ExercisePickerOut) => void;
    onShowAlternatives: (exerciseId: number) => void;
}

export const ExercisePickerRow: React.FC<ExercisePickerRowProps> = ({
    exercise,
    state,
    checkPending,
    safety,
    isExpanded,
    onToggle,
    onSelect,
    onShowAlternatives,
}) => {
    const unsafe = state === "unsafe";
    const unverifiable = state === "not_verifiable";
    const overCap = state === "exceeds_limit";
    const unchecked = state === "unchecked";
    const flagged = unsafe || unverifiable || overCap;
    const reason =
        safety?.reason?.trim() ||
        (overCap
            ? EXERCISE_PICKER_COPY.exceedsFallback
            : unsafe
              ? EXERCISE_PICKER_COPY.unsafeFallback
              : EXERCISE_PICKER_COPY.unverifiableFallback);

    return (
        <div>
            <button
                type="button"
                aria-expanded={flagged ? isExpanded : undefined}
                onClick={() => {
                    if (checkPending) return;
                    if (flagged) onToggle();
                    else onSelect(exercise);
                }}
                title={flagged ? reason : unchecked ? EXERCISE_PICKER_COPY.uncheckedLabel : undefined}
                className={cn(EXERCISE_PICKER_ROW, flagged && EXERCISE_PICKER_ROW_FLAGGED)}
            >
                {unsafe ? <TriangleAlert className={EXERCISE_PICKER_ROW_ICON_UNSAFE} aria-hidden /> : null}
                {unverifiable ? (
                    <CircleHelp className={EXERCISE_PICKER_ROW_ICON_UNVERIFIABLE} aria-hidden />
                ) : null}
                <span className={EXERCISE_PICKER_ROW_NAME}>{exerciseDisplayName(exercise)}</span>
                {overCap ? (
                    <span className={EXERCISE_PICKER_BADGE_EXCEEDS}>{EXERCISE_PICKER_COPY.exceedsBadge}</span>
                ) : unsafe ? (
                    <span className={EXERCISE_PICKER_BADGE_UNSAFE}>{EXERCISE_PICKER_COPY.unsafeBadge}</span>
                ) : unverifiable ? (
                    <span className={EXERCISE_PICKER_BADGE_UNVERIFIABLE}>
                        {EXERCISE_PICKER_COPY.unverifiableBadge}
                    </span>
                ) : unchecked ? (
                    <span
                        className={EXERCISE_PICKER_BADGE_UNCHECKED}
                        aria-label={EXERCISE_PICKER_COPY.uncheckedLabel}
                    >
                        {EXERCISE_PICKER_COPY.uncheckedBadge}
                    </span>
                ) : (
                    <Plus className={EXERCISE_PICKER_ROW_ADD_ICON} aria-hidden />
                )}
            </button>

            {flagged && isExpanded ? (
                <div
                    className={
                        unverifiable && !overCap
                            ? EXERCISE_PICKER_DETAIL_UNVERIFIABLE
                            : EXERCISE_PICKER_DETAIL_UNSAFE
                    }
                >
                    <div className={EXERCISE_PICKER_DETAIL_HEAD}>
                        <ShieldAlert className={EXERCISE_PICKER_DETAIL_ICON} aria-hidden />
                        <div className={EXERCISE_PICKER_DETAIL_BODY}>
                            <p className={EXERCISE_PICKER_DETAIL_TITLE}>
                                {overCap
                                    ? EXERCISE_PICKER_COPY.exceedsTitle
                                    : unsafe
                                      ? EXERCISE_PICKER_COPY.unsafeTitle
                                      : EXERCISE_PICKER_COPY.unverifiableTitle}
                            </p>
                            <p className={EXERCISE_PICKER_DETAIL_TEXT}>{reason}</p>
                        </div>
                    </div>
                    <div className={EXERCISE_PICKER_DETAIL_ACTIONS}>
                        {unsafe || overCap ? (
                            <Button
                                type="button"
                                variant="ghost-primary"
                                size="sm"
                                className="min-h-touch w-full"
                                onClick={() => onShowAlternatives(exercise.id)}
                            >
                                <ShieldAlert className={EXERCISE_PICKER_ROW_ICON} aria-hidden />
                                {EXERCISE_PICKER_COPY.showAlternatives}
                            </Button>
                        ) : null}
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className="min-h-touch w-full"
                            onClick={() => {
                                onSelect(exercise);
                                onToggle();
                            }}
                        >
                            <Plus className={EXERCISE_PICKER_ROW_ICON} aria-hidden />
                            {unsafe || overCap
                                ? EXERCISE_PICKER_COPY.addWithCaution
                                : EXERCISE_PICKER_COPY.addUnverified}
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
