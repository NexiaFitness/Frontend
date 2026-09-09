/**
 * BlockAuthoringStepBody.tsx — Columna premium del cuerpo del wizard D-PAP.
 *
 * Un solo punto de max-width + tipografía de paso. No usar en constructor legacy.
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    AUTHORING_STEP_BODY_STACK_CLASS,
    AUTHORING_STEP_HINT_CLASS,
    AUTHORING_STEP_QUESTION_CLASS,
    AUTHORING_STEP_STATUS_HINT_CLASS,
    AUTHORING_WIZARD_COLUMN_CLASS,
} from "./phaseAuthoringPresentation";

interface Props {
    title: string;
    hint?: string;
    statusHint?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const BlockAuthoringStepBody: React.FC<Props> = ({
    title,
    hint,
    statusHint,
    children,
    className,
}) => (
    <div
        className={cn(AUTHORING_WIZARD_COLUMN_CLASS, className)}
        data-testid="block-authoring-step-body"
    >
        <div className={AUTHORING_STEP_BODY_STACK_CLASS}>
            <header className="space-y-2 md:space-y-3">
                <h3 className={AUTHORING_STEP_QUESTION_CLASS}>{title}</h3>
                {hint ? (
                    <p className={AUTHORING_STEP_HINT_CLASS}>{hint}</p>
                ) : null}
            </header>

            {statusHint ? (
                <p className={AUTHORING_STEP_STATUS_HINT_CLASS}>{statusHint}</p>
            ) : null}

            <div className="min-w-0">{children}</div>
        </div>
    </div>
);
