/**
 * AthleteDashboardHeader.tsx — Saludo + campana feedback (V01 F2/F3b).
 */

import React from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AthleteDashboardHeaderProps {
    userName: string;
    subtitle: string;
    showFeedbackBadge?: boolean;
    onBellClick: () => void;
}

function displayFirstName(fullName: string): string {
    const trimmed = fullName.trim();
    if (!trimmed) return "Atleta";
    return trimmed.split(/\s+/)[0] ?? trimmed;
}

export const AthleteDashboardHeader: React.FC<AthleteDashboardHeaderProps> = ({
    userName,
    subtitle,
    showFeedbackBadge = false,
    onBellClick,
}) => {
    const firstName = displayFirstName(userName);

    return (
        <header className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
                <h1 className="text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-3xl">
                    Hola,{" "}
                    <span className="bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
                        {firstName}
                    </span>
                </h1>
                <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
            </div>
            <button
                type="button"
                onClick={onBellClick}
                className={cn(
                    "relative inline-flex min-h-touch-athlete min-w-touch-athlete shrink-0 items-center justify-center",
                    "rounded-full border border-border/80 bg-card/80 text-muted-foreground backdrop-blur-sm",
                    "transition-colors hover:border-primary/30 hover:bg-surface-2 hover:text-foreground active:bg-surface-2"
                )}
                aria-label={
                    showFeedbackBadge
                        ? "Respuesta nueva del entrenador — ver notas"
                        : "Ver notas y feedback"
                }
            >
                <Bell className="size-5" aria-hidden />
                {showFeedbackBadge && (
                    <span
                        className="absolute right-2 top-2 size-2 rounded-full bg-primary shadow-[0_0_8px] shadow-primary/60 ring-2 ring-card"
                        aria-hidden
                    />
                )}
            </button>
        </header>
    );
};
