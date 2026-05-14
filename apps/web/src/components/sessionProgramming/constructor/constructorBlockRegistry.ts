/**
 * constructorBlockRegistry.ts — Registro setType → componente constructor.
 * Contexto: SessionConstructor resuelve el bloque interno según setType.
 * Notas de mantenimiento: tipos con card dedicada no usan este registry.
 * @author Frontend Team
 * @since v5.3.0
 */

import { SET_TYPE, type SetType } from "@nexia/shared/types/sessionProgramming";
import { LegacyRowBlock, type LegacyRowBlockProps } from "./blocks/LegacyRowBlock";

export type ConstructorBlockComponentProps = LegacyRowBlockProps;

const LEGACY: typeof LegacyRowBlock = LegacyRowBlock;

type DedicatedSetType =
    | typeof SET_TYPE.SUPERSET
    | typeof SET_TYPE.SINGLE_SET
    | typeof SET_TYPE.DROPSET
    | typeof SET_TYPE.GIANT_SET;

export const CONSTRUCTOR_BLOCK_REGISTRY: Record<
    Exclude<SetType, DedicatedSetType>,
    typeof LegacyRowBlock
> = {
    [SET_TYPE.FOR_TIME]: LEGACY,
    [SET_TYPE.EMOM]: LEGACY,
    [SET_TYPE.AMRAP]: LEGACY,
};

export function resolveConstructorBlockComponent(
    setType: SetType
): typeof LegacyRowBlock | null {
    if (
        setType === SET_TYPE.SUPERSET ||
        setType === SET_TYPE.SINGLE_SET ||
        setType === SET_TYPE.DROPSET ||
        setType === SET_TYPE.GIANT_SET
    ) {
        return null;
    }
    return CONSTRUCTOR_BLOCK_REGISTRY[setType] ?? LEGACY;
}
