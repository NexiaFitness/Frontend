/**
 * AthleteSettingsSection.tsx — Bloque con título de sección (V13 atleta).
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface AthleteSettingsSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export const AthleteSettingsSection: React.FC<AthleteSettingsSectionProps> = ({
    title,
    description,
    children,
    className,
}) => {
    return (
        <section className={cn("space-y-3", className)} aria-label={title}>
            <div className="space-y-1">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="overflow-hidden rounded-xl border border-border/80 bg-card/40">
                {children}
            </div>
        </section>
    );
};
