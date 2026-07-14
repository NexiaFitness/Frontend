/**
 * AthleteFixedFooter.tsx — CTA fijo sobre bottom nav con spacer de scroll.
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_CHROME_BAR_TOP_DIVIDER,
    ATHLETE_STICKY_FOOTER_BAR,
    ATHLETE_STICKY_FOOTER_SPACER,
    type AthleteStickyFooterSize,
} from "./athleteLayoutClasses";

export interface AthleteFixedFooterProps {
    size?: AthleteStickyFooterSize;
    /** Reserva scroll vía spacer externo; false si el contenedor ya usa ATHLETE_STICKY_FOOTER_CONTENT_PB. */
    scrollSpacer?: boolean;
    className?: string;
    children: React.ReactNode;
}

export const AthleteFixedFooter: React.FC<AthleteFixedFooterProps> = ({
    size = "single",
    scrollSpacer = true,
    className,
    children,
}) => {
    return (
        <>
            {scrollSpacer && (
                <div
                    className={cn("shrink-0 lg:hidden", ATHLETE_STICKY_FOOTER_SPACER[size])}
                    aria-hidden
                />
            )}
            <div className={cn(ATHLETE_STICKY_FOOTER_BAR, className)}>
                <div className={cn(ATHLETE_CHROME_BAR_TOP_DIVIDER, "lg:hidden")} aria-hidden />
                {children}
            </div>
        </>
    );
};
