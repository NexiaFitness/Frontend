/**
 * AthleteRunChromeHeader.tsx — Top bar /run (P1-8): salida, progreso, menú ⋯.
 */

import React from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_CHROME_BAR,
    ATHLETE_CHROME_BAR_TOP_DIVIDER,
} from "@/components/athlete/layout/athleteLayoutClasses";
import { AthleteProgressBar } from "@/components/athlete/AthleteProgressBar";
import { ATHLETE_RUN_STEP_CAPTION } from "./athleteRunPresentation";

export interface AthleteRunChromeHeaderProps {
    sessionName: string;
    step: number;
    totalSteps: number;
    onExit: () => void;
    onOpenMenu: () => void;
    className?: string;
}

export const AthleteRunChromeHeader: React.FC<AthleteRunChromeHeaderProps> = ({
    sessionName,
    step,
    totalSteps,
    onExit,
    onOpenMenu,
    className,
}) => {
    const progress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;

    return (
        <header
            className={cn(
                ATHLETE_CHROME_BAR,
                "sticky top-0 z-20 -mx-4 mb-3 px-4 pb-3 pt-1 lg:static lg:mx-0 lg:rounded-xl lg:px-4",
                className
            )}
        >
            <div className={ATHLETE_CHROME_BAR_TOP_DIVIDER} aria-hidden />
            <div className="flex items-center gap-2 pt-2">
                <button
                    type="button"
                    onClick={onExit}
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary motion-safe:active:scale-[0.98]"
                    aria-label="Salir del entrenamiento guiado"
                >
                    <ArrowLeft className="size-5" aria-hidden />
                </button>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{sessionName}</p>
                    <p className={ATHLETE_RUN_STEP_CAPTION}>
                        Paso {step + 1} / {totalSteps}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onOpenMenu}
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-surface-2/40 text-foreground motion-safe:active:scale-[0.98]"
                    aria-label="Opciones de sesión"
                >
                    <MoreVertical className="size-5" aria-hidden />
                </button>
            </div>
            <AthleteProgressBar
                value={progress}
                tone="primary"
                className="mt-2"
                aria-label={`Progreso de sesión ${step + 1} de ${totalSteps}`}
            />
        </header>
    );
};
