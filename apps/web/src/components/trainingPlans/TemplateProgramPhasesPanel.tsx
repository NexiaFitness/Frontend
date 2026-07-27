/**
 * TemplateProgramPhasesPanel — Fases de periodización (secundario, colapsable).
 */

import React, { useState } from "react";
import { CalendarRange, Pencil, Plus, Trash2 } from "lucide-react";
import type { TemplateProgramBlock } from "@nexia/shared/types/templateProgram";
import { Button } from "@/components/ui/buttons";
import { SliderLevelBadge } from "@/components/trainingPlans/periodization/SliderLevelBadge";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { labelTrainingGoal } from "@nexia/shared";
import {
    TEMPLATE_EDITOR_COPY,
    TEMPLATE_EDITOR_DETAILS,
    TEMPLATE_EDITOR_DETAILS_BODY,
    TEMPLATE_EDITOR_DETAILS_HELPER,
    TEMPLATE_EDITOR_DETAILS_SUBTITLE,
    TEMPLATE_EDITOR_DETAILS_SUMMARY,
    TEMPLATE_EDITOR_DETAILS_TOGGLE,
    TEMPLATE_EDITOR_PHASE_ACTIONS,
    TEMPLATE_EDITOR_PHASE_BADGES,
    TEMPLATE_EDITOR_PHASE_CARD,
    TEMPLATE_EDITOR_PHASE_LIST,
    TEMPLATE_EDITOR_PHASE_META,
    TEMPLATE_EDITOR_PHASE_TITLE,
    TEMPLATE_EDITOR_SECTION_EYEBROW,
    displayTemplatePhaseTitle,
} from "./templateEditorPresentation";

export interface TemplateProgramPhasesPanelProps {
    blocks: TemplateProgramBlock[];
    isArchived: boolean;
    defaultOpen?: boolean;
    onAddPhase: () => void;
    onEditPhase: (block: TemplateProgramBlock) => void;
    onDeletePhase: (block: TemplateProgramBlock) => void;
    onOpenWeeklyDays: (blockId: number) => void;
}

export const TemplateProgramPhasesPanel: React.FC<TemplateProgramPhasesPanelProps> = ({
    blocks,
    isArchived,
    defaultOpen = false,
    onAddPhase,
    onEditPhase,
    onDeletePhase,
    onOpenWeeklyDays,
}) => {
    const [open, setOpen] = useState(defaultOpen || blocks.length === 0);

    return (
        <details
            className={TEMPLATE_EDITOR_DETAILS}
            open={open}
            onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
        >
            <summary className={TEMPLATE_EDITOR_DETAILS_SUMMARY}>
                <span>
                    <span className={TEMPLATE_EDITOR_SECTION_EYEBROW}>
                        {TEMPLATE_EDITOR_COPY.phasesTitle}
                    </span>
                    <span className={TEMPLATE_EDITOR_DETAILS_SUBTITLE}>
                        {blocks.length === 0
                            ? TEMPLATE_EDITOR_COPY.phasesHint
                            : `${blocks.length} fase${blocks.length === 1 ? "" : "s"}`}
                    </span>
                </span>
                <span className={TEMPLATE_EDITOR_DETAILS_TOGGLE}>
                    {open ? TEMPLATE_EDITOR_COPY.phasesHide : TEMPLATE_EDITOR_COPY.phasesToggle}
                </span>
            </summary>

            <div className={TEMPLATE_EDITOR_DETAILS_BODY}>
                {!isArchived ? (
                    <Button variant="outline" size="sm" onClick={onAddPhase}>
                        <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                        {TEMPLATE_EDITOR_COPY.addPhase}
                    </Button>
                ) : null}

                {blocks.length === 0 ? (
                    <p className={TEMPLATE_EDITOR_DETAILS_HELPER}>
                        {TEMPLATE_EDITOR_COPY.phasesEmptyHelper}
                    </p>
                ) : (
                    <ul className={TEMPLATE_EDITOR_PHASE_LIST}>
                        {blocks.map((block) => (
                            <li key={block.id} className={TEMPLATE_EDITOR_PHASE_CARD}>
                                <NexiaGlassAccentRim />
                                <p className={TEMPLATE_EDITOR_PHASE_TITLE}>
                                    {displayTemplatePhaseTitle(block)}
                                </p>
                                <p className={TEMPLATE_EDITOR_PHASE_META}>
                                    Semanas {block.program_week_start}–{block.program_week_end}
                                    {block.goal
                                        ? ` · ${labelTrainingGoal(block.goal)}`
                                        : null}
                                </p>
                                <div className={TEMPLATE_EDITOR_PHASE_BADGES}>
                                    <SliderLevelBadge
                                        level={block.volume_level}
                                        tone="volume"
                                        prefix="Volumen"
                                    />
                                    <SliderLevelBadge
                                        level={block.intensity_level}
                                        tone="intensity"
                                        prefix="Intensidad"
                                    />
                                </div>
                                <div className={TEMPLATE_EDITOR_PHASE_ACTIONS}>
                                    <Button
                                        variant="ghost-primary"
                                        size="sm"
                                        onClick={() => onOpenWeeklyDays(block.id)}
                                    >
                                        <CalendarRange className="mr-1.5 h-4 w-4" aria-hidden />
                                        {TEMPLATE_EDITOR_COPY.weeklyDaysLink}
                                    </Button>
                                    {!isArchived ? (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEditPhase(block)}
                                                aria-label={TEMPLATE_EDITOR_COPY.editPhase}
                                            >
                                                <Pencil className="mr-1 h-4 w-4" aria-hidden />
                                                {TEMPLATE_EDITOR_COPY.editPhase}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => onDeletePhase(block)}
                                                aria-label={TEMPLATE_EDITOR_COPY.deletePhase}
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                                                {TEMPLATE_EDITOR_COPY.deletePhase}
                                            </Button>
                                        </>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </details>
    );
};
