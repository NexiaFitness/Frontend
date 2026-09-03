/**
 * quickProgramMaterializeVerify.ts — Validación fail-closed post O9 (F3 paso 5).
 */

import type {
    PlanPeriodBlock,
    QuickProgramMaterializeOut,
} from "@nexia/shared/types/planningCargas";

export class QuickProgramMaterializeVerificationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "QuickProgramMaterializeVerificationError";
    }
}

/** Confirma que la respuesta O9 refleja N fases materializadas. */
export function assertMaterializeResponseMatchesDraft(
    phaseCount: number,
    clientRequestId: string,
    response: QuickProgramMaterializeOut,
): number[] {
    if (response.client_request_id !== clientRequestId) {
        throw new QuickProgramMaterializeVerificationError(
            "La respuesta no coincide con el intento de materialización.",
        );
    }
    if (response.blocks.length !== phaseCount) {
        throw new QuickProgramMaterializeVerificationError(
            `Se esperaban ${phaseCount} bloques y la respuesta devolvió ${response.blocks.length}.`,
        );
    }
    if (response.total_blocks_created !== phaseCount) {
        throw new QuickProgramMaterializeVerificationError(
            "total_blocks_created no coincide con el número de fases.",
        );
    }

    const blockIds: number[] = [];
    for (const item of response.blocks) {
        const id = item.block?.id;
        if (id == null || id <= 0) {
            throw new QuickProgramMaterializeVerificationError(
                "La respuesta incluye un bloque sin identificador válido.",
            );
        }
        blockIds.push(id);
    }

    return blockIds;
}

/** Confirma que los bloques persistidos aparecen tras refetch de planificación. */
export function assertMaterializedBlocksVisible(
    materializedBlockIds: readonly number[],
    listedBlocks: readonly PlanPeriodBlock[],
): void {
    for (const id of materializedBlockIds) {
        if (!listedBlocks.some((block) => block.id === id)) {
            throw new QuickProgramMaterializeVerificationError(
                `El bloque ${id} no aparece en planificación tras crear la programación.`,
            );
        }
    }
}
