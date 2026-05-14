/**
 * LegacyRowBlock.tsx — Puente S-INF: delega en SessionConstructorRow hasta migrar por setType.
 * Contexto: implementación por defecto del registro constructorBlockRegistry.
 * Notas de mantenimiento: retirar cuando cada setType tenga su card dedicada.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { SessionConstructorRow } from "../../SessionConstructorRow";
import type { ConstructorRow, ConstructorExercise } from "../../constructorTypes";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";

export interface LegacyRowBlockProps {
    row: ConstructorRow;
    blockTypes: TrainingBlockType[];
    onUpdate: (rowId: string, updates: Partial<ConstructorRow>) => void;
    onRemove: (rowId: string) => void;
    onAddExercise: (rowId: string, exerciseSlotId?: string) => void;
    onRemoveExercise: (rowId: string, exerciseId: string) => void;
    onUpdateExercise: (
        rowId: string,
        exerciseId: string,
        updates: Partial<ConstructorExercise>
    ) => void;
    showColumnHeader?: boolean;
}

export const LegacyRowBlock: React.FC<LegacyRowBlockProps> = ({
    showColumnHeader = false,
    ...rowProps
}) => (
    <>
        {showColumnHeader ? (
            <div className="grid grid-cols-[170px_110px_70px_minmax(140px,1fr)_140px_160px_100px] gap-2 px-4 py-2.5 bg-surface/50 text-[11px] font-medium text-muted-foreground uppercase tracking-wider items-center">
                <span>Bloque</span>
                <span>Tipo Serie</span>
                <span>Series</span>
                <span>Ejercicios</span>
                <span className="flex items-center justify-center w-full text-center">
                    Reps / Tiempo
                </span>
                <span className="flex items-center justify-center w-full text-center">Carácter</span>
                <span className="flex items-center justify-center w-full text-center">Descanso</span>
            </div>
        ) : null}
        <SessionConstructorRow {...rowProps} row={rowProps.row} />
    </>
);
