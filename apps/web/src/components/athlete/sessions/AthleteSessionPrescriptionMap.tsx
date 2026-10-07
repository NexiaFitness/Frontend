/**
 * AthleteSessionPrescriptionMap — Mapa de prescripción V04 (superficie plana, un acordeón de bloque).
 */

import React, { useId, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { AthleteExercisePerformanceInfoButton } from "@/components/athlete/sessions/AthleteExercisePerformanceInfoButton";
import { AthleteExercisePerformanceInfoSheet } from "@/components/athlete/sessions/AthleteExercisePerformanceInfoSheet";
import { AthleteInjuryCallout } from "@/components/athlete/AthleteInjuryCallout";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ATHLETE_SESSION_BLOCK_BODY,
    ATHLETE_SESSION_BLOCK_SECTION_HEADER,
    ATHLETE_SESSION_BLOCK_SECTION_HEADER_STATIC,
    ATHLETE_SESSION_EXERCISE_DETAIL,
    ATHLETE_SESSION_EXERCISE_NAME,
    ATHLETE_SESSION_EXERCISE_NOTES_BODY,
    ATHLETE_SESSION_EXERCISE_NOTES_TOGGLE,
    ATHLETE_SESSION_EXERCISE_ROW_FLAT,
    ATHLETE_SESSION_EXERCISE_ROW_FLAT_CAUTION,
    ATHLETE_SESSION_EXERCISE_SECONDARY,
    ATHLETE_SESSION_PREVIEW_BLOCK,
    ATHLETE_SESSION_SERIES_TOGGLE,
    ATHLETE_SESSION_SET_TABLE,
    ATHLETE_SESSION_SET_TABLE_CELL,
    ATHLETE_SESSION_SET_TABLE_CELL_MUTED,
    ATHLETE_SESSION_SET_TABLE_HEAD,
    ATHLETE_SESSION_SET_TABLE_ROW,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { SessionBlockView } from "@nexia/shared/sessionProgramming/sessionBlockView";
import {
    getBlockDisplayName,
    type SessionExerciseGroupView,
} from "@nexia/shared/sessionProgramming/sessionBlockView";
import {
    buildAthletePreviewExerciseCards,
    countExercisesInBlock,
    type AthletePreviewExerciseCard,
    type AthletePreviewSetLine,
} from "@nexia/shared/utils/athlete/athleteSessionPreviewUtils";
import { formatInjuryPrecautionCount } from "@nexia/shared/utils/athlete/athleteInjuryAlertUtils";
import {
    formatTrainerNoteForAthlete,
    hasHumanTrainerNote,
} from "@nexia/shared/utils/athlete/athleteSessionNotesUtils";
import { shouldShowPrescriptionBlockTitle } from "@nexia/shared/utils/athlete/athleteSessionPrescriptionMapUtils";
import { cn } from "@/lib/utils";

const GROUP_KIND_LABEL: Record<SessionExerciseGroupView["kind"], string | null> = {
    single_set: null,
    superset: "Superset",
    giant_set: "Giant set",
    dropset: "Drop set",
    amrap: "AMRAP",
    emom: "EMOM",
    for_time: "For Time",
};

function cellOrDash(value: string | null, muted = false): React.ReactNode {
    const text = value?.trim() ? value : "—";
    return (
        <td className={muted ? ATHLETE_SESSION_SET_TABLE_CELL_MUTED : ATHLETE_SESSION_SET_TABLE_CELL}>
            {text}
        </td>
    );
}

const SetLinesTable: React.FC<{ lines: AthletePreviewSetLine[] }> = ({ lines }) => {
    if (lines.length === 0) return null;
    return (
        <div className="overflow-x-auto -mx-1 px-1">
            <table className={ATHLETE_SESSION_SET_TABLE}>
                <thead>
                    <tr>
                        <th scope="col" className={ATHLETE_SESSION_SET_TABLE_HEAD}>
                            Serie
                        </th>
                        <th scope="col" className={ATHLETE_SESSION_SET_TABLE_HEAD}>
                            Reps
                        </th>
                        <th scope="col" className={ATHLETE_SESSION_SET_TABLE_HEAD}>
                            Carga
                        </th>
                        <th scope="col" className={ATHLETE_SESSION_SET_TABLE_HEAD}>
                            RIR/RPE
                        </th>
                        <th scope="col" className={ATHLETE_SESSION_SET_TABLE_HEAD}>
                            Descanso
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {lines.map((line) => (
                        <tr key={line.label} className={ATHLETE_SESSION_SET_TABLE_ROW}>
                            {cellOrDash(line.label)}
                            {cellOrDash(line.reps)}
                            {cellOrDash(line.load)}
                            {cellOrDash(line.effort)}
                            {cellOrDash(line.rest, true)}
                        </tr>
                    ))}
                </tbody>
            </table>
            {lines.some((l) => l.extras) ? (
                <p className="mt-2 text-xs text-muted-foreground">
                    {lines
                        .filter((l) => l.extras)
                        .map((l) => `${l.label}: ${l.extras}`)
                        .join(" · ")}
                </p>
            ) : null}
        </div>
    );
};

const ExerciseNotes: React.FC<{ notes: string }> = ({ notes }) => {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button
                type="button"
                className={ATHLETE_SESSION_EXERCISE_NOTES_TOGGLE}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                <span className="inline-flex items-center gap-1">
                    {open ? "Ocultar nota" : "Ver nota del entrenador"}
                    {open ? (
                        <ChevronUp className="size-3.5" aria-hidden />
                    ) : (
                        <ChevronDown className="size-3.5" aria-hidden />
                    )}
                </span>
            </button>
            {open ? <p className={ATHLETE_SESSION_EXERCISE_NOTES_BODY}>{notes}</p> : null}
        </div>
    );
};

const ExerciseRow: React.FC<{
    card: AthletePreviewExerciseCard;
    hasConflict: boolean;
    onInfo: (id: number, title: string) => void;
}> = ({ card, hasConflict, onInfo }) => {
    const [seriesOpen, setSeriesOpen] = useState(false);
    const infoExerciseId = card.exerciseIds.length === 1 ? card.exerciseIds[0] : null;
    const hasSeries = card.setLines.length > 0;

    return (
        <li
            className={
                hasConflict ? ATHLETE_SESSION_EXERCISE_ROW_FLAT_CAUTION : ATHLETE_SESSION_EXERCISE_ROW_FLAT
            }
        >
            {hasConflict ? (
                <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-warning"
                    aria-label="Precaución por lesión activa"
                />
            ) : null}
            <div className="flex min-w-0 flex-1 items-start gap-2">
                <div className="min-w-0 flex-1">
                    <span
                        className={
                            card.hasCompoundLayout
                                ? "block text-xs font-semibold uppercase tracking-wide text-primary/85"
                                : ATHLETE_SESSION_EXERCISE_NAME
                        }
                    >
                        {card.title}
                    </span>
                    <p className={ATHLETE_SESSION_EXERCISE_DETAIL}>{card.detail}</p>
                    {card.secondaryDetail ? (
                        <p className={ATHLETE_SESSION_EXERCISE_SECONDARY}>{card.secondaryDetail}</p>
                    ) : null}
                    {hasHumanTrainerNote(card.notes) ? (
                        <ExerciseNotes notes={formatTrainerNoteForAthlete(card.notes!)} />
                    ) : null}
                    {hasSeries ? (
                        <>
                            <button
                                type="button"
                                className={ATHLETE_SESSION_SERIES_TOGGLE}
                                aria-expanded={seriesOpen}
                                onClick={() => setSeriesOpen((v) => !v)}
                            >
                                {seriesOpen ? "Ocultar series" : "Ver series"}
                            </button>
                            {seriesOpen ? (
                                <div className="mt-2">
                                    <SetLinesTable lines={card.setLines} />
                                </div>
                            ) : null}
                        </>
                    ) : null}
                </div>
                {infoExerciseId != null ? (
                    <AthleteExercisePerformanceInfoButton
                        exerciseId={infoExerciseId}
                        exerciseTitle={card.title}
                        onOpen={onInfo}
                    />
                ) : null}
            </div>
        </li>
    );
};

const GroupSection: React.FC<{
    group: SessionExerciseGroupView;
    conflictByExerciseId: Map<number, unknown>;
    onInfo: (id: number, title: string) => void;
}> = ({ group, conflictByExerciseId, onInfo }) => {
    const kindLabel = GROUP_KIND_LABEL[group.kind];
    const cards = buildAthletePreviewExerciseCards(group);

    return (
        <div className="space-y-2">
            {kindLabel ? (
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/70">
                    {kindLabel}
                    {group.rounds != null && group.rounds > 0 ? ` · ${group.rounds} rondas` : null}
                    {group.timeCapMinutes != null ? ` · ${group.timeCapMinutes} min` : null}
                </p>
            ) : null}
            <ul className="space-y-0">
                {cards.map((card) => {
                    const hasConflict = card.exerciseIds.some((id) => conflictByExerciseId.has(id));
                    return (
                        <ExerciseRow
                            key={card.key}
                            card={card}
                            hasConflict={hasConflict}
                            onInfo={onInfo}
                        />
                    );
                })}
            </ul>
        </div>
    );
};

const BlockSection: React.FC<{
    block: SessionBlockView;
    blockIndex: number;
    blockCount: number;
    sessionHeadline: string | null | undefined;
    collapsible: boolean;
    defaultOpen: boolean;
    conflictByExerciseId: Map<number, unknown>;
    showConflictSummary: boolean;
    mobileConflictSummary: string | null;
    hasDangerConflict: boolean;
    conflictCount: number;
    onConsult: () => void;
    onInfo: (id: number, title: string) => void;
}> = ({
    block,
    blockIndex,
    blockCount,
    sessionHeadline,
    collapsible,
    defaultOpen,
    conflictByExerciseId,
    showConflictSummary,
    mobileConflictSummary,
    hasDangerConflict,
    conflictCount,
    onConsult,
    onInfo,
}) => {
    const [open, setOpen] = useState(defaultOpen);
    const panelId = useId();
    const exerciseCount = countExercisesInBlock(block);
    const blockTitle = getBlockDisplayName(block.blockTypeName);
    const showBlockTitle = shouldShowPrescriptionBlockTitle(
        blockTitle,
        sessionHeadline,
        blockCount
    );
    const isOpen = collapsible ? open : true;

    const titleRow = (
        <>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                {showBlockTitle ? (
                    <span className="text-sm font-semibold text-foreground">{blockTitle}</span>
                ) : null}
                <span className="text-xs text-muted-foreground">
                    {exerciseCount} {exerciseCount === 1 ? "ejercicio" : "ejercicios"}
                </span>
            </div>
            {blockIndex === 0 && showConflictSummary && conflictCount > 0 ? (
                <span className="text-caption font-medium text-warning">
                    {formatInjuryPrecautionCount(conflictCount)}
                </span>
            ) : null}
            {collapsible ? (
                open ? (
                    <ChevronUp className="size-5 shrink-0 text-primary/80" aria-hidden />
                ) : (
                    <ChevronDown className="size-5 shrink-0 text-primary/80" aria-hidden />
                )
            ) : null}
        </>
    );

    return (
        <section className={ATHLETE_SESSION_PREVIEW_BLOCK}>
            {blockIndex === 0 ? <NexiaGlassAccentRim /> : null}

            {collapsible ? (
                <button
                    type="button"
                    className={cn(ATHLETE_SESSION_BLOCK_SECTION_HEADER, "relative w-full")}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpen((v) => !v)}
                >
                    {titleRow}
                </button>
            ) : (
                <div className={cn(ATHLETE_SESSION_BLOCK_SECTION_HEADER_STATIC, "relative w-full")}>
                    {titleRow}
                </div>
            )}

            {isOpen ? (
                <div id={panelId} className={ATHLETE_SESSION_BLOCK_BODY}>
                    {blockIndex === 0 && showConflictSummary && mobileConflictSummary ? (
                        <AthleteInjuryCallout
                            message={mobileConflictSummary}
                            isDanger={hasDangerConflict}
                            onConsult={onConsult}
                        />
                    ) : null}
                    <div className="space-y-4">
                        {block.groups.map((group) => (
                            <GroupSection
                                key={group.groupId}
                                group={group}
                                conflictByExerciseId={conflictByExerciseId}
                                onInfo={onInfo}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    );
};

export interface AthleteSessionPrescriptionMapProps {
    blocks: SessionBlockView[];
    sessionHeadline?: string | null;
    conflictByExerciseId: Map<number, unknown>;
    conflictCount: number;
    showConflictSummary: boolean;
    mobileConflictSummary: string | null;
    hasDangerConflict: boolean;
    onConsult: () => void;
}

export const AthleteSessionPrescriptionMap: React.FC<AthleteSessionPrescriptionMapProps> = ({
    blocks,
    sessionHeadline,
    conflictByExerciseId,
    conflictCount,
    showConflictSummary,
    mobileConflictSummary,
    hasDangerConflict,
    onConsult,
}) => {
    const [infoExercise, setInfoExercise] = useState<{
        id: number;
        title: string;
    } | null>(null);

    const collapsible = blocks.length > 1;

    return (
        <>
            <div className="space-y-3">
                {blocks.map((block, blockIndex) => (
                    <BlockSection
                        key={block.blockId}
                        block={block}
                        blockIndex={blockIndex}
                        blockCount={blocks.length}
                        sessionHeadline={sessionHeadline}
                        collapsible={collapsible}
                        defaultOpen={blockIndex === 0}
                        conflictByExerciseId={conflictByExerciseId}
                        conflictCount={conflictCount}
                        showConflictSummary={showConflictSummary}
                        mobileConflictSummary={mobileConflictSummary}
                        hasDangerConflict={hasDangerConflict}
                        onConsult={onConsult}
                        onInfo={(id, title) => setInfoExercise({ id, title })}
                    />
                ))}
            </div>
            <AthleteExercisePerformanceInfoSheet
                isOpen={infoExercise != null}
                exerciseId={infoExercise?.id ?? null}
                exerciseTitle={infoExercise?.title ?? ""}
                onClose={() => setInfoExercise(null)}
            />
        </>
    );
};
