/**
 * AthleteEmptyStateIllustration.tsx — Decoración SVG por variante (sin assets externos).
 */

import React from "react";
import { Calendar, ClipboardList, MessageSquare, TrendingUp } from "lucide-react";
import type { AthleteEmptyStateVariant } from "./athleteEmptyStatePresentation";
import {
    ATHLETE_EMPTY_STATE_ART,
    ATHLETE_EMPTY_STATE_ICON_WRAP,
} from "./athleteEmptyStatePresentation";
import { cn } from "@/lib/utils";

const ICONS: Record<AthleteEmptyStateVariant, typeof MessageSquare> = {
    feedback: MessageSquare,
    sessions: Calendar,
    plan: ClipboardList,
    progress: TrendingUp,
};

export interface AthleteEmptyStateIllustrationProps {
    variant: AthleteEmptyStateVariant;
    className?: string;
}

export const AthleteEmptyStateIllustration: React.FC<AthleteEmptyStateIllustrationProps> = ({
    variant,
    className,
}) => {
    const Icon = ICONS[variant];

    return (
        <div className={cn(ATHLETE_EMPTY_STATE_ART, className)} aria-hidden>
            <svg
                className="absolute inset-0 h-full w-full text-primary/20"
                viewBox="0 0 176 88"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="44" cy="44" r="36" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="132" cy="44" r="36" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
                <path
                    d="M80 44h16"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="3 5"
                />
            </svg>
            <div className={ATHLETE_EMPTY_STATE_ICON_WRAP}>
                <Icon className="size-7" strokeWidth={1.75} />
            </div>
        </div>
    );
};
