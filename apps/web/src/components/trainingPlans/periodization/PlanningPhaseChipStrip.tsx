/**
 * PlanningPhaseChipStrip.tsx — Navegación por fases en modo explore (F5).
 */

import React from "react";
import { Plus } from "lucide-react";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import { formatPhaseChipLabel } from "./planningShellUtils";
import {
    PLANNING_ADD_PHASE_CHIP_CLASS,
    PLANNING_CHIP_STRIP_CLASS,
    planningPhaseChipClass,
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
    <div
        className={PLANNING_CHIP_STRIP_CLASS}
        data-testid="planning-phase-chip-strip"
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
                    className={planningPhaseChipClass(selected)}
                    onClick={() => onSelectBlock(block.id)}
                >
                    {formatPhaseChipLabel(block, index)}
                </button>
            );
        })}
        <button
            type="button"
            className={PLANNING_ADD_PHASE_CHIP_CLASS}
            data-testid="planning-add-phase"
            onClick={onAddPhase}
        >
            <Plus className="mr-1 inline size-3.5" aria-hidden />
            Añadir fase
        </button>
    </div>
);
