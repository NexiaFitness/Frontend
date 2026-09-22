/**
 * Display names for training block types (G27).
 * Pure logic — no UI. Names follow canonical catalog when slug/role present.
 */

import type { TrainingBlockType } from "../types/sessionProgramming";

const BLOCK_ROLE_LABELS: Record<string, string> = {
    warmup: "Calentamiento",
    core: "Core",
    conditioning: "Acondicionamiento",
};

export function getTrainingBlockDisplayName(blockType: Pick<
    TrainingBlockType,
    "name" | "physical_quality_slug" | "block_role"
>): string {
    if (blockType.block_role) {
        return BLOCK_ROLE_LABELS[blockType.block_role] ?? blockType.name;
    }
    if (blockType.physical_quality_slug) {
        return blockType.name;
    }
    return blockType.name;
}
