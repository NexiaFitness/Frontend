/**
 * runLoggerFieldState.ts — Modelo vacío / tocado / valor (D-LOG-INTEGRITY-01 H2).
 *
 * undefined: sin fila de estado (hidratación inicial permitida).
 * null: vaciado explícito del atleta (no sustituir por prescripción/referencia).
 * number: valor confirmado en UI.
 *
 * @author Frontend Team
 * @since v9.3.0
 */

/** Peso en slot/single: null es vacío explícito, no «falta de dato». */
export function readSlotWeightForMerge(input: {
    prev: { weight: number | null } | undefined;
    touched: boolean;
}): number | null | undefined {
    const { prev, touched } = input;
    if (touched) {
        return prev?.weight ?? null;
    }
    if (prev === undefined) {
        return undefined;
    }
    return prev.weight;
}

/** Peso previo de otra serie/ejercicio no debe arrastrarse al cambiar de paso. */
export function prevWeightForApplicableMerge(
    prevWeight: number | null | undefined,
    allowCarryFromPrev: boolean
): number | null | undefined {
    if (!allowCarryFromPrev) {
        return undefined;
    }
    return prevWeight;
}
