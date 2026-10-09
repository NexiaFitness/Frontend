/**
 * AthleteSessionPrescriptionMap — Mapa de prescripción V04 (superficie plana, un acordeón de bloque).
 */

import React, { useId, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { AthleteExercisePerformanceInfoButton } from "@/components/athlete/sessions/AthleteExercisePerformanceInfoButton";
import { AthleteExercisePerformanceInfoSheet } from "@/components/athlete/sessions/AthleteExercisePerformanceInfoSheet";
import { AthleteInjuryCallout } from "@/components/athlete/AthleteInjuryCallout";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import {
    ATHLETE_SESSION_BLOCK_BODY,
    ATHLETE_SESSION_BLOCK_BODY_COMPACT,
    ATHLETE_SESSION_BLOCK_SECTION_HEADER,
    ATHLETE_SESSION_BLOCK_SECTION_HEADER_STATIC,
    ATHLETE_SESSION_EXERCISE_ACTIONS_DIVIDER,
    ATHLETE_SESSION_EXERCISE_DETAIL,
    ATHLETE_SESSION_EXERCISE_NAME,
    ATHLETE_SESSION_EXERCISE_ROW_BODY,
    ATHLETE_SESSION_EXERCISE_ROW_EXPAND,
    ATHLETE_SESSION_EXERCISE_ROW_FLAT,
    ATHLETE_SESSION_EXERCISE_ROW_FLAT_CAUTION,
    ATHLETE_SESSION_EXERCISE_ROW_HEAD,
    ATHLETE_SESSION_EXERCISE_SECONDARY,
    ATHLETE_SESSION_PRESCRIPTION_KIND_LABEL,
    ATHLETE_SESSION_PREVIEW_BLOCK,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import {
    AthletePrescriptionSeriesToggle,
    AthletePrescriptionTrainerNotes,
} from "@/components/athlete/sessions/AthletePrescriptionSetLinesTable";
import type { SessionBlockView } from "@nexia/shared/sessionProgramming/sessionBlockView";
import {
    getBlockDisplayName,
    type SessionExerciseGroupView,
    type SessionGroupKind,
} from "@nexia/shared/sessionProgramming/sessionBlockView";
import {
    buildAthletePreviewExerciseCards,
    countExercisesInBlock,
    type AthletePreviewExerciseCard,
} from "@nexia/shared/utils/athlete/athleteSessionPreviewUtils";
import { formatAthletePreviewGroupKindLabel } from "@nexia/shared/utils/athlete/athleteStrengthPrescriptionPresentation";
import { AthleteAmrapPrescriptionPanel } from "@/components/athlete/sessions/AthleteAmrapPrescriptionPanel";
import { AthleteEmomPrescriptionPanel } from "@/components/athlete/sessions/AthleteEmomPrescriptionPanel";
import { AthleteForTimePrescriptionPanel } from "@/components/athlete/sessions/AthleteForTimePrescriptionPanel";
import { formatInjuryPrecautionCount } from "@nexia/shared/utils/athlete/athleteInjuryAlertUtils";
import { hasHumanTrainerNote } from "@nexia/shared/utils/athlete/athleteSessionNotesUtils";
import { shouldShowPrescriptionBlockTitle } from "@nexia/shared/utils/athlete/athleteSessionPrescriptionMapUtils";
import { cn } from "@/lib/utils";

const ExerciseRow: React.FC<{
    card: AthletePreviewExerciseCard;
    groupKind: SessionGroupKind;
    hasConflict: boolean;
    onInfo: (id: number, title: string) => void;
}> = ({ card, groupKind, hasConflict, onInfo }) => {
    const infoExerciseId = card.exerciseIds.length === 1 ? card.exerciseIds[0] : null;
    const showTrainerNote = hasHumanTrainerNote(card.notes);

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
            <div className={ATHLETE_SESSION_EXERCISE_ROW_BODY}>
                <div className={ATHLETE_SESSION_EXERCISE_ROW_HEAD}>
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
                        {card.detail ? (
                            <p className={ATHLETE_SESSION_EXERCISE_DETAIL}>{card.detail}</p>
                        ) : null}
                        {card.secondaryDetail ? (
                            <p className={ATHLETE_SESSION_EXERCISE_SECONDARY}>{card.secondaryDetail}</p>
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
                <div className={ATHLETE_SESSION_EXERCISE_ROW_EXPAND}>
                    <AthletePrescriptionSeriesToggle groupKind={groupKind} lines={card.setLines} />
                    {showTrainerNote ? (
                        <>
                            <NexiaPremiumDivider
                                tone="glow"
                                className={ATHLETE_SESSION_EXERCISE_ACTIONS_DIVIDER}
                            />
                            <AthletePrescriptionTrainerNotes notes={card.notes} />
                        </>
                    ) : null}
                </div>
            </div>
        </li>
    );
};

const GroupSection: React.FC<{
    group: SessionExerciseGroupView;
    conflictByExerciseId: Map<number, unknown>;
    onInfo: (id: number, title: string) => void;
}> = ({ group, conflictByExerciseId, onInfo }) => {
    if (group.kind === "emom") {
        return (
            <AthleteEmomPrescriptionPanel
                group={group}
                conflictByExerciseId={conflictByExerciseId}
                onInfo={onInfo}
            />
        );
    }

    if (group.kind === "amrap") {
        return (
            <AthleteAmrapPrescriptionPanel
                group={group}
                conflictByExerciseId={conflictByExerciseId}
                onInfo={onInfo}
            />
        );
    }

    if (group.kind === "for_time") {
        return (
            <AthleteForTimePrescriptionPanel
                group={group}
                conflictByExerciseId={conflictByExerciseId}
                onInfo={onInfo}
            />
        );
    }

    const kindLabel = formatAthletePreviewGroupKindLabel(group.kind, group.rounds);
    const cards = buildAthletePreviewExerciseCards(group);

    return (
        <div className="space-y-1.5">
            {kindLabel ? (
                <p className={ATHLETE_SESSION_PRESCRIPTION_KIND_LABEL}>{kindLabel}</p>
            ) : null}
            <ul className="space-y-0">
                {cards.map((card) => {
                    const hasConflict = card.exerciseIds.some((id) => conflictByExerciseId.has(id));
                    return (
                        <ExerciseRow
                            key={card.key}
                            card={card}
                            groupKind={group.kind}
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
    /** Contador solo junto al nombre de bloque (multi-bloque); no repetir «1 ejercicio» si el H1 ya contextualiza. */
    const showBlockHeader = collapsible || showBlockTitle;

    const titleRow = (
        <>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                {showBlockTitle ? (
                    <span className="text-sm font-semibold text-foreground">{blockTitle}</span>
                ) : null}
                {showBlockTitle ? (
                    <span className="text-xs text-muted-foreground">
                        {exerciseCount} {exerciseCount === 1 ? "ejercicio" : "ejercicios"}
                    </span>
                ) : null}
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

            {showBlockHeader ? (
                collapsible ? (
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
                    <div
                        className={cn(ATHLETE_SESSION_BLOCK_SECTION_HEADER_STATIC, "relative w-full")}
                    >
                        {titleRow}
                    </div>
                )
            ) : null}

            {isOpen ? (
                <div
                    id={panelId}
                    className={
                        showBlockHeader
                            ? ATHLETE_SESSION_BLOCK_BODY
                            : ATHLETE_SESSION_BLOCK_BODY_COMPACT
                    }
                >
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
