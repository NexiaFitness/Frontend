/**
 * PostSessionHighlightsStrip.tsx — Highlights deterministas post-sesión.
 */

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { POST_SESSION_HIGHLIGHT_ITEM } from "./postSessionPresentation";

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
                <li key={line} className={POST_SESSION_HIGHLIGHT_ITEM}>
                    <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-primary/85"
                        aria-hidden
                    />
                    <span>{line}</span>
                </li>
            ))}
        </ul>
    );
};
