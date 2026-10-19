/**
 * validateConstructorBeforePersist.ts — Guardas previas a persistir constructor.
 */

import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { findBlockInstanceSetTypeConflicts } from "@nexia/shared/sessionProgramming/constructorBlockInstanceCoherence";

export function validateConstructorBeforePersist(
    rows: ConstructorRow[],
): { ok: true } | { ok: false; message: string } {
    const conflicts = findBlockInstanceSetTypeConflicts(rows);
    if (conflicts.length > 0) {
        return { ok: false, message: conflicts[0].message };
    }
    return { ok: true };
}
