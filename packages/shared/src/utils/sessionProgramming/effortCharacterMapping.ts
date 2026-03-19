/**
 * effortCharacterMapping.ts — Mapeo Carácter UI ↔ EffortCharacter backend
 *
 * Carácter: RPE (1-10), RIR (0-5), %RM (1-100).
 * Backend EffortCharacter: rpe, rir, velocity_loss, pct_rm.
 *
 * @author Frontend Team
 * @since v6.4.0
 */

import { EFFORT_CHARACTER } from "../../types/sessionProgramming";
import type { EffortCharacter } from "../../types/sessionProgramming";

/** Tipo de carácter en la columna del Constructor (UI) */
export type CaracterTipo = "rpe" | "rir" | "pct_rm";

/** Convierte EffortCharacter del backend a CaracterTipo para la UI */
export function getCaracterTipoFromEffortCharacter(
    ec: EffortCharacter | null
): CaracterTipo {
    if (ec === EFFORT_CHARACTER.RPE) return "rpe";
    if (ec === EFFORT_CHARACTER.RIR) return "rir";
    if (ec === EFFORT_CHARACTER.PCT_RM) return "pct_rm";
    if (ec === EFFORT_CHARACTER.VELOCITY_LOSS) return "pct_rm";
    return "rpe";
}

/** Convierte CaracterTipo de la UI a EffortCharacter para el backend */
export function getEffortCharacterForCaracterTipo(
    tipo: CaracterTipo
): EffortCharacter {
    if (tipo === "rpe") return EFFORT_CHARACTER.RPE;
    if (tipo === "rir") return EFFORT_CHARACTER.RIR;
    return EFFORT_CHARACTER.PCT_RM;
}
