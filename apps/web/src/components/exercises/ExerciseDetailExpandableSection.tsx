/**
 * ExerciseDetailExpandableSection.tsx — Sección colapsable premium (planificación / contenido).
 *
 * Design: docs/design/01_PREMIUM_PLATFORM_MIGRATION.md
 */

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    EXERCISE_DETAIL_COLLAPSIBLE,
    EXERCISE_DETAIL_COLLAPSIBLE_BADGE,
    EXERCISE_DETAIL_COLLAPSIBLE_BODY,
    EXERCISE_DETAIL_COLLAPSIBLE_CHEVRON,
    EXERCISE_DETAIL_COLLAPSIBLE_TITLE,
    EXERCISE_DETAIL_COLLAPSIBLE_TRIGGER,
} from "@/components/exercises/exerciseDetailPresentation";

export interface ExerciseDetailExpandableSectionProps {
    id: string;
    title: string;
    badge?: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

export const ExerciseDetailExpandableSection: React.FC<ExerciseDetailExpandableSectionProps> = ({
    id,
    title,
    badge,
    defaultOpen = false,
    children,
}) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <section aria-labelledby={id} className={EXERCISE_DETAIL_COLLAPSIBLE}>
            <button
                type="button"
                id={id}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={EXERCISE_DETAIL_COLLAPSIBLE_TRIGGER}
            >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className={EXERCISE_DETAIL_COLLAPSIBLE_TITLE}>{title}</span>
                    {badge ? (
                        <span className={EXERCISE_DETAIL_COLLAPSIBLE_BADGE}>{badge}</span>
                    ) : null}
                </div>
                <ChevronDown
                    className={cn(EXERCISE_DETAIL_COLLAPSIBLE_CHEVRON, open && "rotate-180")}
                    aria-hidden
                />
            </button>
            {open ? <div className={EXERCISE_DETAIL_COLLAPSIBLE_BODY}>{children}</div> : null}
        </section>
    );
};
