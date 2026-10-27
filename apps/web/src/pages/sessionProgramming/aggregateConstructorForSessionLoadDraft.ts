/**
 * aggregateConstructorForSessionLoadDraft.ts — Líneas del constructor para POST validate-draft.
 *
 * Contexto: el panel de volumen del constructor envía las líneas sin guardar y el backend las
 * resuelve con la misma regla que las guardadas (volume_lines: calentamiento, isométrico por
 * tiempo, sin series). Por eso cada línea lleva su `block_type_id`: el mismo ejercicio en un
 * bloque de calentamiento y en uno de fuerza son dos líneas distintas (H4).
 * Notas de mantenimiento: usa getConstructorPersistLines (misma fuente que la persistencia) y
 * volumeEquivalentSets, para que el borrador sume lo mismo que se guardará.
 *
 * @author Frontend Team
 * @since v6.x; block_type_id desde @nexia/shared 2.0.0 (H4)
 */

import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import type { SessionLoadDraftExerciseIn } from "@nexia/shared/types/sessionLoad";
import { getConstructorPersistLines } from "@/components/sessionProgramming/constructor/utils/singleSetRow";
import { getPersistLinePlannedSets, getRowVolumeSetsPerExercise } from "@/components/sessionProgramming/constructor/utils/volumeEquivalentSets";

export function aggregateConstructorRowsForSessionLoadDraft(
    rows: ConstructorRow[]
): SessionLoadDraftExerciseIn[] {
    const byLine = new Map<string, SessionLoadDraftExerciseIn>();

    for (const row of rows) {
        if (getRowVolumeSetsPerExercise(row) <= 0) {
            continue;
        }
        for (const line of getConstructorPersistLines(row)) {
            const id = line.exercise.exerciseId;
            const planned = getPersistLinePlannedSets(row, line);
            if (!id || id <= 0 || planned <= 0) {
                continue;
            }
            const key = `${id}:${row.blockTypeId}`;
            const previous = byLine.get(key);
            byLine.set(key, {
                exercise_id: id,
                planned_sets: (previous?.planned_sets ?? 0) + planned,
                block_type_id: row.blockTypeId,
            });
        }
    }

    return [...byLine.values()];
}
