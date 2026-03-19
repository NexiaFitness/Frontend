/**
 * chartParsers.ts — Parseo de strings backend a valores numéricos para gráficos
 * 
 * Contexto:
 * - Backend devuelve volume/intensity como strings libres (Optional[str])
 * - Ejemplos: "High Volume, Low Intensity", "Medium", "70-80% 1RM"
 * - Necesitamos convertir a números 0-10 para recharts
 * 
 * Responsabilidades:
 * - Parsear volume_intensity_ratio (month qualities)
 * - Parsear target_volume/target_intensity (week/day qualities)
 * - Detectar patrones: high/medium/low, números, porcentajes
 * - Fallback seguro si no coincide patrón
 * 
 * Notas de mantenimiento:
 * - Si backend cambia formato, actualizar regexes y mapeos
 * - Logs de advertencia para debugging en producción
 * - Valores por defecto: 5 (medio) para datos inválidos
 * - Rango: 0-10 (0 = muy bajo, 10 = muy alto)
 * 
 * @author Frontend Team
 * @since v3.3.0
 */

/**
 * Resultado del parseo de volume_intensity_ratio
 */
export interface ParsedVolumeIntensity {
    volume: number; // 0-10
    intensity: number; // 0-10
}

/**
 * Mapeo de palabras clave a valores numéricos
 */
const LEVEL_MAP: Record<string, number> = {
    'very low': 2,
    'low': 3,
    'medium': 5,
    'moderate': 5,
    'high': 8,
    'very high': 9,
    'bajo': 3,
    'medio': 5,
    'alto': 8,
};

/**
 * Extrae el primer número encontrado en un string
 * 
 * @param str - String a analizar
 * @returns Número extraído o null si no se encuentra
 * 
 * @example
 * extractNumberFromString("70-80% 1RM") → 70
 * extractNumberFromString("High Volume") → null
 */
export function extractNumberFromString(str: string): number | null {
    if (!str) return null;

    // Buscar primer número (entero o decimal)
    const match = str.match(/\d+\.?\d*/);
    if (!match) return null;

    const num = parseFloat(match[0]);
    return isNaN(num) ? null : num;
}

/**
 * Detecta nivel (high/medium/low) en un string
 * 
 * @param str - String a analizar
 * @returns Número 0-10 según nivel detectado, o null si no detecta
 * 
 * @example
 * detectLevel("High Volume") → 8
 * detectLevel("Medium Intensity") → 5
 * detectLevel("Bajo") → 3
 */
export function detectLevel(str: string): number | null {
    if (!str) return null;

    const normalized = str.toLowerCase().trim();

    // Buscar coincidencia exacta
    for (const [key, value] of Object.entries(LEVEL_MAP)) {
        if (normalized.includes(key)) {
            return value;
        }
    }

    return null;
}

/**
 * Parsea target_volume o target_intensity de Mesocycle
 * 
 * Estrategia:
 * 1. Si es null/undefined → 5 (medio por defecto)
 * 2. Intentar detectar nivel (high/medium/low)
 * 3. Intentar extraer número
 * 4. Si número > 10, normalizar a escala 0-10
 * 5. Fallback: 5
 * 
 * @param value - String del backend (target_volume o target_intensity)
 * @returns Número 0-10
 * 
 * @example
 * parseTargetValue("High") → 8
 * parseTargetValue("Medium") → 5
 * parseTargetValue("70-80%") → 7
 * parseTargetValue(null) → 5
 * parseTargetValue("unknown") → 5
 */
export function parseTargetValue(value: string | null | undefined): number {
    // Fallback para valores vacíos
    if (!value || value.trim() === '') {
        return 5;
    }

    // 1. Intentar detectar nivel por palabras clave
    const detectedLevel = detectLevel(value);
    if (detectedLevel !== null) {
        return detectedLevel;
    }

    // 2. Intentar extraer número
    const extractedNumber = extractNumberFromString(value);
    if (extractedNumber !== null) {
        // Si el número está en rango 0-10, usarlo directamente
        if (extractedNumber >= 0 && extractedNumber <= 10) {
            return extractedNumber;
        }

        // Si es porcentaje (>10 y ≤100), normalizar a 0-10
        if (extractedNumber > 10 && extractedNumber <= 100) {
            return Math.round((extractedNumber / 100) * 10);
        }

        // Si es mayor que 100, normalizar asumiendo escala 0-100
        if (extractedNumber > 100) {
            return Math.min(10, Math.round(extractedNumber / 10));
        }
    }

    // 3. Fallback: valor medio
    if (process.env.NODE_ENV === 'development') {
        console.warn(`[chartParsers] Could not parse target value: "${value}". Using default: 5`);
    }
    return 5;
}

/**
 * Parsea volume_intensity_ratio (month qualities)
 * 
 * Formato esperado: "High Volume, Low Intensity" o variantes
 * 
 * Estrategia:
 * 1. Si es null/undefined → { volume: 5, intensity: 5 }
 * 2. Split por comas y analizar cada parte
 * 3. Detectar "volume" y "intensity" en cada parte
 * 4. Aplicar detectLevel() o extractNumberFromString()
 * 5. Fallback: valores medios
 * 
 * @param ratio - String del backend (volume_intensity_ratio)
 * @returns Objeto con volume e intensity (0-10)
 * 
 * @example
 * parseVolumeIntensityRatio("High Volume, Low Intensity") → { volume: 8, intensity: 3 }
 * parseVolumeIntensityRatio("Medium Volume, Medium Intensity") → { volume: 5, intensity: 5 }
 * parseVolumeIntensityRatio("80% Volume, 60% Intensity") → { volume: 8, intensity: 6 }
 * parseVolumeIntensityRatio(null) → { volume: 5, intensity: 5 }
 */
export function parseVolumeIntensityRatio(
    ratio: string | null | undefined
): ParsedVolumeIntensity {
    // Fallback para valores vacíos
    if (!ratio || ratio.trim() === '') {
        return { volume: 5, intensity: 5 };
    }

    const normalized = ratio.toLowerCase();
    let volume = 5;
    let intensity = 5;

    // Split por comas, punto y coma, o "and"
    const parts = normalized.split(/[,;]|\band\b/).map(p => p.trim());

    for (const part of parts) {
        // Detectar si esta parte habla de volume o intensity
        const isVolumePart = part.includes('volume') || part.includes('volumen');
        const isIntensityPart = part.includes('intensity') || part.includes('intensidad');

        if (!isVolumePart && !isIntensityPart) {
            // Parte ambigua, saltar
            continue;
        }

        // Intentar detectar nivel
        const level = detectLevel(part);
        const number = extractNumberFromString(part);

        let parsedValue = 5;
        if (level !== null) {
            parsedValue = level;
        } else if (number !== null) {
            // Normalizar número si es necesario
            if (number >= 0 && number <= 10) {
                parsedValue = number;
            } else if (number > 10 && number <= 100) {
                parsedValue = Math.round((number / 100) * 10);
            }
        }

        // Asignar al campo correspondiente
        if (isVolumePart) {
            volume = parsedValue;
        }
        if (isIntensityPart) {
            intensity = parsedValue;
        }
    }

    if (process.env.NODE_ENV === 'development') {
        console.log(`[chartParsers] Parsed "${ratio}" → volume: ${volume}, intensity: ${intensity}`);
    }

    return { volume, intensity };
}

/**
 * Valida que un valor esté en el rango 0-10
 * 
 * @param value - Valor a validar
 * @returns Valor clamped entre 0 y 10
 */
export function clampValue(value: number): number {
    return Math.max(0, Math.min(10, value));
}