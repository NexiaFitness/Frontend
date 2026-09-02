/**
 * blockAuthoringModel.ts — Pasos y reglas del journey D-PAP (5 pasos).
 *
 * Distinto del constructor legacy (`periodBlockConstructor.ts`): sin rango ni
 * «semana tipo» expuesta; Días y Patrones son pasos separados.
 */

export type BlockAuthorMode = "create" | "edit";

export type BlockAuthorStep =
    | "qualities"
    | "volumeIntensity"
    | "days"
    | "patterns"
    | "summary";

export const BLOCK_AUTHOR_STEP_ORDER: BlockAuthorStep[] = [
    "qualities",
    "volumeIntensity",
    "days",
    "patterns",
    "summary",
];

export const BLOCK_AUTHOR_STEP_LABELS: Record<BlockAuthorStep, string> = {
    qualities: "Cualidades",
    volumeIntensity: "Volumen e intensidad",
    days: "Días",
    patterns: "Patrones",
    summary: "Resumen",
};

export const DEFAULT_BLOCK_AUTHOR_STEP: BlockAuthorStep = "qualities";

export function isBlockAuthorStep(value: string | null): value is BlockAuthorStep {
    return (
        value != null &&
        (BLOCK_AUTHOR_STEP_ORDER as string[]).includes(value)
    );
}

export function blockAuthorStepIndex(step: BlockAuthorStep): number {
    return BLOCK_AUTHOR_STEP_ORDER.indexOf(step);
}

export function nextBlockAuthorStep(
    current: BlockAuthorStep,
): BlockAuthorStep | null {
    const i = blockAuthorStepIndex(current);
    if (i < 0 || i >= BLOCK_AUTHOR_STEP_ORDER.length - 1) return null;
    return BLOCK_AUTHOR_STEP_ORDER[i + 1];
}

export function prevBlockAuthorStep(
    current: BlockAuthorStep,
): BlockAuthorStep | null {
    const i = blockAuthorStepIndex(current);
    if (i <= 0) return null;
    return BLOCK_AUTHOR_STEP_ORDER[i - 1];
}

/** Pasos anteriores al actual siempre accesibles en ambos modos. */
export function canNavigateToBlockAuthorStep(
    mode: BlockAuthorMode,
    target: BlockAuthorStep,
    current: BlockAuthorStep,
    maxReachedStep: BlockAuthorStep,
): boolean {
    const targetIdx = blockAuthorStepIndex(target);
    const currentIdx = blockAuthorStepIndex(current);
    const maxIdx = blockAuthorStepIndex(maxReachedStep);
    if (targetIdx <= currentIdx) return true;
    if (mode === "edit") return true;
    return targetIdx <= maxIdx + 1;
}

export function parseBlockAuthorMode(
    value: string | null,
): BlockAuthorMode | null {
    if (value === "create" || value === "edit") return value;
    return null;
}
