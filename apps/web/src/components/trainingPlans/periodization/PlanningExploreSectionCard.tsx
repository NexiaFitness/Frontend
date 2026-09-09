/**
 * PlanningExploreSectionCard — Sección premium colapsable (análisis · ejecución · hitos).
 */

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    PLANNING_EXPLORE_SECTION_BODY,
    PLANNING_EXPLORE_SECTION_BODY_DIVIDER,
    PLANNING_EXPLORE_SECTION_BODY_DIVIDER_WRAP,
    PLANNING_EXPLORE_SECTION_CHEVRON,
    PLANNING_EXPLORE_SECTION_COLLAPSED,
    PLANNING_EXPLORE_SECTION_DESCRIPTION,
    PLANNING_EXPLORE_SECTION_EXPANDED,
    PLANNING_EXPLORE_SECTION_HEADER,
    PLANNING_EXPLORE_SECTION_HEADER_EXPANDED,
    PLANNING_EXPLORE_SECTION_TITLE,
} from "./planningShellPresentation";

export type PlanningExploreSectionCardProps = {
    title: string;
    description?: string;
    testId?: string;
    id?: string;
    className?: string;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
};

export const PlanningExploreSectionCard: React.FC<PlanningExploreSectionCardProps> = ({
    title,
    description,
    testId,
    id,
    className,
    defaultOpen = false,
    open: openProp,
    onOpenChange,
    children,
}) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = openProp !== undefined;
    const isExpanded = isControlled ? openProp : internalOpen;

    const setExpanded = (next: boolean) => {
        if (!isControlled) {
            setInternalOpen(next);
        }
        onOpenChange?.(next);
    };

    return (
        <article
            id={id}
            className={cn(
                isExpanded
                    ? PLANNING_EXPLORE_SECTION_EXPANDED
                    : PLANNING_EXPLORE_SECTION_COLLAPSED,
                className,
            )}
            data-testid={testId}
        >
            {isExpanded ? <NexiaGlassAccentRim /> : null}
            <button
                type="button"
                onClick={() => setExpanded(!isExpanded)}
                className={cn(
                    isExpanded
                        ? PLANNING_EXPLORE_SECTION_HEADER_EXPANDED
                        : PLANNING_EXPLORE_SECTION_HEADER,
                )}
                aria-expanded={isExpanded}
            >
                <span className="min-w-0 flex-1">
                    <span className={PLANNING_EXPLORE_SECTION_TITLE}>{title}</span>
                    {description ? (
                        <p className={PLANNING_EXPLORE_SECTION_DESCRIPTION}>
                            {description}
                        </p>
                    ) : null}
                </span>
                <ChevronDown
                    className={cn(
                        PLANNING_EXPLORE_SECTION_CHEVRON,
                        isExpanded && "rotate-180",
                    )}
                    aria-hidden
                />
            </button>
            {isExpanded ? (
                <>
                    <div className={PLANNING_EXPLORE_SECTION_BODY_DIVIDER_WRAP}>
                        <div
                            className={PLANNING_EXPLORE_SECTION_BODY_DIVIDER}
                            aria-hidden
                        />
                    </div>
                    <div className={PLANNING_EXPLORE_SECTION_BODY}>{children}</div>
                </>
            ) : null}
        </article>
    );
};
