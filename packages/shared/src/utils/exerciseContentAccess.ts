/**
 * exerciseContentAccess.ts — Quién puede leer el texto de un ejercicio.
 *
 * Entrenador y admin. El atleta queda fuera (H8): su «Ver técnica» no llama
 * a GET /exercises/{id}/content.
 */

import { USER_ROLES } from "./roles";

export function canReadExerciseContent(role: string | null | undefined): boolean {
    return role === USER_ROLES.TRAINER || role === USER_ROLES.ADMIN;
}
