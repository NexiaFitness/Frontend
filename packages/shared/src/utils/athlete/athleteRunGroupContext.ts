/**
 * athleteRunGroupContext.ts — Contexto de grupo (superset/giant/dropset) en run V05.
 */

import type { AthleteFlatExercise } from "../../offline/athleteSessionTypes";
import { formatEmomMinuteLabel } from "./emomResult";
import type { AthleteEmomInterval, AthleteRunStep } from "./buildAthleteRunSteps";

export type AthleteRunGroupSlotStatus = "done" | "current" | "upcoming";

export interface AthleteRunGroupSlotView {
    slotLabel: string;
    exerciseName: string;
    status: AthleteRunGroupSlotStatus;
    prescription: string;
}

export interface AthleteRunGroupContextView {
    groupKind: string;
    sectionLabel: string;
    groupBadgeLabel: string | null;
    explanation: string;
    roundLabel: string | null;
    slots: AthleteRunGroupSlotView[];
    nextExerciseName: string | null;
    transitionHint: string | null;
}

const COMPOUND_GROUP_KINDS = new Set(["superset", "giant_set", "dropset"]);

const GROUP_EXPLANATION: Record<string, string> = {
    superset:
        "Alternas dos ejercicios seguidos, sin descanso entre ellos. Descansas solo al terminar la ronda.",
    giant_set:
        "Completa todos los ejercicios del circuito seguidos. Descansas al cerrar la ronda.",
    dropset:
        "Baja el peso sin descanso entre pasos. Descansas al terminar la secuencia completa.",
};

const GROUP_SECTION_LABEL: Record<string, string> = {
    superset: "Superset",
    giant_set: "Circuito",
    dropset: "Drop set",
    amrap: "AMRAP",
    emom: "EMOM",
    for_time: "For Time",
};

export interface TimedBlockExplanationParams {
    groupKind: string;
    timeCapMinutes?: number | null;
    intervalSeconds?: number | null;
    slotCount?: number;
}

/** Copy procedimental timed (run + step.instruction) — lenguaje atleta, no entrenador. */
export function buildTimedBlockExplanation({
    groupKind,
    timeCapMinutes,
    intervalSeconds,
    slotCount = 0,
}: TimedBlockExplanationParams): string {
    const exerciseScope =
        slotCount > 1
            ? "la secuencia de ejercicios"
            : slotCount === 1
              ? "el ejercicio"
              : "la secuencia";

    if (groupKind === "amrap") {
        if (timeCapMinutes != null) {
            return `Repite ${exerciseScope} tantas veces como puedas en ${timeCapMinutes} min.`;
        }
        return `Repite ${exerciseScope} tantas veces como puedas en el tiempo indicado.`;
    }

    if (groupKind === "emom") {
        if (intervalSeconds != null) {
            return `Tienes ${intervalSeconds} segundos para hacer estos ejercicios. Si terminas antes, espera al siguiente intervalo.`;
        }
        return "Haz estos ejercicios antes de que acabe el cronómetro. Si terminas antes, espera al siguiente intervalo.";
    }

    if (groupKind === "for_time") {
        return `Haz los ejercicios en orden, lo más rápido que puedas sin perder técnica. El cronómetro mide tu tiempo.`;
    }

    return "";
}

const COUNT_WORDS: Record<number, string> = {
    2: "dos",
    3: "tres",
    4: "cuatro",
    5: "cinco",
    6: "seis",
};

function exerciseCountWord(count: number): string {
    return COUNT_WORDS[count] ?? String(count);
}

export function buildGroupExplanation(groupKind: string, slotCount: number, fallback = ""): string {
    if (groupKind === "dropset") {
        return GROUP_EXPLANATION.dropset ?? fallback;
    }

    if (groupKind === "giant_set") {
        if (slotCount <= 1) return GROUP_EXPLANATION.giant_set ?? fallback;
        return `Completa ${exerciseCountWord(slotCount)} ejercicios del circuito seguidos. Descansas al cerrar la ronda.`;
    }

    // superset (y fallback genérico)
    if (slotCount <= 1) {
        return GROUP_EXPLANATION.superset ?? fallback;
    }
    return `Alternas ${exerciseCountWord(slotCount)} ejercicios seguidos, sin descanso entre ellos. Descansas solo al terminar la ronda.`;
}

function slotSortKey(slotLabel?: string): number {
    if (!slotLabel) return 0;
    const aMatch = /^A(\d+)$/.exec(slotLabel);
    if (aMatch) return Number(aMatch[1]);
    if (slotLabel === "MAIN") return 0;
    const dropMatch = /^DROP (\d+)$/.exec(slotLabel);
    if (dropMatch) return 100 + Number(dropMatch[1]);
    return 200;
}

function sameRunGroup(a: AthleteFlatExercise, b: AthleteFlatExercise): boolean {
    if (a.groupId && b.groupId) return a.groupId === b.groupId;
    return (
        a.groupKind === b.groupKind &&
        a.badgeLabel === b.badgeLabel &&
        a.blockName === b.blockName
    );
}

function stepIndexFor(flatExercises: AthleteFlatExercise[], stepKey: string): number {
    return flatExercises.findIndex((item) => item.stepKey === stepKey);
}

/** ¿Mostrar timer de descanso tras completar este paso? */
export function shouldRestAfterCompletingStep(
    current: AthleteFlatExercise,
    next: AthleteFlatExercise | undefined
): boolean {
    if (!next || !current.restSeconds || current.restSeconds <= 0) return false;

    if (!current.groupKind || !COMPOUND_GROUP_KINDS.has(current.groupKind)) {
        return true;
    }

    if (!sameRunGroup(current, next)) return true;

    if (
        current.groupKind === "superset" ||
        current.groupKind === "giant_set" ||
        current.groupKind === "dropset"
    ) {
        if (
            current.roundIndex != null &&
            next.roundIndex === current.roundIndex
        ) {
            return false;
        }
    }

    return true;
}

/** Contexto visual del grupo para la ronda actual (null si single_set). */
export function buildAthleteRunGroupContext(
    flatExercises: AthleteFlatExercise[],
    currentStepKey: string
): AthleteRunGroupContextView | null {
    const currentIndex = stepIndexFor(flatExercises, currentStepKey);
    if (currentIndex < 0) return null;

    const current = flatExercises[currentIndex];
    if (!current.groupKind || !COMPOUND_GROUP_KINDS.has(current.groupKind)) {
        return null;
    }

    const groupSteps = flatExercises.filter((item) => sameRunGroup(item, current));
    const roundIndex = current.roundIndex;
    const roundPeers =
        roundIndex != null
            ? groupSteps.filter((item) => item.roundIndex === roundIndex)
            : groupSteps;

    const sortedPeers = [...roundPeers].sort(
        (a, b) => slotSortKey(a.slotLabel) - slotSortKey(b.slotLabel)
    );

    const currentPeerIndex = sortedPeers.findIndex(
        (item) => item.stepKey === current.stepKey
    );

    const slots: AthleteRunGroupSlotView[] = sortedPeers.map((peer, idx) => {
        let status: AthleteRunGroupSlotStatus = "upcoming";
        if (idx < currentPeerIndex) status = "done";
        else if (idx === currentPeerIndex) status = "current";

        return {
            slotLabel: peer.slotLabel ?? peer.setLabel,
            exerciseName: peer.name,
            status,
            prescription: peer.plannedLabel,
        };
    });

    const next = flatExercises[currentIndex + 1] ?? null;
    const nextInSameRound =
        next &&
        sameRunGroup(next, current) &&
        next.roundIndex === current.roundIndex;

    const roundLabel =
        current.roundIndex != null && current.roundTotal != null
            ? `Ronda ${current.roundIndex} de ${current.roundTotal}`
            : null;

    const sectionLabel =
        GROUP_SECTION_LABEL[current.groupKind] ??
        current.badgeLabel ??
        "Grupo de ejercicios";

    const explanation = buildGroupExplanation(
        current.groupKind,
        sortedPeers.length,
        current.instruction ?? ""
    );

    let transitionHint: string | null = null;
    if (nextInSameRound) {
        transitionHint = `Siguiente sin descanso: ${next.name}`;
    } else if (
        next &&
        sameRunGroup(next, current) &&
        next.roundIndex != null &&
        current.roundIndex != null &&
        next.roundIndex > current.roundIndex
    ) {
        transitionHint = `Tras este ejercicio descansas antes de la ronda ${next.roundIndex}`;
    }

    return {
        groupKind: current.groupKind,
        sectionLabel,
        groupBadgeLabel: current.badgeLabel ?? null,
        explanation,
        roundLabel,
        slots,
        nextExerciseName: nextInSameRound ? next.name : null,
        transitionHint,
    };
}

/** Contexto de grupo desde paso `group_round` (B.2). */
export function buildAthleteRunGroupContextFromStep(
    step: import("./buildAthleteRunSteps").AthleteRunStep
): AthleteRunGroupContextView | null {
    if ((step.kind !== "group_round" && step.kind !== "timed_block") || (!step.slots?.length && !step.emomIntervals?.length)) {
        return null;
    }

    let roundLabel: string | null = null;
    if (step.kind === "timed_block" && step.groupKind === "amrap") {
        roundLabel =
            step.timeCapMinutes != null ? `${step.timeCapMinutes} min` : "AMRAP";
    } else if (step.kind === "timed_block" && step.groupKind === "emom") {
        roundLabel =
            step.minuteIndex != null && step.minuteTotal != null
                ? `Intervalo ${step.minuteIndex} de ${step.minuteTotal}`
                : null;
    } else if (step.roundIndex != null && step.roundTotal != null) {
        roundLabel = `Ronda ${step.roundIndex} de ${step.roundTotal}`;
    }

    const sectionLabel =
        GROUP_SECTION_LABEL[step.groupKind] ?? step.badgeLabel ?? "Grupo de ejercicios";

    const explanation =
        step.kind === "timed_block"
            ? buildTimedBlockExplanation({
                  groupKind: step.groupKind,
                  timeCapMinutes: step.timeCapMinutes,
                  intervalSeconds: step.intervalSeconds,
                  slotCount: step.slots.length,
              })
            : buildGroupExplanation(
                  step.groupKind,
                  step.slots.length,
                  step.instruction ?? ""
              );

    return {
        groupKind: step.groupKind,
        sectionLabel,
        groupBadgeLabel: step.badgeLabel ?? null,
        explanation,
        roundLabel,
        slots: step.slots.map((slot) => ({
            slotLabel: slot.slotLabel,
            exerciseName: slot.exerciseName,
            status: "upcoming" as const,
            prescription: slot.plannedLabel,
        })),
        nextExerciseName: null,
        transitionHint: null,
    };
}

/** Contexto EMOM para el intervalo activo dentro de un bloque continuo. */
export function buildAthleteRunGroupContextFromEmomInterval(
    step: AthleteRunStep,
    interval: AthleteEmomInterval
): AthleteRunGroupContextView {
    const sectionLabel =
        GROUP_SECTION_LABEL.emom ?? step.badgeLabel ?? "EMOM";

    return {
        groupKind: "emom",
        sectionLabel,
        groupBadgeLabel: step.badgeLabel ?? null,
        explanation: buildTimedBlockExplanation({
            groupKind: "emom",
            timeCapMinutes: step.timeCapMinutes,
            intervalSeconds: step.intervalSeconds,
            slotCount: interval.slots.length,
        }),
        roundLabel: formatEmomMinuteLabel(
            step.intervalSeconds,
            interval.minuteIndex,
            interval.minuteTotal
        ),
        slots: interval.slots.map((slot) => ({
            slotLabel: slot.slotLabel,
            exerciseName: slot.exerciseName,
            status: "current" as const,
            prescription: slot.plannedLabel,
        })),
        nextExerciseName: null,
        transitionHint: null,
    };
}
