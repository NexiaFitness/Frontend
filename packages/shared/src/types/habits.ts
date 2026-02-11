/**
 * habits.ts — Tipos para el módulo Habits Tracker
 *
 * Propósito: Tipos alineados con backend GET /habits/clients/{id}/insights (HabitInsightsOut).
 * Contexto: DEC-02 MVP — sección Hábitos en tab Resumen del cliente.
 *
 * @author Frontend Team
 * @since v6.0.0
 */

/**
 * HabitInsightsOut — Respuesta de GET /habits/clients/{client_id}/insights
 * Backend schema: app.schemas.habits.HabitInsightsOut
 */
export interface HabitInsightsOut {
    /** Porcentaje medio de cumplimiento (0–100) */
    average_completion: number;
    /** Mejor racha en días */
    best_streak: number;
    /** Número de hábitos activos del cliente */
    active_habits: number;
    /** Título del hábito más saltado (menor cumplimiento) */
    most_skipped: string | null;
    /** Categoría -> % cumplimiento */
    completion_by_category: Record<string, number>;
    /** Título hábito -> racha actual */
    streak_by_habit: Record<string, number>;
}
