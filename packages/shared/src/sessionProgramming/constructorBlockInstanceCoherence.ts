/**
 * constructorBlockInstanceCoherence.ts — Reglas de instancia de bloque en el constructor.
 *
 * Un SessionBlock API tiene un único set_type; no se mezclan tipos de serie en la misma instancia.
 *
 * @author Frontend Team
 * @since v6.7.0
 */

import type { SetType } from "../types/sessionProgramming";
import { groupConstructorRowsByBlockInstance } from "./constructorBlockInstance";

export interface BlockInstanceCoherenceIssue {
    blockInstanceId: string;
    setTypes: SetType[];
    message: string;
}

export function findBlockInstanceSetTypeConflicts<
    T extends { id: string; blockTypeId: number; setType: SetType; blockInstanceId?: string },
>(rows: T[]): BlockInstanceCoherenceIssue[] {
    const issues: BlockInstanceCoherenceIssue[] = [];
    const groups = groupConstructorRowsByBlockInstance(rows.filter((r) => r.blockTypeId));

    for (const group of groups) {
        const setTypes = [...new Set(group.rows.map((r) => r.setType))];
        if (setTypes.length > 1) {
            issues.push({
                blockInstanceId: group.blockInstanceId,
                setTypes,
                message:
                    "Un bloque de entrenamiento no puede mezclar tipos de serie distintos. " +
                    "Usa «Añadir bloque» para otro tipo o duplica el bloque completo.",
            });
        }
    }

    return issues;
}
