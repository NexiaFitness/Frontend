/**
 * blockAuthoringUrl.ts — Query params del journey D-PAP (blockAuthor, blockStep, …).
 */

import {
    DEFAULT_BLOCK_AUTHOR_STEP,
    isBlockAuthorStep,
    parseBlockAuthorMode,
    type BlockAuthorMode,
    type BlockAuthorStep,
} from "@/components/trainingPlans/periodization/blockAuthoringModel";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export interface BlockAuthorParams {
    mode: BlockAuthorMode | null;
    blockId: number | null;
    blockStart: string | null;
    blockEnd: string | null;
    step: BlockAuthorStep;
}

export function validateBlockAuthorDate(value: string | null): boolean {
    if (value == null || !DATE_REGEX.test(value)) return false;
    const [y, m, d] = value.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return (
        dt.getFullYear() === y &&
        dt.getMonth() === m - 1 &&
        dt.getDate() === d
    );
}

export function parseBlockAuthorParams(
    searchParams: URLSearchParams,
): BlockAuthorParams {
    const mode = parseBlockAuthorMode(searchParams.get("blockAuthor"));
    const rawStep = searchParams.get("blockStep");
    const step = isBlockAuthorStep(rawStep)
        ? rawStep
        : DEFAULT_BLOCK_AUTHOR_STEP;

    const blockIdRaw = searchParams.get("blockId");
    const blockId =
        blockIdRaw != null && /^\d+$/.test(blockIdRaw)
            ? Number(blockIdRaw)
            : null;

    const blockStart = validateBlockAuthorDate(searchParams.get("blockStart"))
        ? searchParams.get("blockStart")
        : null;
    const blockEnd = validateBlockAuthorDate(searchParams.get("blockEnd"))
        ? searchParams.get("blockEnd")
        : null;

    return { mode, blockId, blockStart, blockEnd, step };
}

export function isBlockAuthoringActive(params: BlockAuthorParams): boolean {
    return params.mode != null;
}

export function applyBlockAuthorParams(
    prev: URLSearchParams,
    patch: Partial<{
        mode: BlockAuthorMode | null;
        blockId: number | null;
        blockStart: string | null;
        blockEnd: string | null;
        step: BlockAuthorStep;
    }>,
): URLSearchParams {
    const next = new URLSearchParams(prev);

    if (patch.mode === null) {
        next.delete("blockAuthor");
        next.delete("blockId");
        next.delete("blockStart");
        next.delete("blockEnd");
        next.delete("blockStep");
        return next;
    }

    if (patch.mode != null) {
        next.set("blockAuthor", patch.mode);
    }
    if (patch.blockId != null) {
        next.set("blockId", String(patch.blockId));
    } else if (patch.blockId === null && patch.mode === "create") {
        next.delete("blockId");
    }
    if (patch.blockStart != null) {
        next.set("blockStart", patch.blockStart);
    }
    if (patch.blockEnd != null) {
        next.set("blockEnd", patch.blockEnd);
    }
    if (patch.step != null) {
        next.set("blockStep", patch.step);
    }

    return next;
}

export function clearBlockAuthorParams(prev: URLSearchParams): URLSearchParams {
    return applyBlockAuthorParams(prev, { mode: null });
}
