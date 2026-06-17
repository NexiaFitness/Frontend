/**
 * Athlete weekly summary types (F3b-BE-03 / F3b-FE-03).
 * Contract: docs/audits/portal-atleta/spec/F3b_BE03_ATHLETE_WEEKLY_SUMMARY.md
 * Endpoint: GET /api/v1/athlete/weekly-summary
 */

export interface AthleteWeeklyAdherence {
    sessions_planned: number;
    sessions_completed: number;
    adherence_rate: number;
    has_active_plan: boolean;
    plan_name: string | null;
}

export interface AthleteWeeklyPersonalRecord {
    exercise_id: number;
    exercise_name: string;
    max_weight: number;
    max_reps: number | null;
    tracking_date: string;
    previous_max_weight: number | null;
}

export interface AthleteWeeklyFeedback {
    feedback_count: number;
    latest_session_id: number | null;
    latest_session_name: string | null;
    latest_feedback_date: string | null;
    perceived_effort: number | null;
    has_trainer_response: boolean;
    trainer_response_at: string | null;
}

export interface AthleteWeeklySummary {
    client_id: number;
    week_start: string;
    week_end: string;
    adherence: AthleteWeeklyAdherence;
    personal_records: AthleteWeeklyPersonalRecord[];
    feedback: AthleteWeeklyFeedback;
    training_streak: number;
    highlights: string[];
}

export interface AthleteWeeklySummaryQuery {
    week_start?: string;
}
