/**
 * CollapsibleFormGroup — Expandable sub-section inside a FormSection.
 *
 * Used for optional field groups like skinfolds, girths, and diameters
 * that can be collapsed to save space.
 *
 * @author Frontend Team
 * @since v7.0.0
 */

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CollapsibleFormGroupProps {
    title: string;
    badge?: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const CollapsibleFormGroup: React.FC<CollapsibleFormGroupProps> = ({
    title,
    badge,
    defaultOpen = false,
    children,
    className,
}) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={cn("border-t border-border pt-4", className)}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between py-1 text-left"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{title}</span>
                    {badge && (
                        <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                            {badge}
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        open && "rotate-180",
                    )}
                    aria-hidden
                />
            </button>
            {open && <div className="mt-4">{children}</div>}
        </div>
    );
};
