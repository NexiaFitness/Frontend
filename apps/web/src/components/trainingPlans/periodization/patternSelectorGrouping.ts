/**
 * patternSelectorGrouping.ts — Opciones de patrón de un selector, agrupadas por ui_bucket.
 *
 * Oculta los patrones no seleccionables (H2) salvo los ya elegidos (`planningPatternOptions`).
 */
import {
    UI_BUCKET_LABELS,
    UI_BUCKET_ORDER,
    planningPatternOptions,
} from "@nexia/shared";
import type { MovementPattern } from "@nexia/shared/types/exercise";

export type PatternGroup = {
    bucket: string;
    label: string;
    patterns: MovementPattern[];
};

export function groupPatternsByUiBucket(
    catalog: readonly MovementPattern[],
    selectedPatternIds: readonly number[],
): PatternGroup[] {
    const map = new Map<string, MovementPattern[]>();
    for (const p of planningPatternOptions(catalog, selectedPatternIds)) {
        const bucket = (p.ui_bucket || "ACCESSORY").toString().toUpperCase();
        if (!map.has(bucket)) map.set(bucket, []);
        map.get(bucket)!.push(p);
    }
    const ordered: PatternGroup[] = [];
    for (const bucket of UI_BUCKET_ORDER) {
        const list = map.get(bucket);
        if (list && list.length > 0) {
            ordered.push({
                bucket,
                label: UI_BUCKET_LABELS[bucket],
                patterns: list.sort((a, b) => a.id - b.id),
            });
        }
    }
    for (const [bucket, list] of map) {
        if (!UI_BUCKET_ORDER.includes(bucket as (typeof UI_BUCKET_ORDER)[number])) {
            ordered.push({
                bucket,
                label: bucket,
                patterns: list.sort((a, b) => a.id - b.id),
            });
        }
    }
    return ordered;
}
