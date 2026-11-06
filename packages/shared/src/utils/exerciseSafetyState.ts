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

export type ExerciseSafetyUiState =
    | "safe"
    | "unsafe"
    | "not_verifiable"
    | "exceeds_limit"
    | "unchecked";

export function exerciseSafetyUiState(
    safety: ExerciseSafetyResponse | undefined,
    {
        checkFailed,
        checkPending = false,
    }: { checkFailed: boolean; checkPending?: boolean }
): ExerciseSafetyUiState {
    // Sin respuesta no hay hallazgo que mostrar: no se presenta como comprobado.
    if (!safety || checkFailed || checkPending) return "unchecked";
    if (safety.status) return safety.status;
    if (safety.blocking) return "exceeds_limit";
    return safety.is_safe ? "safe" : "unsafe";
}
