/**
 * PostSessionHighlightsStrip.tsx — Highlights deterministas post-sesión.
 */

import React from "react";
import { CheckCircle2 } from "lucide-react";

export interface PostSessionHighlightsStripProps {
    highlights: string[];
}

export const PostSessionHighlightsStrip: React.FC<PostSessionHighlightsStripProps> = ({
    highlights,
}) => {
    if (highlights.length === 0) {
        return null;
    }

    return (
        <ul className="space-y-2" aria-label="Logros de la sesión">
            {highlights.map((line) => (
                <li
                    key={line}
                    className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-card/50 px-3.5 py-2.5 text-sm text-foreground backdrop-blur-sm"
                >
                    <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-success"
                        aria-hidden
                    />
                    <span>{line}</span>
                </li>
            ))}
        </ul>
    );
};
