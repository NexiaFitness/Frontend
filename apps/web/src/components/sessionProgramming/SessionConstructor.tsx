/**
 * SessionConstructor.tsx — Lista de bloques-card del Constructor de Sesión.
 * Contexto: orquesta constructores por setType; estado en ConstructorRow[].
 * Notas de mantenimiento: superset usa SupersetBlock dedicado; resto LegacyRowBlock en shell.
 * @spec docs/tipo-serie/06_arquitectura-constructores-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import {
    ConstructorBlockShell,
    SupersetBlock,
    SingleSetBlock,
    DropsetBlock,
    resolveConstructorBlockComponent,
    supersetGroupLabels,
    dropsetGroupLabels,
} from "./constructor";
import { useSessionConstructorActions } from "./hooks/useSessionConstructorActions";
import type { ConstructorRow } from "./constructorTypes";

export interface SessionConstructorProps {
    rows: ConstructorRow[];
    blockTypes: TrainingBlockType[];
    onRowsChange: (action: React.SetStateAction<ConstructorRow[]>) => void;
    onAddExerciseRequest: (rowId: string, exerciseSlotId?: string) => void;
    titleAccessory?: React.ReactNode;
}

export const SessionConstructor: React.FC<SessionConstructorProps> = ({
    rows,
    blockTypes,
    onRowsChange,
    onAddExerciseRequest,
    titleAccessory,
}) => {
    const {
        handleUpdateRow,
        handleRemoveRow,
        handleRemoveExercise,
        handleUpdateExercise,
        handleAddRow,
        handleRemoveBlock,
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
    const hasRows = rows.length > 0;

    return (
        <div className="rounded-lg border border-border/70 bg-surface/20 text-card-foreground overflow-hidden">
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between gap-3 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                        Constructor de Sesión
                    </h3>
                    {titleAccessory ? (
                        <div className="shrink-0 flex items-center">{titleAccessory}</div>
                    ) : null}
                </div>
            </div>

            {!hasRows ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                    Selecciona un bloque de entrenamiento para comenzar a construir tu sesión.
                </div>
            ) : (
                <div className="p-4 space-y-6">
                    {Array.from(rowsByBlock.entries()).map(([blockTypeId, blockRows]) => (
                        <div key={blockTypeId} className="space-y-4">
                            {blockRows.map((row, index) => {
                                if (row.setType === SET_TYPE.SUPERSET) {
                                    return (
                                        <SupersetBlock
                                            key={row.id}
                                            row={row}
                                            blockTypes={blockTypes}
                                            groupLabel={
                                                supersetLabels.get(row.id) ?? "SUPERSET A"
                                            }
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
                                            groupLabel={
                                                dropsetLabels.get(row.id) ?? "DROP SET A"
                                            }
                                            onUpdate={handleUpdateRow}
                                            onAddExercise={onAddExerciseRequest}
                                            onUpdateExercise={handleUpdateExercise}
                                            onDuplicate={handleDuplicateRow}
                                            onRemove={handleRemoveRow}
                                        />
                                    );
                                }

                                const BlockComponent = resolveConstructorBlockComponent(
                                    row.setType
                                );
                                if (!BlockComponent) return null;

                                return (
                                    <ConstructorBlockShell
                                        key={row.id}
                                        blockTypeId={row.blockTypeId}
                                        blockTypes={blockTypes}
                                        setType={row.setType}
                                        onSetTypeChange={(setType) =>
                                            handleUpdateRow(row.id, { setType })
                                        }
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
                            })}
                            <div className="flex items-center justify-between px-1 py-1">
                                <button
                                    type="button"
                                    onClick={() => handleAddRow(blockTypeId)}
                                    className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Plus className="h-3 w-3" aria-hidden />
                                    Añadir serie
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveBlock(blockTypeId)}
                                    className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 className="h-3 w-3" aria-hidden />
                                    Eliminar bloque
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
