/**
 * postSessionCompletionUnitsLabel.ts — Copy del contador hero post-sesión (C1).
 */

import type { PostSessionCompletionUnitsLabel } from "../../types/trainingSessions";

const LABELS: Record<PostSessionCompletionUnitsLabel, string> = {
    sets: "series",
    blocks: "bloques",
    units: "unidades",
};

export function formatPostSessionCompletionUnitsLabel(
    label: PostSessionCompletionUnitsLabel | undefined
): string {
    return LABELS[label ?? "sets"];
}
