/**
 * BlockAuthoringStepper.tsx — Stepper premium 5 pasos (D-PAP).
 */

import React from "react";

import { cn } from "@/lib/utils";

import {
    BLOCK_AUTHOR_STEP_LABELS,
    BLOCK_AUTHOR_STEP_ORDER,
    blockAuthorStepIndex,
    type BlockAuthorStep,
} from "./blockAuthoringModel";
import {
    AUTHORING_STEPPER_SCROLL_CLASS,
    AUTHORING_STEPPER_SHELL_CLASS,
    AUTHORING_STEPPER_TRACK_CLASS,
    authoringStepperItemClass,
} from "./phaseAuthoringPresentation";

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

    return (
        <nav
            aria-label="Pasos de la fase"
            className={AUTHORING_STEPPER_SHELL_CLASS}
        >
            <div className={AUTHORING_STEPPER_SCROLL_CLASS}>
                <div
                    className={cn(AUTHORING_STEPPER_TRACK_CLASS, "min-w-max")}
                    role="tablist"
                >
                    {BLOCK_AUTHOR_STEP_ORDER.map((step, index) => {
                        const reachable = isStepReachable(step);
                        const isActive = step === activeStep;
                        const isCompleted = index < activeIdx || index <= maxIdx;
                        return (
                            <button
                                key={step}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-current={isActive ? "step" : undefined}
                                disabled={!reachable}
                                onClick={() => reachable && onStepClick(step)}
                                className={cn(
                                    authoringStepperItemClass(isActive, isCompleted),
                                    !reachable && "pointer-events-none opacity-45",
                                )}
                            >
                                <span className="tabular-nums">{index + 1}.</span>{" "}
                                {BLOCK_AUTHOR_STEP_LABELS[step]}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
