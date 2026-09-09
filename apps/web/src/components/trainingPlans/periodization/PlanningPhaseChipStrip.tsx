/**
 * PlanningPhaseChipStrip.tsx — Navegación por fases en modo explore (F5).
 */

import React from "react";
import { Plus } from "lucide-react";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import { formatPhaseChipLabel } from "./planningShellUtils";
import {
    PLANNING_ADD_PHASE_NAV_ITEM,
    PLANNING_PHASE_NAV_SCROLL,
    PLANNING_PHASE_NAV_SHELL,
    PLANNING_PHASE_NAV_TRACK,
    planningPhaseNavItemClass,
} from "./planningShellPresentation";

interface Props {
    blocks: PlanPeriodBlock[];
    selectedBlockId: number | null;
    onSelectBlock: (blockId: number) => void;
    onAddPhase: () => void;
}

export const PlanningPhaseChipStrip: React.FC<Props> = ({
    blocks,
    selectedBlockId,
    onSelectBlock,
    onAddPhase,
}) => (
    <div className={PLANNING_PHASE_NAV_SHELL} data-testid="planning-phase-chip-strip">
        <div className={PLANNING_PHASE_NAV_SCROLL}>
            <div
                className={PLANNING_PHASE_NAV_TRACK}
                role="tablist"
                aria-label="Fases del programa"
            >
                {blocks.map((block, index) => {
                    const selected = block.id === selectedBlockId;
                    return (
                        <button
                            key={block.id}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            className={planningPhaseNavItemClass(selected)}
                            onClick={() => onSelectBlock(block.id)}
                        >
                            {formatPhaseChipLabel(block, index)}
                        </button>
                    );
                })}
                <button
                    type="button"
                    className={PLANNING_ADD_PHASE_NAV_ITEM}
                    data-testid="planning-add-phase"
                    onClick={onAddPhase}
                >
                    <Plus className="mr-1 inline size-3.5" aria-hidden />
                    Añadir fase
                </button>
            </div>
        </div>
    </div>
);
