/**
 * chartAggregators.ts — Agregación de datos de cycles por periodo temporal
 * 
 * Contexto:
 * - Recibe Macrocycles, Mesocycles, Microcycles del backend
 * - Agrega datos por semana, mes o año para gráficos
 * - Usa chartParsers para convertir strings a números
 * 
 * Responsabilidades:
 * - Agregar datos por semana (7 días, Mon-Sun)
 * - Agregar datos por mes (4-5 semanas)
 * - Agregar datos por año (12 meses)
 * - Llenar fechas faltantes con interpolación
 * - Calcular promedios cuando múltiples cycles en mismo periodo
 * 
 * Notas de mantenimiento:
 * - Fechas en formato ISO (YYYY-MM-DD)
 * - Usar date-fns para manipulación de fechas si es necesario
 * - Prioridad: Microcycles > Mesocycles > Macrocycles
 * - Si no hay datos para un periodo, usar null (no 0)
 * 
 * @author Frontend Team
 * @since v3.3.0
 */

import { parseVolumeIntensityRatio, parseTargetValue } from './chartParsers';
import type { Macrocycle, Mesocycle, Microcycle } from '../../types/training';

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
    fillMissing?: boolean; // Llenar fechas faltantes
    interpolate?: boolean; // Interpolar valores faltantes
}

/**
 * Obtiene el lunes de una fecha dada
 */
function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

/**
 * Obtiene inicio de mes
 */
function getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Obtiene inicio de año
 */
function getStartOfYear(date: Date): Date {
    return new Date(date.getFullYear(), 0, 1);
}

/**
 * Formatea fecha a ISO string (YYYY-MM-DD)
 */
function formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Parsea fecha ISO a Date
 */
function parseDate(dateStr: string): Date {
    return new Date(dateStr);
}

/**
 * Obtiene días de diferencia entre dos fechas
 */
function getDaysDiff(date1: Date, date2: Date): number {
    const diff = date1.getTime() - date2.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Agrega datos por semana (vista Weekly)
 * 
 * Estrategia:
 * 1. Obtener lunes de la semana actual
 * 2. Generar 7 días (Mon-Sun)
 * 3. Para cada día, buscar microcycles que lo contengan
 * 4. Si hay microcycle, usar target_volume/intensity de su mesocycle
 * 5. Si no hay micro, buscar mesocycle
 * 6. Si no hay meso, buscar macrocycle
 * 7. Promediar si múltiples cycles en mismo día
 * 
 * @param macrocycles - Macrocycles del plan
 * @param mesocycles - Mesocycles del plan
 * @param microcycles - Microcycles del plan
 * @param referenceDate - Fecha de referencia (default: hoy)
 * @param options - Opciones de agregación
 * @returns Array de 7 puntos (Mon-Sun)
 */
export function aggregateDataByWeek(
    macrocycles: Macrocycle[],
    mesocycles: Mesocycle[],
    microcycles: Microcycle[],
    referenceDate?: string,
    options: AggregationOptions = { fillMissing: true, interpolate: false }
): ChartDataPoint[] {
    const refDate = referenceDate ? parseDate(referenceDate) : new Date();
    const monday = getMonday(refDate);

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dataPoints: ChartDataPoint[] = [];

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);
        const dateStr = formatDateISO(currentDate);

        // Buscar microcycles que contengan esta fecha
        const activeMicros = microcycles.filter(micro => {
            const start = parseDate(micro.start_date);
            const end = parseDate(micro.end_date);
            return currentDate >= start && currentDate <= end;
        });

        let volume: number | null = null;
        let intensity: number | null = null;

        if (activeMicros.length > 0) {
            // Obtener mesocycles de estos microcycles
            const mesoIds = activeMicros.map(m => m.mesocycle_id);
            const activeMesos = mesocycles.filter(meso => mesoIds.includes(meso.id));

            if (activeMesos.length > 0) {
                // Promediar target_volume y target_intensity
                const volumes = activeMesos
                    .map(m => parseTargetValue(m.target_volume))
                    .filter(v => v !== null);
                const intensities = activeMesos
                    .map(m => parseTargetValue(m.target_intensity))
                    .filter(v => v !== null);

                volume = volumes.length > 0
                    ? volumes.reduce((sum, v) => sum + v, 0) / volumes.length
                    : null;
                intensity = intensities.length > 0
                    ? intensities.reduce((sum, v) => sum + v, 0) / intensities.length
                    : null;
            }
        }

        // Si no hay datos de micros/mesos, buscar en macrocycles
        if (volume === null || intensity === null) {
            const activeMacros = macrocycles.filter(macro => {
                const start = parseDate(macro.start_date);
                const end = parseDate(macro.end_date);
                return currentDate >= start && currentDate <= end;
            });

            if (activeMacros.length > 0) {
                const parsed = activeMacros.map(m => parseVolumeIntensityRatio(m.volume_intensity_ratio));
                const volumes = parsed.map(p => p.volume);
                const intensities = parsed.map(p => p.intensity);

                if (volume === null) {
                    volume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
                }
                if (intensity === null) {
                    intensity = intensities.reduce((sum, v) => sum + v, 0) / intensities.length;
                }
            }
        }

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
 * Agrega datos por mes (vista Monthly)
 * 
 * Estrategia:
 * 1. Obtener inicio del mes actual
 * 2. Generar 4-5 semanas
 * 3. Para cada semana, agregar microcycles/mesocycles
 * 4. Calcular promedio semanal
 * 
 * @param macrocycles - Macrocycles del plan
 * @param mesocycles - Mesocycles del plan
 * @param microcycles - Microcycles del plan
 * @param referenceDate - Fecha de referencia (default: hoy)
 * @param options - Opciones de agregación
 * @returns Array de 4-5 puntos (Week 1-5)
 */
export function aggregateDataByMonth(
    macrocycles: Macrocycle[],
    mesocycles: Mesocycle[],
    microcycles: Microcycle[],
    referenceDate?: string,
    options: AggregationOptions = { fillMissing: true, interpolate: false }
): ChartDataPoint[] {
    const refDate = referenceDate ? parseDate(referenceDate) : new Date();
    const startOfMonth = getStartOfMonth(refDate);

    // Calcular número de semanas en el mes
    const nextMonth = new Date(startOfMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const daysInMonth = getDaysDiff(nextMonth, startOfMonth);
    const weeksInMonth = Math.ceil(daysInMonth / 7);

    const dataPoints: ChartDataPoint[] = [];

    for (let weekNum = 0; weekNum < weeksInMonth; weekNum++) {
        const weekStart = new Date(startOfMonth);
        weekStart.setDate(startOfMonth.getDate() + (weekNum * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Buscar microcycles en esta semana
        const activeMicros = microcycles.filter(micro => {
            const start = parseDate(micro.start_date);
            const end = parseDate(micro.end_date);
            return (start <= weekEnd && end >= weekStart);
        });

        let volume: number | null = null;
        let intensity: number | null = null;

        if (activeMicros.length > 0) {
            const mesoIds = activeMicros.map(m => m.mesocycle_id);
            const activeMesos = mesocycles.filter(meso => mesoIds.includes(meso.id));

            if (activeMesos.length > 0) {
                const volumes = activeMesos
                    .map(m => parseTargetValue(m.target_volume))
                    .filter(v => v !== null);
                const intensities = activeMesos
                    .map(m => parseTargetValue(m.target_intensity))
                    .filter(v => v !== null);

                volume = volumes.length > 0
                    ? volumes.reduce((sum, v) => sum + v, 0) / volumes.length
                    : null;
                intensity = intensities.length > 0
                    ? intensities.reduce((sum, v) => sum + v, 0) / intensities.length
                    : null;
            }
        }

        // Fallback a macrocycles
        if (volume === null || intensity === null) {
            const activeMacros = macrocycles.filter(macro => {
                const start = parseDate(macro.start_date);
                const end = parseDate(macro.end_date);
                return (start <= weekEnd && end >= weekStart);
            });

            if (activeMacros.length > 0) {
                const parsed = activeMacros.map(m => parseVolumeIntensityRatio(m.volume_intensity_ratio));
                const volumes = parsed.map(p => p.volume);
                const intensities = parsed.map(p => p.intensity);

                if (volume === null) {
                    volume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
                }
                if (intensity === null) {
                    intensity = intensities.reduce((sum, v) => sum + v, 0) / intensities.length;
                }
            }
        }

        dataPoints.push({
            date: formatDateISO(weekStart),
            volume,
            intensity,
            label: `Week ${weekNum + 1}`,
        });
    }

    return dataPoints;
}

/**
 * Agrega datos por año (vista Annual)
 * 
 * Estrategia:
 * 1. Generar 12 meses
 * 2. Para cada mes, agregar todos los cycles
 * 3. Calcular promedio mensual
 * 
 * @param macrocycles - Macrocycles del plan
 * @param mesocycles - Mesocycles del plan
 * @param microcycles - Microcycles del plan
 * @param referenceDate - Fecha de referencia (default: hoy)
 * @param options - Opciones de agregación
 * @returns Array de 12 puntos (Jan-Dec)
 */
export function aggregateDataByYear(
    macrocycles: Macrocycle[],
    mesocycles: Mesocycle[],
    microcycles: Microcycle[],
    referenceDate?: string,
    options: AggregationOptions = { fillMissing: true, interpolate: false }
): ChartDataPoint[] {
    const refDate = referenceDate ? parseDate(referenceDate) : new Date();
    const startOfYear = getStartOfYear(refDate);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataPoints: ChartDataPoint[] = [];

    for (let monthNum = 0; monthNum < 12; monthNum++) {
        const monthStart = new Date(startOfYear);
        monthStart.setMonth(monthNum);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthNum + 1);
        monthEnd.setDate(0); // Último día del mes

        // Buscar mesocycles en este mes
        const activeMesos = mesocycles.filter(meso => {
            const start = parseDate(meso.start_date);
            const end = parseDate(meso.end_date);
            return (start <= monthEnd && end >= monthStart);
        });

        let volume: number | null = null;
        let intensity: number | null = null;

        if (activeMesos.length > 0) {
            const volumes = activeMesos
                .map(m => parseTargetValue(m.target_volume))
                .filter(v => v !== null);
            const intensities = activeMesos
                .map(m => parseTargetValue(m.target_intensity))
                .filter(v => v !== null);

            volume = volumes.length > 0
                ? volumes.reduce((sum, v) => sum + v, 0) / volumes.length
                : null;
            intensity = intensities.length > 0
                ? intensities.reduce((sum, v) => sum + v, 0) / intensities.length
                : null;
        }

        // Fallback a macrocycles
        if (volume === null || intensity === null) {
            const activeMacros = macrocycles.filter(macro => {
                const start = parseDate(macro.start_date);
                const end = parseDate(macro.end_date);
                return (start <= monthEnd && end >= monthStart);
            });

            if (activeMacros.length > 0) {
                const parsed = activeMacros.map(m => parseVolumeIntensityRatio(m.volume_intensity_ratio));
                const volumes = parsed.map(p => p.volume);
                const intensities = parsed.map(p => p.intensity);

                if (volume === null) {
                    volume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
                }
                if (intensity === null) {
                    intensity = intensities.reduce((sum, v) => sum + v, 0) / intensities.length;
                }
            }
        }

        dataPoints.push({
            date: formatDateISO(monthStart),
            volume,
            intensity,
            label: monthNames[monthNum],
        });
    }

    return dataPoints;
}

/**
 * Llena fechas faltantes con interpolación lineal
 * 
 * @param data - Datos con posibles huecos
 * @returns Datos con huecos rellenados
 */
export function fillMissingDates(data: ChartDataPoint[]): ChartDataPoint[] {
    if (data.length === 0) return data;

    const result: ChartDataPoint[] = [...data];

    for (let i = 0; i < result.length; i++) {
        const point = result[i];

        // Si faltan valores, intentar interpolar
        if (point.volume === null || point.intensity === null) {
            // Buscar puntos anterior y posterior con datos
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