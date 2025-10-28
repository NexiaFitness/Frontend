/**
 * clientStats.ts — Tipos TypeScript para estadísticas de clientes
 *
 * Contexto:
 * - Define tipos para endpoint GET /api/v1/clients/stats
 * - Usado en TrainerDashboard para mostrar métricas agregadas
 * - Alineado con backend FastAPI (respuesta documentada por Sosina)
 * - Response varía según role: trainers ven sus clientes, admins ven todo
 *
 * Arquitectura de respuestas:
 * - GET /api/v1/clients/stats devuelve ClientStatsResponse directo (no wrapper)
 * - Campos opcionales para admins: total_trainers, avg_clients_per_trainer
 * - Agregaciones: by_goal (objetivos), by_experience (niveles)
 *
 * @author Frontend Team
 * @since v2.6.0
 */

// Client Stats Response - Base para trainers
export interface ClientStatsResponse {
    // Contadores principales
    total_clients: number;
    active_clients: number;
    inactive_clients: number;
    active_percentage: number;

    // Promedios antropométricos
    avg_age: number;
    avg_bmi: number;

    // Distribuciones agregadas
    by_goal: Record<string, number>;
    by_experience: Record<string, number>;

    // Campos adicionales solo para admins (opcionales)
    total_trainers?: number;
    avg_clients_per_trainer?: number;
}

// Type guard para validación en runtime
export const isClientStatsResponse = (data: unknown): data is ClientStatsResponse => {
    if (typeof data !== 'object' || data === null) return false;
    
    const stats = data as Record<string, unknown>;
    
    return (
        typeof stats.total_clients === 'number' &&
        typeof stats.active_clients === 'number' &&
        typeof stats.inactive_clients === 'number' &&
        typeof stats.active_percentage === 'number' &&
        typeof stats.avg_age === 'number' &&
        typeof stats.avg_bmi === 'number' &&
        typeof stats.by_goal === 'object' &&
        typeof stats.by_experience === 'object'
    );
};

// Utility types para componentes UI
export interface ClientStatsCardData {
    label: string;
    value: number | string;
    icon?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: number;
}