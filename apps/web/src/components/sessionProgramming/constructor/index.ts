/**
 * index.ts — Barrel del módulo constructor por tipo de serie.
 * Contexto: exportaciones usadas por SessionConstructor y futuros bloques por setType.
 * @author Frontend Team
 * @since v5.3.0
 */

export { ConstructorBlockShell } from "./ConstructorBlockShell";
export type { ConstructorBlockShellProps } from "./ConstructorBlockShell";
export {
    CONSTRUCTOR_BLOCK_REGISTRY,
    resolveConstructorBlockComponent,
} from "./constructorBlockRegistry";
export type { ConstructorBlockComponentProps } from "./constructorBlockRegistry";
export { LegacyRowBlock } from "./blocks/LegacyRowBlock";
export type { LegacyRowBlockProps } from "./blocks/LegacyRowBlock";
