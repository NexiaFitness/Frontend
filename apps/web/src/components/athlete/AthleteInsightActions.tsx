/**
 * AthleteInsightActions.tsx — Enlaces profundos explícitos (descubribilidad).
 * Reutiliza filas V13 cuenta (AthleteSettingsRow + card §6.7).
 */

import React from "react";
import type { LucideIcon } from "lucide-react";
import { BarChart3, CheckCircle2, History, MessageCircle, Trophy } from "lucide-react";
import { AthleteSettingsRow } from "@/components/athlete/account/AthleteSettingsRow";
import { ATHLETE_SETTINGS_CARD } from "@/components/athlete/account/athleteSettingsPresentation";
import type { InsightDeepLink } from "@nexia/shared/utils/athlete/athleteInsightDeepLinks";
import { cn } from "@/lib/utils";

export interface AthleteInsightActionsProps {
    links: InsightDeepLink[];
    onLinkClick: (link: InsightDeepLink) => void;
    className?: string;
}

function iconForLink(link: InsightDeepLink): LucideIcon {
    switch (link.action) {
        case "progress":
            return BarChart3;
        case "progress_exercise":
            return Trophy;
        case "submit_session_feedback":
            return MessageCircle;
        case "view_session_feedback":
            return CheckCircle2;
        case "feedback_history":
            return link.id === "feedback-after-session" ? MessageCircle : History;
        default:
            return BarChart3;
    }
}

export const AthleteInsightActions: React.FC<AthleteInsightActionsProps> = ({
    links,
    onLinkClick,
    className,
}) => {
    if (links.length === 0) {
        return null;
    }

    return (
        <div className={cn(ATHLETE_SETTINGS_CARD, className)}>
            {links.map((link, index) => (
                <AthleteSettingsRow
                    key={link.id}
                    label={link.label}
                    hint={link.hint}
                    icon={iconForLink(link)}
                    onClick={() => onLinkClick(link)}
                    isLast={index === links.length - 1}
                />
            ))}
        </div>
    );
};
