/**
 * AthleteFixedFooter.tsx — CTA fijo sobre bottom nav con spacer de scroll.
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_CHROME_BAR_TOP_DIVIDER,
    ATHLETE_RUN_STICKY_FOOTER_BAR,
    ATHLETE_RUN_STICKY_FOOTER_SPACER,
    ATHLETE_STICKY_FOOTER_BAR,
    ATHLETE_STICKY_FOOTER_SPACER,
    type AthleteStickyFooterSize,
} from "./athleteLayoutClasses";

export interface AthleteFixedFooterProps {
    size?: AthleteStickyFooterSize;
    /** Reserva scroll vía spacer externo; false si el contenedor ya usa ATHLETE_STICKY_FOOTER_CONTENT_PB. */
    scrollSpacer?: boolean;
    /** P1-8 — /run sin bottom nav: CTA al borde inferior de pantalla. */
    dockToScreenBottom?: boolean;
    className?: string;
    children: React.ReactNode;
}

export const AthleteFixedFooter: React.FC<AthleteFixedFooterProps> = ({
    size = "single",
    scrollSpacer = true,
    dockToScreenBottom = false,
    className,
    children,
}) => {
    const barClass = dockToScreenBottom ? ATHLETE_RUN_STICKY_FOOTER_BAR : ATHLETE_STICKY_FOOTER_BAR;
    const spacerMap = dockToScreenBottom
        ? ATHLETE_RUN_STICKY_FOOTER_SPACER
        : ATHLETE_STICKY_FOOTER_SPACER;

    return (
        <>
            {scrollSpacer && (
                <div
                    className={cn("shrink-0 lg:hidden", spacerMap[size])}
                    aria-hidden
                />
            )}
            <div className={cn(barClass, className)}>
                <div className={cn(ATHLETE_CHROME_BAR_TOP_DIVIDER, "lg:hidden")} aria-hidden />
                {children}
            </div>
        </>
    );
};
