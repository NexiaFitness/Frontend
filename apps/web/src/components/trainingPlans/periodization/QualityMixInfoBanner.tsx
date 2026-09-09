/**
 * QualityMixInfoBanner — Banner informativo copy F4.2 (no bloquea guardado).
 */

import React from "react";
import { cn } from "@/lib/utils";

interface Props {
    title: string;
    body: string;
    className?: string;
}

export const QualityMixInfoBanner: React.FC<Props> = ({
    title,
    body,
    className,
}) => (
    <div
        className={cn(
            "rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-left",
            className,
        )}
        role="note"
    >
        <p className="text-[11px] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {body}
        </p>
    </div>
);
