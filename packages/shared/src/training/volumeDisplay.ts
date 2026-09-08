/**
 * volumeDisplay.ts — Formato de volumen en medias unidades (0,5 sets) para UI ES.
 *
 * Contexto:
 * - Decisión D-F44-04b: indirecto synergist sin truncar; API serializa 0,5 como number JSON.
 * - Consumido por WeeklyClientVolumePanel, MuscleVolumeRow y weeklyVolumePanelModel.
 *
 * Notas de mantenimiento:
 * - normalizeHalfSetVolume corrige drift float antes de renderizar (7.499… → 7,5).
 * - Enteros sin decimal; medias unidades con coma (locale ES).
 *
 * @author Frontend Team — NEXIA
 * @since D-F44-04b (2026-09-08)
 */

export function normalizeHalfSetVolume(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.round(value * 2) / 2;
}

/** Muestra entero sin decimal; media unidad con coma (7 → "7", 7.5 → "7,5"). */
export function formatHalfSetVolume(value: number): string {
    const normalized = normalizeHalfSetVolume(value);
    if (Number.isInteger(normalized)) {
        return String(normalized);
    }
    return String(normalized).replace(".", ",");
}
