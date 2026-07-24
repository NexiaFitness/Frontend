/**
 * Template program API types (C plantillas PR3–PR4).
 *
 * @sync backend/app/schemas/template_program.py
 */

import type { SessionBlockContract, SessionBlockExerciseContract } from "./sessionContentContract";
import type { WeeklyStructureWeek, WeeklyStructureWeekCreate } from "./weeklyStructure";

export type TemplateContentStatus =
    | "program_empty"
    | "program_in_progress"
    | "program_complete";

export interface TemplateProgramBlockQualityIn {
    physical_quality_id: number;
    percentage: number;
}

export interface TemplateProgramBlockQualityOut extends TemplateProgramBlockQualityIn {
    id: number;
    physical_quality_name?: string | null;
    physical_quality_slug?: string | null;
}

export interface TemplateProgramBlockCreate {
    name?: string | null;
    goal?: string | null;
    program_week_start: number;
    program_week_end: number;
    volume_level: number;
    intensity_level: number;
    sort_order?: number | null;
    qualities: TemplateProgramBlockQualityIn[];
}

export interface TemplateProgramBlockUpdate {
    name?: string | null;
    goal?: string | null;
    program_week_start?: number;
    program_week_end?: number;
    volume_level?: number;
    intensity_level?: number;
    sort_order?: number | null;
    qualities?: TemplateProgramBlockQualityIn[];
}

export interface TemplateProgramBlock {
    id: number;
    template_id: number;
    name: string | null;
    goal: string | null;
    program_week_start: number;
    program_week_end: number;
    volume_level: number;
    intensity_level: number;
    sort_order: number | null;
    qualities: TemplateProgramBlockQualityOut[];
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export interface TemplateProgramWeeklyStructureOut {
    template_program_block_id: number;
    weeks: WeeklyStructureWeek[];
}

export interface TemplateProgramSummary {
    content_status: TemplateContentStatus;
    program_week_count: number | null;
    blocks_count: number;
    sessions_count: number;
    declared_duration_weeks: number | null;
    duration_mismatch_warning: string | null;
    lifecycle_status: string;
    validation_status: string;
}

export interface TemplateProgramValidateResult {
    validation_status: string;
    validation_report: Record<string, unknown>;
    program_week_count: number | null;
    validated_at: string;
}

export interface TemplateProgramPublishResult {
    lifecycle_status: string;
    template_revision: number;
    revision_snapshot_id: number;
    published_at: string;
    structure_hash: string;
}

export interface TemplateProgramArchiveResult {
    lifecycle_status: string;
    archived_at: string;
}

export interface TemplateAssignWarning {
    code: string;
    message: string;
}

export interface TemplateAssignPreviewIn {
    client_id: number;
    start_date: string;
}

export interface TemplateAssignPreviewOut {
    start_date: string;
    end_date: string;
    program_week_count: number | null;
    duration_source: "structure" | "declared_metadata";
    content_status: TemplateContentStatus;
    lifecycle_status: string;
    validation_status: string;
    assignable: boolean;
    block_reasons: string[];
    warnings: TemplateAssignWarning[];
}

export interface TemplateProgramSessionCreate {
    template_program_block_id: number;
    session_name: string;
    session_type: string;
    program_week: number;
    day_of_week: number;
    slot_order?: number;
    notes?: string | null;
    planned_duration?: number | null;
    planned_intensity?: number | null;
    planned_volume?: number | null;
}

export interface TemplateProgramSessionUpdate {
    session_name?: string;
    session_type?: string;
    program_week?: number;
    day_of_week?: number;
    slot_order?: number;
    notes?: string | null;
    planned_duration?: number | null;
    planned_intensity?: number | null;
    planned_volume?: number | null;
    template_program_block_id?: number;
}

export interface TemplateProgramSessionBlockExercise extends SessionBlockExerciseContract {
    id: number;
}

export interface TemplateProgramSessionBlock extends SessionBlockContract {
    id: number;
    exercises: TemplateProgramSessionBlockExercise[];
}

export interface TemplateProgramSession {
    id: number;
    template_id: number;
    template_program_block_id: number;
    session_name: string;
    session_type: string;
    program_week: number;
    day_of_week: number;
    slot_order: number;
    notes: string | null;
    planned_duration: number | null;
    planned_intensity: number | null;
    planned_volume: number | null;
    blocks: TemplateProgramSessionBlock[];
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export interface TemplateProgramSessionListItem {
    id: number;
    template_id: number;
    template_program_block_id: number;
    session_name: string;
    session_type: string;
    program_week: number;
    day_of_week: number;
    slot_order: number;
    notes: string | null;
    planned_duration: number | null;
    planned_intensity: number | null;
    planned_volume: number | null;
    block_count: number;
    exercise_count: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export interface TemplateProgramSessionBlocksUpdate {
    blocks: SessionBlockContract[];
}

export type TemplateProgramWeeklyStructureWeekCreate = WeeklyStructureWeekCreate;
