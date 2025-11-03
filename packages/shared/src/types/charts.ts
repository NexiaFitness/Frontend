/**
 * charts.ts — Tipos TypeScript para módulo de gráficos
 * 
 * Contexto:
 * - Define tipos para sistema de gráficos de training plans
 * - Usado por chartAggregators, VolumeIntensityChart, ChartsTab
 * 
 * Responsabilidades:
 * - ChartView: vistas temporales disponibles
 * - ChartDataPoint: estructura de datos para recharts
 * - ChartMetrics: configuración de métricas visibles
 * 
 * Notas de mantenimiento:
 * - Si se agregan nuevas vistas, actualizar ChartView
 * - Si se agregan nuevas métricas, actualizar ChartMetrics
 * 
 * @author Frontend Team
 * @since v3.3.0
 */

/**
 * Vistas temporales disponibles para gráficos
 */
export type ChartView = 'weekly' | 'monthly' | 'annual';

/**
 * Punto de dato para gráficos de volumen/intensidad
 * 
 * Usado por recharts en VolumeIntensityChart
 */
export interface ChartDataPoint {
  date: string; // ISO date (YYYY-MM-DD)
  volume: number | null; // 0-10 (null si no hay datos)
  intensity: number | null; // 0-10 (null si no hay datos)
  label: string; // Human-readable label (ej: "Mon", "Week 1", "Jan")
}

/**
 * Configuración de métricas visibles en gráfico
 * 
 * Controlado por toggles en ChartControls
 */
export interface ChartMetrics {
  showVolume: boolean; // Mostrar línea/barra de volumen
  showIntensity: boolean; // Mostrar línea/barra de intensidad
  showStrength?: boolean; // (Futuro) Mostrar métrica de fuerza
  showEndurance?: boolean; // (Futuro) Mostrar métrica de resistencia
}