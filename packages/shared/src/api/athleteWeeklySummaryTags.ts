/**
 * Tag RTK del resumen semanal del atleta (GET /athlete/weekly-summary).
 * Cerrar o valorar una sesión cambia adherencia, racha y feedback de esa semana.
 */

export const ATHLETE_WEEKLY_SUMMARY_TAG = {
    type: "AthleteWeeklySummary" as const,
    id: "CURRENT",
};

export type UpdateTrainingSessionInvalidationTag =
    | { type: "TrainingSession"; id: string | number }
    | { type: "TrainingPlan"; id: number }
    | typeof ATHLETE_WEEKLY_SUMMARY_TAG;

export function getUpdateTrainingSessionInvalidationTags(
    sessionId: number,
    result: { training_plan_id?: number | null } | undefined
): UpdateTrainingSessionInvalidationTag[] {
    const tags: UpdateTrainingSessionInvalidationTag[] = [
        { type: "TrainingSession", id: sessionId },
        ATHLETE_WEEKLY_SUMMARY_TAG,
    ];
    if (result?.training_plan_id) {
        tags.push(
            { type: "TrainingSession", id: `PLAN_${result.training_plan_id}` },
            { type: "TrainingPlan", id: result.training_plan_id }
        );
    }
    return tags;
}
