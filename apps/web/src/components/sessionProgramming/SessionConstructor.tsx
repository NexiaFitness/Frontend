/**
 * SessionConstructor.tsx — Lista de bloques-card del Constructor de Sesion.
 * Contexto: orquesta constructores por setType; estado en ConstructorRow[].
 * Notas de mantenimiento: superset usa SupersetBlock dedicado; resto LegacyRowBlock en shell.
 * @spec docs/tipo-serie/06_arquitectura-constructores-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 * @updated v6.5.0 — Panel de ejercicios inline contextual (flex al lado de la card activa)
 */

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import { SessionPanelShell } from "./SessionPanelShell";
import {
    ConstructorBlockShell,
    SupersetBlock,
    SingleSetBlock,
    DropsetBlock,
    GiantSetBlock,
    ForTimeBlock,
    EmomBlock,
    AmrapBlock,
    resolveConstructorBlockComponent,
    supersetGroupLabels,
    dropsetGroupLabels,
    giantSetGroupLabels,
    forTimeGroupLabels,
    emomGroupLabels,
    amrapGroupLabels,
} from "./constructor";
import { useSessionConstructorActions } from "./hooks/useSessionConstructorActions";
import type { ConstructorRow } from "./constructorTypes";

export interface SessionConstructorProps {
    rows: ConstructorRow[];
    blockTypes: TrainingBlockType[];
    onRowsChange: (action: React.SetStateAction<ConstructorRow[]>) => void;
    onAddExerciseRequest: (rowId: string, exerciseSlotId?: string) => void;
    titleAccessory?: React.ReactNode;
    activePickerRowId?: string | null;
    exercisePickerPanel?: React.ReactNode;
}

export const SessionConstructor: React.FC<SessionConstructorProps> = ({
    rows,
    blockTypes,
    onRowsChange,
    onAddExerciseRequest,
    titleAccessory,
    activePickerRowId,
    exercisePickerPanel,
}) => {
    const {
        handleUpdateRow,
        handleRemoveRow,
        handleRemoveExercise,
        handleUpdateExercise,
        handleAddRow,
        handleDuplicateRow,
    } = useSessionConstructorActions(onRowsChange);

    const rowsByBlock = React.useMemo(() => {
        const map = new Map<number, ConstructorRow[]>();
        for (const row of rows) {
            if (!row.blockTypeId) continue;
            const list = map.get(row.blockTypeId) ?? [];
            list.push(row);
            map.set(row.blockTypeId, list);
        }
        return map;
    }, [rows]);

    const supersetLabels = React.useMemo(() => supersetGroupLabels(rows), [rows]);
    const dropsetLabels = React.useMemo(() => dropsetGroupLabels(rows), [rows]);
    const giantSetLabels = React.useMemo(() => giantSetGroupLabels(rows), [rows]);
    const forTimeLabels = React.useMemo(() => forTimeGroupLabels(rows), [rows]);
    const emomLabels = React.useMemo(() => emomGroupLabels(rows), [rows]);
    const amrapLabels = React.useMemo(() => amrapGroupLabels(rows), [rows]);
    const hasRows = rows.length > 0;

    const renderBlockGroupActions = (
        blockTypeId: number,
        blockRows: ConstructorRow[]
    ) => {
        const lastRow = blockRows[blockRows.length - 1];
        return (
            <div className="flex items-center justify-between px-1 pt-1">
                <button
                    type="button"
                    onClick={() => handleAddRow(blockTypeId)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-primary/80 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                    <Plus className="h-3 w-3" aria-hidden />
                    Añadir serie
                </button>
                <button
                    type="button"
                    onClick={() => lastRow && handleRemoveRow(lastRow.id)}
                    disabled={!lastRow}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-destructive/75 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:text-muted-foreground/40"
                    aria-label="Eliminar última serie del bloque"
                >
                    <Trash2 className="h-3 w-3" aria-hidden />
                    Eliminar serie
                </button>
            </div>
        );
    };

    const renderBlockRow = (row: ConstructorRow, index: number): React.ReactNode => {
        if (row.setType === SET_TYPE.SUPERSET) {
            return (
                <SupersetBlock
                    key={row.id}
                    row={row}
                    blockTypes={blockTypes}
                    groupLabel={supersetLabels.get(row.id) ?? "SUPERSET A"}
                    onUpdate={handleUpdateRow}
                    onAddExercise={onAddExerciseRequest}
                    onUpdateExercise={handleUpdateExercise}
                    onDuplicate={handleDuplicateRow}
                    onRemove={handleRemoveRow}
                />
            );
        }

        if (row.setType === SET_TYPE.SINGLE_SET) {
            return (
                <SingleSetBlock
                    key={row.id}
                    row={row}
                    blockTypes={blockTypes}
                    onUpdate={handleUpdateRow}
                    onAddExercise={onAddExerciseRequest}
                    onUpdateExercise={handleUpdateExercise}
                    onDuplicate={handleDuplicateRow}
                    onRemove={handleRemoveRow}
                />
            );
        }

        if (row.setType === SET_TYPE.DROPSET) {
            return (
                <DropsetBlock
                    key={row.id}
                    row={row}
                    blockTypes={blockTypes}
                    groupLabel={dropsetLabels.get(row.id) ?? "DROP SET A"}
                    onUpdate={handleUpdateRow}
                    onAddExercise={onAddExerciseRequest}
                    onUpdateExercise={handleUpdateExercise}
                    onDuplicate={handleDuplicateRow}
                    onRemove={handleRemoveRow}
                />
            );
        }

        if (row.setType === SET_TYPE.GIANT_SET) {
            return (
                <GiantSetBlock
                    key={row.id}
                    row={row}
                    blockTypes={blockTypes}
                    groupLabel={giantSetLabels.get(row.id) ?? "GIANT SET A"}
                    onUpdate={handleUpdateRow}
                    onAddExercise={onAddExerciseRequest}
                    onUpdateExercise={handleUpdateExercise}
                    onDuplicate={handleDuplicateRow}
                    onRemove={handleRemoveRow}
                />
            );
        }

        if (row.setType === SET_TYPE.FOR_TIME) {
            return (
                <ForTimeBlock
                    key={row.id}
                    row={row}
                    blockTypes={blockTypes}
                    groupLabel={forTimeLabels.get(row.id) ?? "FOR TIME A"}
                    onUpdate={handleUpdateRow}
                    onAddExercise={onAddExerciseRequest}
                    onUpdateExercise={handleUpdateExercise}
                    onDuplicate={handleDuplicateRow}
                    onRemove={handleRemoveRow}
                />
            );
        }

        if (row.setType === SET_TYPE.EMOM) {
            return (
                <EmomBlock
                    key={row.id}
                    row={row}
                    blockTypes={blockTypes}
                    groupLabel={emomLabels.get(row.id) ?? "EMOM A"}
                    onUpdate={handleUpdateRow}
                    onAddExercise={onAddExerciseRequest}
                    onDuplicate={handleDuplicateRow}
                    onRemove={handleRemoveRow}
                />
            );
        }

        if (row.setType === SET_TYPE.AMRAP) {
            return (
                <AmrapBlock
                    key={row.id}
                    row={row}
                    blockTypes={blockTypes}
                    groupLabel={amrapLabels.get(row.id) ?? "AMRAP A"}
                    onUpdate={handleUpdateRow}
                    onAddExercise={onAddExerciseRequest}
                    onUpdateExercise={handleUpdateExercise}
                    onDuplicate={handleDuplicateRow}
                    onRemove={handleRemoveRow}
                />
            );
        }

        const BlockComponent = resolveConstructorBlockComponent(row.setType);
        if (!BlockComponent) return null;

        return (
            <ConstructorBlockShell
                key={row.id}
                blockTypeId={row.blockTypeId}
                blockTypes={blockTypes}
                setType={row.setType}
                onSetTypeChange={(setType) => handleUpdateRow(row.id, { setType })}
                onDuplicate={() => handleDuplicateRow(row.id)}
                onRemove={() => handleRemoveRow(row.id)}
            >
                <BlockComponent
                    row={row}
                    blockTypes={blockTypes}
                    onUpdate={handleUpdateRow}
                    onRemove={handleRemoveRow}
                    onAddExercise={onAddExerciseRequest}
                    onRemoveExercise={handleRemoveExercise}
                    onUpdateExercise={handleUpdateExercise}
                    showColumnHeader={index === 0}
                />
            </ConstructorBlockShell>
        );
    };

    return (
        <SessionPanelShell
            title="Constructor de Sesion"
            headerAccessory={titleAccessory}
            bodyClassName={!hasRows ? "p-0" : undefined}
        >
            {!hasRows ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                    Selecciona un bloque de entrenamiento para comenzar a construir tu sesion.
                </div>
            ) : (
                <div className="space-y-6">
                    {Array.from(rowsByBlock.entries()).map(([blockTypeId, blockRows]) => {
                        const activeIndex = activePickerRowId
                            ? blockRows.findIndex((r) => r.id === activePickerRowId)
                            : -1;
                        const hasActivePicker = activeIndex !== -1 && exercisePickerPanel;

                        return (
                            <div key={blockTypeId} className="space-y-4">
                                {hasActivePicker ? (
                                    <>
                                        {blockRows
                                            .slice(0, activeIndex)
                                            .map((row, index) => renderBlockRow(row, index))}
                                        <div className="flex items-start gap-4">
                                            <div className="flex min-w-0 flex-1 flex-col gap-4">
                                                <div className="space-y-4">
                                                    {blockRows
                                                        .slice(activeIndex)
                                                        .map((row, index) =>
                                                            renderBlockRow(
                                                                row,
                                                                activeIndex + index
                                                            )
                                                        )}
                                                </div>
                                                {renderBlockGroupActions(blockTypeId, blockRows)}
                                            </div>
                                            {exercisePickerPanel}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {blockRows.map((row, index) =>
                                                renderBlockRow(row, index)
                                            )}
                                        </div>
                                        {renderBlockGroupActions(blockTypeId, blockRows)}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </SessionPanelShell>
    );
};
