/**
 * FormSection — Card wrapper for form sections with icon header.
 *
 * Used in onboarding, client edit, and progress forms to group
 * related fields inside a titled card with a colored icon.
 *
 * @author Frontend Team
 * @since v7.0.0
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface FormSectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
    icon,
    title,
    children,
    className,
}) => (
    <section className={cn("rounded-xl border border-border bg-surface p-6", className)}>
        <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                {icon}
            </div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        {children}
    </section>
);
