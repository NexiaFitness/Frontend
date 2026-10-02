/**
 * blockAuthoringStructureHydration.ts — Reglas de hidratación única de estructura (F7).
 *
 * Contexto: evita refetch de GET weekly-structure en cada paso del wizard D-PAP.
 *
 * @author Frontend Team
 * @since v9.1.0
 */

export function shouldFetchWeeklyStructureHydration(input: {
    mode: "create" | "edit";
    blockId: number | null;
    structureLoaded: boolean;
    hydratedBlockId: number | null;
}): boolean {
    const { mode, blockId, structureLoaded, hydratedBlockId } = input;
    if (mode !== "edit" || blockId == null || structureLoaded) {
        return false;
    }
    return hydratedBlockId !== blockId;
}
