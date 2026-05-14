/**
 * constructorBlockRegistry.ts — Registro setType → componente constructor.
 * Contexto: SessionConstructor resuelve el bloque interno según setType.
 * Notas de mantenimiento: S-INF usa LegacyRowBlock para todos; S1′ añade SupersetBlock.
 * @author Frontend Team
 * @since v5.3.0
 */

import { SET_TYPE, type SetType } from "@nexia/shared/types/sessionProgramming";
import { LegacyRowBlock, type LegacyRowBlockProps } from "./blocks/LegacyRowBlock";

export type ConstructorBlockComponentProps = LegacyRowBlockProps;

const LEGACY: typeof LegacyRowBlock = LegacyRowBlock;

export const CONSTRUCTOR_BLOCK_REGISTRY: Record<
    Exclude<SetType, typeof SET_TYPE.SUPERSET>,
    typeof LegacyRowBlock
> = {
    [SET_TYPE.SINGLE_SET]: LEGACY,
    [SET_TYPE.DROPSET]: LEGACY,
    [SET_TYPE.GIANT_SET]: LEGACY,
    [SET_TYPE.FOR_TIME]: LEGACY,
    [SET_TYPE.EMOM]: LEGACY,
    [SET_TYPE.AMRAP]: LEGACY,
};

export function resolveConstructorBlockComponent(
    setType: SetType
): typeof LegacyRowBlock | null {
    if (setType === SET_TYPE.SUPERSET) {
        return null;
    }
    return CONSTRUCTOR_BLOCK_REGISTRY[setType] ?? LEGACY;
}
