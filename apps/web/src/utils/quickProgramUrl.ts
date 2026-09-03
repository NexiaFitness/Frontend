/**
 * quickProgramUrl.ts — Query params del journey Quick Program (namespace qp*, F3).
 *
 * Separado de blockAuthor* para no colisionar con F2.
 */

const QP_FLAG = "qp";

export function isQuickProgramActive(searchParams: URLSearchParams): boolean {
    return searchParams.get(QP_FLAG) === "1";
}

export function applyQuickProgramParam(prev: URLSearchParams): URLSearchParams {
    const next = new URLSearchParams(prev);
    next.set("tab", "planning");
    next.set(QP_FLAG, "1");
    next.delete("blockAuthor");
    next.delete("blockId");
    next.delete("blockStart");
    next.delete("blockEnd");
    next.delete("blockStep");
    next.delete("blockWeeks");
    return next;
}

export function clearQuickProgramParam(prev: URLSearchParams): URLSearchParams {
    const next = new URLSearchParams(prev);
    next.delete(QP_FLAG);
    next.delete("qpPhase");
    next.delete("qpStep");
    return next;
}
