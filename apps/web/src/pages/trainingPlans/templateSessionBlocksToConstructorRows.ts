/**
 * Hydrates TemplateProgramSession blocks → ConstructorRow[] (same path as EditSession).
 *
 * @updated v6.7.0 — partición legacy + blockInstanceId compartido.
 */

import type { SessionBlock, SessionBlockExerciseHydrationLine } from "@nexia/shared/types/sessionProgramming";
import type { TemplateProgramSessionBlock } from "@nexia/shared/types/templateProgram";
import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { hydrateSessionBlocksToConstructorRows } from "@/pages/sessionProgramming/hydrateSessionBlocksToConstructorRows";

function templateBlockToSessionBlock(block: TemplateProgramSessionBlock, index: number): SessionBlock {
    return {
        id: block.id,
        training_session_id: 0,
        block_type_id: block.block_type_id,
        order_in_session: block.order_in_session ?? index,
        set_type: block.set_type ?? null,
        rounds: block.rounds ?? null,
        time_cap: block.time_cap ?? null,
        interval_seconds: block.interval_seconds ?? null,
        objective_text: block.objective_text ?? null,
        planned_intensity: null,
        planned_volume: null,
        actual_intensity: null,
        actual_volume: null,
        estimated_duration: null,
        actual_duration: null,
        notes: null,
        created_at: "",
        updated_at: "",
        is_active: true,
    };
}

export function templateSessionBlocksToConstructorRows(
    blocks: TemplateProgramSessionBlock[],
): ConstructorRow[] {
    const sorted = [...blocks].sort((a, b) => a.order_in_session - b.order_in_session);
    const sessionBlocks = sorted.map(templateBlockToSessionBlock);

    const exercisesByBlockId: Record<number, SessionBlockExerciseHydrationLine[]> = {};
    for (const block of sorted) {
        exercisesByBlockId[block.id] = [...(block.exercises ?? [])]
            .sort((a, b) => a.order_in_block - b.order_in_block)
            .map((ex) => ({
                id: ex.id,
                exercise_id: ex.exercise_id,
                planned_reps: ex.planned_reps ?? null,
                planned_weight: ex.planned_weight ?? null,
                planned_assistance_kg: ex.planned_assistance_kg ?? null,
                planned_rest: ex.planned_rest ?? null,
                planned_sets: ex.planned_sets ?? null,
                effort_character: ex.effort_character ?? null,
                effort_value: ex.effort_value ?? null,
                notes: ex.notes ?? null,
                planned_duration: ex.planned_duration ?? null,
                order_in_block: ex.order_in_block,
                superset_group_id: ex.superset_group_id ?? null,
                dropset_sequence: ex.dropset_sequence ?? null,
            }));
    }

    return hydrateSessionBlocksToConstructorRows(sessionBlocks, exercisesByBlockId);
}
