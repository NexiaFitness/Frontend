/**
 * exerciseContentAccess.ts — Quién puede leer el texto de un ejercicio.
 *
 * Entrenador y admin. El atleta no llama a GET /exercises/{id}/content: su «Ver técnica»
 * lee por sesión en GET /athlete/sessions/{id}/exercise-content (H8-A).
 */

import { USER_ROLES } from "./roles";

export function canReadExerciseContent(role: string | null | undefined): boolean {
    return role === USER_ROLES.TRAINER || role === USER_ROLES.ADMIN;
}
