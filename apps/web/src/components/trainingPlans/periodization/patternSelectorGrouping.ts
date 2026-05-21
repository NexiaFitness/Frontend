import { UI_BUCKET_LABELS, UI_BUCKET_ORDER } from "@nexia/shared";
import type { MovementPattern } from "@nexia/shared/types/exercise";

export type PatternGroup = {
    bucket: string;
    label: string;
    patterns: MovementPattern[];
};

export function groupPatternsByUiBucket(
    catalog: MovementPattern[],
): PatternGroup[] {
    const map = new Map<string, MovementPattern[]>();
    for (const p of catalog) {
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
