/**
 * BlockAuthoringStepper.tsx — Stepper wizard D-PAP (5 pasos).
 * Delega render en TabsBar; lógica de dominio en blockAuthoringModel.
 */

import React, { useMemo } from "react";

import { TabsBar } from "@/components/ui/tabs";

import {
    BLOCK_AUTHOR_STEP_LABELS,
    BLOCK_AUTHOR_STEP_ORDER,
    blockAuthorStepIndex,
    type BlockAuthorStep,
} from "./blockAuthoringModel";

interface Props {
    activeStep: BlockAuthorStep;
    maxReachedStep: BlockAuthorStep;
    onStepClick: (step: BlockAuthorStep) => void;
    isStepReachable: (step: BlockAuthorStep) => boolean;
}

export const BlockAuthoringStepper: React.FC<Props> = ({
    activeStep,
    maxReachedStep,
    onStepClick,
    isStepReachable,
}) => {
    const activeIdx = blockAuthorStepIndex(activeStep);
    const maxIdx = blockAuthorStepIndex(maxReachedStep);

    const items = useMemo(
        () =>
            BLOCK_AUTHOR_STEP_ORDER.map((step, index) => ({
                id: step,
                label: `${index + 1}. ${BLOCK_AUTHOR_STEP_LABELS[step]}`,
                disabled: !isStepReachable(step),
                completed: index < activeIdx || index <= maxIdx,
            })),
        [activeIdx, maxIdx, isStepReachable],
    );

    return (
        <TabsBar
            items={items}
            value={activeStep}
            onChange={(stepId) => onStepClick(stepId as BlockAuthorStep)}
            ariaLabel="Pasos de la fase"
            distribute="content"
            activeAriaCurrent="step"
        />
    );
};
