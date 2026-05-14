/**
 * SessionConstructor.tsx — Lista de bloques-card del Constructor de Sesión.
 * Contexto: orquesta ConstructorBlockShell + registro por setType; estado sigue en ConstructorRow[].
 * Notas de mantenimiento: LegacyRowBlock es puente S-INF hasta constructores dedicados por tipo.
 * @spec IMPL_CREATE_EDIT_SESSION.md — Fase 4
 * @spec docs/tipo-serie/06_arquitectura-constructores-por-tipo.md — S-INF
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import {
    ConstructorBlockShell,
    resolveConstructorBlockComponent,
} from "./constructor";
import { useSessionConstructorActions } from "./hooks/useSessionConstructorActions";
import type { ConstructorRow } from "./constructorTypes";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";

export interface SessionConstructorProps {
    rows: ConstructorRow[];
    blockTypes: TrainingBlockType[];
    /** Típico: `setConstructorRows` de useState, admite array o updater funcional. */
    onRowsChange: (action: React.SetStateAction<ConstructorRow[]>) => void;
    onAddExerciseRequest: (rowId: string) => void;
    /** Misma línea que el título, alineado a la derecha (p. ej. carga axial). */
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
    } = useSessionConstructorActions(onRowsChange);

    /** Agrupar filas por blockTypeId para pie de bloque de entrenamiento */
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

    const hasRows = rows.length > 0;

    return (
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
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
                        <div key={blockTypeId} className="space-y-3">
                            {blockRows.map((row, index) => {
                                const BlockComponent = resolveConstructorBlockComponent(row.setType);
                                return (
                                    <ConstructorBlockShell key={row.id} setType={row.setType}>
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
