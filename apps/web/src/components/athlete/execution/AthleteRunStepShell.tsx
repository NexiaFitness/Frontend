/**
 * AthleteRunStepShell.tsx — Wrapper V05: contenido + chip + sticky (§5a).
 */

import React from "react";
import { AthleteRestTimerChip } from "./AthleteRestTimerChip";
import { AthleteStickyActionBar } from "@/components/athlete/layout/AthleteStickyActionBar";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import { ATHLETE_RUN_STICKY_GLOW } from "./athleteRunPresentation";
import { cn } from "@/lib/utils";

export interface AthleteRunStepShellProps {
    children: React.ReactNode;
    showRestChip?: boolean;
    remainingSeconds?: number;
    stickyPrimaryLabel?: string;
    stickyPrimaryDisabled?: boolean;
    stickyPrimaryLoading?: boolean;
    onStickyPrimary?: () => void;
    stickyPrimaryGlow?: boolean;
    secondaryLabel?: string;
    secondaryDisabled?: boolean;
    secondaryLoading?: boolean;
    onSecondary?: () => void;
}

export const AthleteRunStepShell: React.FC<AthleteRunStepShellProps> = ({
    children,
    showRestChip = false,
    remainingSeconds = 0,
    stickyPrimaryLabel,
    stickyPrimaryDisabled,
    stickyPrimaryLoading,
    onStickyPrimary,
    stickyPrimaryGlow = false,
    secondaryLabel,
    secondaryDisabled,
    secondaryLoading,
    onSecondary,
}) => {
    return (
        <>
            <div className="flex-1">{children}</div>

            <AthleteStickyActionBar
                footerAccessory={
                    showRestChip ? (
                        <AthleteRestTimerChip remainingSeconds={remainingSeconds} />
                    ) : undefined
                }
                primaryLabel={stickyPrimaryLabel}
                primaryDisabled={stickyPrimaryDisabled}
                primaryLoading={stickyPrimaryLoading}
                onPrimary={onStickyPrimary}
                primaryClassName={cn(
                    ATHLETE_PRIMARY_CTA,
                    stickyPrimaryGlow && ATHLETE_RUN_STICKY_GLOW
                )}
                secondaryLabel={secondaryLabel}
                secondaryDisabled={secondaryDisabled}
                secondaryLoading={secondaryLoading}
                onSecondary={onSecondary}
            />
        </>
    );
};
