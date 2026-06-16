/**
 * AthleteFixedFooter.tsx — CTA fijo sobre bottom nav con spacer de scroll.
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_STICKY_FOOTER_BAR,
    ATHLETE_STICKY_FOOTER_SPACER,
    type AthleteStickyFooterSize,
} from "./athleteLayoutClasses";

export interface AthleteFixedFooterProps {
    size?: AthleteStickyFooterSize;
    className?: string;
    children: React.ReactNode;
}

export const AthleteFixedFooter: React.FC<AthleteFixedFooterProps> = ({
    size = "single",
    className,
    children,
}) => {
    return (
        <>
            <div className={cn("shrink-0 lg:hidden", ATHLETE_STICKY_FOOTER_SPACER[size])} aria-hidden />
            <div className={cn(ATHLETE_STICKY_FOOTER_BAR, className)}>{children}</div>
        </>
    );
};
