/**
 * AthleteInsightActions.tsx — Enlaces profundos explícitos (descubribilidad).
 */

import React from "react";
import { ChevronRight } from "lucide-react";
import type { InsightDeepLink } from "@nexia/shared/utils/athlete/athleteInsightDeepLinks";

export interface AthleteInsightActionsProps {
    links: InsightDeepLink[];
    onLinkClick: (link: InsightDeepLink) => void;
}

export const AthleteInsightActions: React.FC<AthleteInsightActionsProps> = ({
    links,
    onLinkClick,
}) => {
    if (links.length === 0) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border/80 bg-card/30">
            {links.map((link, index) => (
                <button
                    key={link.id}
                    type="button"
                    onClick={() => onLinkClick(link)}
                    className={`flex min-h-touch-athlete w-full items-center gap-3 px-3 text-left transition-colors hover:bg-surface-2 active:bg-surface-2 ${
                        index < links.length - 1 ? "border-b border-border/60" : ""
                    }`}
                >
                    <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">
                            {link.label}
                        </span>
                        <span className="block text-caption text-muted-foreground">
                            {link.hint}
                        </span>
                    </span>
                    <ChevronRight
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden
                    />
                </button>
            ))}
        </div>
    );
};
