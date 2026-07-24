/**
 * Shared session block/exercise contract (plan + template anti-drift).
 *
 * @sync backend/app/schemas/session_content_contract.py
 * @sync backend/app/domain/template_program/contracts.py
 */

import type { EffortCharacter, SetType } from "./sessionProgramming";

export interface SessionBlockExerciseContract {
    exercise_id: number;
    order_in_block: number;
    set_type: SetType;
    superset_group_id?: number | null;
    dropset_sequence?: number | null;
    planned_sets?: number | null;
    planned_reps?: string | null;
    planned_weight?: number | null;
    planned_duration?: number | null;
    planned_distance?: number | null;
    planned_rest?: number | null;
    effort_character?: EffortCharacter | null;
    effort_value?: number | null;
    notes?: string | null;
}

export interface SessionBlockContract {
    block_type_id: number;
    order_in_session: number;
    set_type?: SetType | null;
    rounds?: number | null;
    time_cap?: number | null;
    interval_seconds?: number | null;
    objective_text?: string | null;
    planned_intensity?: number | null;
    planned_volume?: number | null;
    estimated_duration?: number | null;
    notes?: string | null;
    exercises: SessionBlockExerciseContract[];
}
