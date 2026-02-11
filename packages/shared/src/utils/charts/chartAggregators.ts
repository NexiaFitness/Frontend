/**
 * chartAggregators.ts — Agregación de datos de plan por periodo temporal (period-based)
 *
 * Contexto:
 * - Funciones que agregan por día, semana o mes para gráficos a partir del alignment_graph
 *   (GET /training-plans/{plan_id}/alignment). Cada punto tiene cycle_type "month" | "week" | "day",
 *   date, volume e intensity.
 * - Sustituye la agregación anterior basada en Macrocycle/Mesocycle/Microcycle.
 *
 * @author Frontend Team
 * @since v3.3.0
 */

import type { CycleAlignmentPoint } from '../../types/trainingAnalytics';

/**
 * Punto de dato para gráficos
 */
export interface ChartDataPoint {
    date: string; // ISO date (YYYY-MM-DD)
    volume: number | null; // 0-10
    intensity: number | null; // 0-10
    label: string; // Human-readable label (ej: "Mon", "Week 1", "Jan")
}

/**
 * Opciones para agregación
 */
interface AggregationOptions {
    fillMissing?: boolean;
    interpolate?: boolean;
}

function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getStartOfYear(date: Date): Date {
    return new Date(date.getFullYear(), 0, 1);
}

function formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
}

function parseDate(dateStr: string): Date {
    return new Date(dateStr);
}

function getDaysDiff(date1: Date, date2: Date): number {
    const diff = date1.getTime() - date2.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Devuelve el valor (volume, intensity) aplicable a una fecha dada según el alignment_graph.
 * Prioridad: punto day para esa fecha > punto week que contiene la fecha > punto month que contiene la fecha.
 */
function getValueForDate(
    graph: CycleAlignmentPoint[],
    dateStr: string
): { volume: number | null; intensity: number | null } {
    const d = parseDate(dateStr);
    const monthKey = dateStr.slice(0, 7);
    const monday = getMonday(d);
    const weekStartStr = formatDateISO(monday);

    let dayPoint: CycleAlignmentPoint | null = null;
    let weekPoint: CycleAlignmentPoint | null = null;
    let monthPoint: CycleAlignmentPoint | null = null;

    for (const p of graph) {
        const ptDate = typeof p.date === 'string' ? p.date : (p.date as unknown as string);
        if (p.cycle_type === 'day' && ptDate === dateStr) {
            dayPoint = p;
            break;
        }
        if (p.cycle_type === 'week' && ptDate === weekStartStr) {
            weekPoint = p;
        }
        if (p.cycle_type === 'month' && ptDate.slice(0, 7) === monthKey) {
            monthPoint = p;
        }
    }

    const chosen = dayPoint ?? weekPoint ?? monthPoint;
    if (!chosen) {
        return { volume: null, intensity: null };
    }
    const vol = chosen.volume != null ? (chosen.volume <= 1 ? chosen.volume * 10 : chosen.volume) : null;
    const int = chosen.intensity != null ? (chosen.intensity <= 1 ? chosen.intensity * 10 : chosen.intensity) : null;
    return { volume: vol, intensity: int };
}

/**
 * Agrega datos por semana (vista Weekly) a partir del alignment_graph (period-based).
 * Genera 7 puntos (Mon–Sun) usando getValueForDate para cada día.
 */
export function aggregateDataByWeek(
    alignmentGraph: CycleAlignmentPoint[],
    referenceDate?: string,
    _options: AggregationOptions = { fillMissing: true, interpolate: false }
): ChartDataPoint[] {
    const refDate = referenceDate ? parseDate(referenceDate) : new Date();
    const monday = getMonday(refDate);
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dataPoints: ChartDataPoint[] = [];

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);
        const dateStr = formatDateISO(currentDate);
        const { volume, intensity } = getValueForDate(alignmentGraph, dateStr);
        dataPoints.push({
            date: dateStr,
            volume,
            intensity,
            label: weekDays[i],
        });
    }
    return dataPoints;
}

/**
 * Agrega datos por mes (vista Monthly): una entrada por semana del mes.
 * Para cada semana se usa el valor del primer día de la semana desde alignment_graph.
 */
export function aggregateDataByMonth(
    alignmentGraph: CycleAlignmentPoint[],
    referenceDate?: string,
    _options: AggregationOptions = { fillMissing: true, interpolate: false }
): ChartDataPoint[] {
    const refDate = referenceDate ? parseDate(referenceDate) : new Date();
    const startOfMonth = getStartOfMonth(refDate);
    const nextMonth = new Date(startOfMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const daysInMonth = getDaysDiff(nextMonth, startOfMonth);
    const weeksInMonth = Math.ceil(daysInMonth / 7);
    const dataPoints: ChartDataPoint[] = [];

    for (let weekNum = 0; weekNum < weeksInMonth; weekNum++) {
        const weekStart = new Date(startOfMonth);
        weekStart.setDate(startOfMonth.getDate() + weekNum * 7);
        const dateStr = formatDateISO(weekStart);
        const { volume, intensity } = getValueForDate(alignmentGraph, dateStr);
        dataPoints.push({
            date: dateStr,
            volume,
            intensity,
            label: `Week ${weekNum + 1}`,
        });
    }
    return dataPoints;
}

/**
 * Agrega datos por año (vista Annual): 12 puntos (uno por mes).
 * Usa el primer día de cada mes para obtener el valor desde alignment_graph.
 */
export function aggregateDataByYear(
    alignmentGraph: CycleAlignmentPoint[],
    referenceDate?: string,
    _options: AggregationOptions = { fillMissing: true, interpolate: false }
): ChartDataPoint[] {
    const refDate = referenceDate ? parseDate(referenceDate) : new Date();
    const startOfYear = getStartOfYear(refDate);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataPoints: ChartDataPoint[] = [];

    for (let monthNum = 0; monthNum < 12; monthNum++) {
        const monthStart = new Date(startOfYear);
        monthStart.setMonth(monthNum);
        const dateStr = formatDateISO(monthStart);
        const { volume, intensity } = getValueForDate(alignmentGraph, dateStr);
        dataPoints.push({
            date: dateStr,
            volume,
            intensity,
            label: monthNames[monthNum],
        });
    }
    return dataPoints;
}

/**
 * Llena fechas faltantes con interpolación lineal
 */
export function fillMissingDates(data: ChartDataPoint[]): ChartDataPoint[] {
    if (data.length === 0) return data;
    const result: ChartDataPoint[] = [...data];

    for (let i = 0; i < result.length; i++) {
        const point = result[i];
        if (point.volume === null || point.intensity === null) {
            let prevIdx = i - 1;
            let nextIdx = i + 1;
            while (prevIdx >= 0 && (result[prevIdx].volume === null || result[prevIdx].intensity === null)) {
                prevIdx--;
            }
            while (nextIdx < result.length && (result[nextIdx].volume === null || result[nextIdx].intensity === null)) {
                nextIdx++;
            }
            if (prevIdx >= 0 && nextIdx < result.length) {
                const prev = result[prevIdx];
                const next = result[nextIdx];
                const ratio = (i - prevIdx) / (nextIdx - prevIdx);
                if (point.volume === null && prev.volume !== null && next.volume !== null) {
                    point.volume = prev.volume + (next.volume - prev.volume) * ratio;
                }
                if (point.intensity === null && prev.intensity !== null && next.intensity !== null) {
                    point.intensity = prev.intensity + (next.intensity - prev.intensity) * ratio;
                }
            }
        }
    }
    return result;
}
