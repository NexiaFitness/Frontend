/**
 * athleteCopyPools.ts — Pools deterministas de copy (rotación diaria por seed).
 */

import { toLocalDateKey } from "./athleteSessionUtils";

export type CopyPoolId =
    | "hero_rest_tomorrow"
    | "hero_rest_near"
    | "hero_rest_far"
    | "hero_train_today"
    | "hero_train_done"
    | "hero_week_done"
    | "insight_rest_tomorrow_single"
    | "insight_week_partial";

const POOLS: Record<CopyPoolId, readonly string[]> = {
    hero_rest_tomorrow: [
        "Mañana vuelves con fuerza",
        "Mañana toca apretar",
        "Descansa hoy, mañana movemos hierro",
    ],
    hero_rest_near: [
        "El {weekday} lo cerramos",
        "El {weekday} la rematamos",
        "Prepara el cuerpo, el {weekday} toca",
    ],
    hero_rest_far: [
        "La próxima sesión ya está en el radar",
        "Semana en marcha, sesión programada",
        "Tu entrenamiento sigue el plan",
    ],
    hero_train_today: [
        "Listo cuando tú lo estés. Vamos a por ello.",
        "Hoy toca. Sin excusas.",
        "Tu sesión te espera. Dale con todo.",
    ],
    hero_train_done: [
        "Sesión completada. Bien ahí.",
        "Otro día ganado. Buen trabajo.",
        "Hecho. El cuerpo lo agradece.",
    ],
    hero_week_done: [
        "Semana redonda. Descansa y vuelve con ganas.",
        "Objetivo semanal cumplido. Así se construye el hábito.",
        "Semana cerrada. Buen trabajo.",
    ],
    insight_rest_tomorrow_single: [
        "Cuerpo en descanso, mente en el plan.",
        "Hoy recuperas. Mañana sumamos.",
        "Descanso activo: llegar fuerte importa.",
    ],
    insight_week_partial: [
        "Cada sesión suma. Sigue así.",
        "Vas bien. Mantén el ritmo.",
        "El impulso de hoy abre la semana.",
    ],
};

function hashSeed(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

export function pickFromPool(
    poolId: CopyPoolId,
    seed: string,
    replacements?: Record<string, string>
): string {
    const pool = POOLS[poolId];
    const index = hashSeed(`${poolId}:${seed}`) % pool.length;
    let text = pool[index] ?? pool[0];

    if (replacements) {
        for (const [key, value] of Object.entries(replacements)) {
            text = text.replaceAll(`{${key}}`, value);
        }
    }

    return text;
}

export function dailyCopySeed(today = new Date(), clientId?: number): string {
    const base = toLocalDateKey(today);
    return clientId != null ? `${base}:${clientId}` : base;
}
