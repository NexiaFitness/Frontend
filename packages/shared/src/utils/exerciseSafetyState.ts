/**
 * exerciseSafetyState.ts — Estado de seguridad de un ejercicio para la UI (H4).
 *
 * Contexto: el backend devuelve `status` (safe / unsafe / not_verifiable). La UI distingue
 * además «sin comprobar todavía» (sin respuesta, cargando o tras un error), que nunca se
 * presenta como seguro. `checkPending` cubre el lote en curso; `checkFailed`, el error.
 * Función pura, sin DOM.
 * Notas de mantenimiento: si llega una respuesta sin `status` (cliente antiguo), se deduce de
 * `is_safe` como antes, para no romper durante un despliegue.
 *
 * @author Frontend Team
 * @since 2.0.0 (H4)
 */

import type { ExerciseSafetyResponse } from "../types/engineSafety";

export type ExerciseSafetyUiState = "safe" | "unsafe" | "not_verifiable" | "unchecked";

export function exerciseSafetyUiState(
    safety: ExerciseSafetyResponse | undefined,
    {
        checkFailed,
        checkPending = false,
    }: { checkFailed: boolean; checkPending?: boolean }
): ExerciseSafetyUiState {
    // Sin respuesta el ejercicio no es seguro: o el lote falló, o todavía no ha vuelto.
    if (!safety) return checkFailed || checkPending ? "unchecked" : "safe";
    if (safety.status) return safety.status;
    return safety.is_safe ? "safe" : "unsafe";
}
