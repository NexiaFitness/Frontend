/**
 * utils/metrics/transformSessionsToCIDCalcIn.ts
 * 
 * Transformador puro de TrainingSession[] → CIDCalcIn[]
 * 
 * Contexto:
 * - Función utilitaria para convertir sesiones de entrenamiento en items CIDCalcIn
 * - Usado por hooks V2 del módulo METRICS
 * - Independiente de lógica legacy
 * 
 * Reglas de transformación:
 * - volumen_level = actual_volume || planned_volume (1-10)
 * - intensidad_level = actual_intensity || planned_intensity (1-10)
 * - Si no existen volumen o intensidad → descartar sesión
 * - k_fase = 1.0 (default)
 * - k_experiencia = 1.0 (default)
 * - p = 1.0 (default)
 * 
 * @author Nelson Valero
 * @since v5.6.0 - Fase 1: Preparación V2
 */

import type { TrainingSession } from "../../types/training";
import type { CIDCalcIn } from "../../types/metrics";

export interface TransformSessionsOptions {
    defaultKfase?: number;
    defaultKexp?: number;
    defaultP?: number;
}

/**
 * Resultado de la transformación que incluye items y mapeo de fechas
 */
export interface TransformSessionsResult {
    items: CIDCalcIn[];
    dateMapping: string[]; // Array de fechas reales, índice i corresponde a items[i]
}

/**
 * Transforma un array de TrainingSession en CIDCalcIn[]
 * 
 * IMPORTANTE: El backend espera que los items estén ordenados por fecha y que cada item
 * represente un día. Si hay múltiples sesiones en el mismo día, se promedian los valores.
 * 
 * @param sessions - Array de sesiones de entrenamiento (debe incluir session_date)
 * @param options - Opciones para valores por defecto (k_fase, k_experiencia, p)
 * @returns Array de CIDCalcIn ordenado por fecha, agrupado por día
 * 
 * @example
 * ```typescript
 * const sessions: TrainingSession[] = [
 *   { session_date: "2025-01-01", actual_volume: 8, actual_intensity: 7, ... },
 *   { session_date: "2025-01-01", actual_volume: 6, actual_intensity: 5, ... }, // Mismo día
 *   { session_date: "2025-01-03", planned_volume: 7, planned_intensity: 6, ... },
 * ];
 * 
 * const items = transformSessionsToCIDCalcIn(sessions);
 * // [
 * //   { volumen_level: 7, intensidad_level: 6, ... }, // Promedio del 2025-01-01
 * //   { volumen_level: 7, intensidad_level: 6, ... }  // 2025-01-03
 * // ]
 * ```
 */
export function transformSessionsToCIDCalcIn(
    sessions: TrainingSession[],
    options?: TransformSessionsOptions
): CIDCalcIn[] {
    const {
        defaultKfase = 1.0,
        defaultKexp = 1.0,
        defaultP = 1.0,
    } = options || {};

    // Paso 1: Filtrar y validar sesiones
    const validSessions = sessions
        .map((session) => {
            // Prioridad: actual > planned
            const volumen_level = session.actual_volume ?? session.planned_volume;
            const intensidad_level = session.actual_intensity ?? session.planned_intensity;

            // Si no hay volumen o intensidad, descartar sesión
            if (volumen_level === null || volumen_level === undefined) {
                return null;
            }
            if (intensidad_level === null || intensidad_level === undefined) {
                return null;
            }

            // Validar que estén en rango 1-10
            if (volumen_level < 1 || volumen_level > 10) {
                return null;
            }
            if (intensidad_level < 1 || intensidad_level > 10) {
                return null;
            }

            // Validar que tenga fecha
            if (!session.session_date) {
                return null;
            }

            return {
                session_date: session.session_date,
                volumen_level,
                intensidad_level,
            };
        })
        .filter((item): item is { session_date: string; volumen_level: number; intensidad_level: number } => item !== null);

    // Paso 2: Agrupar por día (si hay múltiples sesiones en el mismo día, promediar)
    const sessionsByDate = new Map<string, { volumen_level: number[]; intensidad_level: number[] }>();
    
    for (const session of validSessions) {
        // Normalizar fecha a YYYY-MM-DD (por si viene con hora)
        const dateKey = session.session_date.split('T')[0];
        
        if (!sessionsByDate.has(dateKey)) {
            sessionsByDate.set(dateKey, { volumen_level: [], intensidad_level: [] });
        }
        
        const dayData = sessionsByDate.get(dateKey)!;
        dayData.volumen_level.push(session.volumen_level);
        dayData.intensidad_level.push(session.intensidad_level);
    }

    // Paso 3: Crear items (promediar si hay múltiples sesiones en el mismo día)
    const items: CIDCalcIn[] = [];
    const dateMapping: string[] = [];
    const sortedDates = Array.from(sessionsByDate.keys()).sort();
    
    for (const dateKey of sortedDates) {
        const dayData = sessionsByDate.get(dateKey)!;
        
        // Promediar valores si hay múltiples sesiones en el mismo día
        const avgVolumen = dayData.volumen_level.reduce((sum, v) => sum + v, 0) / dayData.volumen_level.length;
        const avgIntensidad = dayData.intensidad_level.reduce((sum, i) => sum + i, 0) / dayData.intensidad_level.length;
        
        items.push({
            volumen_level: Math.round(avgVolumen * 10) / 10, // Redondear a 1 decimal
            intensidad_level: Math.round(avgIntensidad * 10) / 10,
            k_fase: defaultKfase,
            k_experiencia: defaultKexp,
            p: defaultP,
        } as CIDCalcIn);
        
        // Guardar la fecha real para este item
        dateMapping.push(dateKey);
    }

    return items;
}

/**
 * Transforma sesiones y retorna items con mapeo de fechas
 * 
 * @param sessions - Array de sesiones de entrenamiento
 * @param options - Opciones para valores por defecto
 * @returns Objeto con items y mapeo de fechas (índice i → fecha real de items[i])
 */
export function transformSessionsToCIDCalcInWithDates(
    sessions: TrainingSession[],
    options?: TransformSessionsOptions
): TransformSessionsResult {
    const {
        defaultKfase = 1.0,
        defaultKexp = 1.0,
        defaultP = 1.0,
    } = options || {};

    // Paso 1: Filtrar y validar sesiones
    const validSessions = sessions
        .map((session) => {
            // Prioridad: actual > planned
            const volumen_level = session.actual_volume ?? session.planned_volume;
            const intensidad_level = session.actual_intensity ?? session.planned_intensity;

            // Si no hay volumen o intensidad, descartar sesión
            if (volumen_level === null || volumen_level === undefined) {
                return null;
            }
            if (intensidad_level === null || intensidad_level === undefined) {
                return null;
            }

            // Validar que estén en rango 1-10
            if (volumen_level < 1 || volumen_level > 10) {
                return null;
            }
            if (intensidad_level < 1 || intensidad_level > 10) {
                return null;
            }

            // Validar que tenga fecha
            if (!session.session_date) {
                return null;
            }

            return {
                session_date: session.session_date,
                volumen_level,
                intensidad_level,
            };
        })
        .filter((item): item is { session_date: string; volumen_level: number; intensidad_level: number } => item !== null);

    // Paso 2: Agrupar por día (si hay múltiples sesiones en el mismo día, promediar)
    const sessionsByDate = new Map<string, { volumen_level: number[]; intensidad_level: number[] }>();
    
    for (const session of validSessions) {
        // Normalizar fecha a YYYY-MM-DD (por si viene con hora)
        const dateKey = session.session_date.split('T')[0];
        
        if (!sessionsByDate.has(dateKey)) {
            sessionsByDate.set(dateKey, { volumen_level: [], intensidad_level: [] });
        }
        
        const dayData = sessionsByDate.get(dateKey)!;
        dayData.volumen_level.push(session.volumen_level);
        dayData.intensidad_level.push(session.intensidad_level);
    }

    // Paso 3: Crear items (promediar si hay múltiples sesiones en el mismo día)
    const items: CIDCalcIn[] = [];
    const dateMapping: string[] = [];
    const sortedDates = Array.from(sessionsByDate.keys()).sort();
    
    for (const dateKey of sortedDates) {
        const dayData = sessionsByDate.get(dateKey)!;
        
        // Promediar valores si hay múltiples sesiones en el mismo día
        const avgVolumen = dayData.volumen_level.reduce((sum, v) => sum + v, 0) / dayData.volumen_level.length;
        const avgIntensidad = dayData.intensidad_level.reduce((sum, i) => sum + i, 0) / dayData.intensidad_level.length;
        
        items.push({
            volumen_level: Math.round(avgVolumen * 10) / 10, // Redondear a 1 decimal
            intensidad_level: Math.round(avgIntensidad * 10) / 10,
            k_fase: defaultKfase,
            k_experiencia: defaultKexp,
            p: defaultP,
        } as CIDCalcIn);
        
        // Guardar la fecha real para este item
        dateMapping.push(dateKey);
    }

    return {
        items,
        dateMapping,
    };
}

/**
 * Calcula el CID (Carga Interna Diaria) usando la fórmula BLOQUE 5 del backend
 * 
 * Fórmula: CID = (Vn × In^p) × k_fase × k_experiencia × 100
 * 
 * @param item - Item CIDCalcIn con valores de volumen e intensidad
 * @returns Valor CID calculado (0-100)
 */
export function calculateCIDFromItem(item: CIDCalcIn): number {
    const vn = item.volumen_level / 10.0;
    const inn = item.intensidad_level / 10.0;
    const p = item.p ?? 1.0;
    const k_fase = item.k_fase ?? 1.0;
    const k_experiencia = item.k_experiencia ?? 1.0;
    
    const base = vn * (inn ** p);
    const cidValue = base * k_fase * k_experiencia * 100.0;
    
    // Clamp entre 0 y 100
    return Math.min(100, Math.max(0, cidValue));
}

