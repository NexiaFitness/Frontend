/**
 * volumeDisplay.ts — Formato de volumen en cuartos de serie (0,25) para UI ES.
 *
 * Contexto:
 * - D-F44-04b: sinergista ×0,5 sin truncar. H4 (motor v2): descuento pliométrico ×0,5, así
 *   que el paso mínimo es 0,25 y el directo también puede ser fraccional. La API serializa
 *   esos valores como number JSON (exactos en binario).
 * - Consumido por WeeklyClientVolumePanel, MuscleVolumeRow y weeklyVolumePanelModel.
 *
 * Notas de mantenimiento:
 * - normalizeSetVolume corrige drift float antes de renderizar (7.249… → 7,25).
 * - Enteros sin decimal; fracciones con coma y sin ceros sobrantes (2,5 · 2,25).
 *
 * @author Frontend Team — NEXIA
 * @since D-F44-04b (2026-09-08); cuartos de serie desde 2.0.0 (H4)
 */

/** Paso mínimo de volumen (series). */
export const VOLUME_SET_STEP = 0.25;

export function normalizeSetVolume(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.round(value / VOLUME_SET_STEP) * VOLUME_SET_STEP;
}

/** Muestra entero sin decimal; fracciones con coma (7 → "7", 7.5 → "7,5", 2.25 → "2,25"). */
export function formatSetVolume(value: number): string {
    const normalized = normalizeSetVolume(value);
    if (Number.isInteger(normalized)) {
        return String(normalized);
    }
    return String(Number(normalized.toFixed(2))).replace(".", ",");
}
