/**
 * ConstructorRoundNavigator.tsx — Flechas prev/next de ronda en bloques parallel.
 * Hover alineado con InlineNumberInput (primary cyan del design system).
 */

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_BUTTON_BASE =
    "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const NAV_BUTTON_ENABLED =
    "text-foreground hover:bg-primary/10 hover:text-primary";

const NAV_BUTTON_DISABLED =
    "pointer-events-none text-muted-foreground/70 opacity-40";

export interface ConstructorRoundNavigatorProps {
    activeIndex: number;
    total: number;
    canGoBack: boolean;
    canGoForward: boolean;
    onPrevious: () => void;
    onNext: () => void;
    className?: string;
}

export const ConstructorRoundNavigator: React.FC<ConstructorRoundNavigatorProps> = ({
    activeIndex,
    total,
    canGoBack,
    canGoForward,
    onPrevious,
    onNext,
    className,
}) => {
    const currentRound = activeIndex + 1;

    return (
        <div className={cn("flex items-center justify-center gap-1.5 pb-2 pt-3", className)}>
            <button
                type="button"
                onClick={onPrevious}
                disabled={!canGoBack}
                className={cn(
                    NAV_BUTTON_BASE,
                    canGoBack ? NAV_BUTTON_ENABLED : NAV_BUTTON_DISABLED
                )}
                aria-label="Ronda anterior"
            >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            </button>
            <span className="text-[11px] font-medium tabular-nums">
                <span className="font-semibold text-primary" aria-current="step">
                    Ronda {currentRound}
                </span>{" "}
                <span className="text-foreground">de {total}</span>
            </span>
            <button
                type="button"
                onClick={onNext}
                disabled={!canGoForward}
                className={cn(
                    NAV_BUTTON_BASE,
                    canGoForward ? NAV_BUTTON_ENABLED : NAV_BUTTON_DISABLED
                )}
                aria-label="Ronda siguiente"
            >
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </button>
        </div>
    );
};
