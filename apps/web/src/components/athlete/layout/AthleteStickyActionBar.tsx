/**
 * AthleteStickyActionBar.tsx — CTA inferior fijo en ejecución gym.
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import { AthleteFixedFooter } from "./AthleteFixedFooter";
import type { AthleteStickyFooterSize } from "./athleteLayoutClasses";

export interface AthleteStickyActionBarProps {
    /** P1-8 — anclar CTA al borde inferior (sin offset de bottom nav). */
    dockToScreenBottom?: boolean;
    primaryLabel?: string;
    primaryDisabled?: boolean;
    primaryLoading?: boolean;
    onPrimary?: () => void;
    primaryClassName?: string;
    secondaryLabel?: string;
    secondaryDisabled?: boolean;
    secondaryLoading?: boolean;
    onSecondary?: () => void;
    /** Timer u otro accessory encima del CTA (§5a — no fixed, vive en la barra) */
    footerAccessory?: React.ReactNode;
}

export const AthleteStickyActionBar: React.FC<AthleteStickyActionBarProps> = ({
    dockToScreenBottom = false,
    primaryLabel,
    primaryDisabled,
    primaryLoading,
    onPrimary,
    primaryClassName,
    secondaryLabel,
    secondaryDisabled,
    secondaryLoading,
    onSecondary,
    footerAccessory,
}) => {
    const hasPrimary = Boolean(primaryLabel && onPrimary);
    const hasSecondary = Boolean(secondaryLabel && onSecondary);
    const size: AthleteStickyFooterSize =
        hasPrimary && hasSecondary
            ? footerAccessory
                ? "withSecondaryLink"
                : "double"
            : footerAccessory
              ? "withSecondaryLink"
              : "single";

    return (
        <AthleteFixedFooter size={size} dockToScreenBottom={dockToScreenBottom}>
            {footerAccessory ? (
                <div className="flex justify-center pb-1">{footerAccessory}</div>
            ) : null}
            {hasPrimary && (
                <Button
                    variant="primary"
                    className={cn(
                        "min-h-touch-athlete w-full active:scale-[0.98]",
                        primaryClassName
                    )}
                    disabled={primaryDisabled || primaryLoading}
                    onClick={onPrimary}
                >
                    {primaryLoading ? "Guardando…" : primaryLabel}
                </Button>
            )}
            {hasSecondary && (
                <Button
                    variant={hasPrimary ? "secondary" : "primary"}
                    className="min-h-touch-athlete w-full active:scale-[0.98]"
                    disabled={secondaryDisabled || secondaryLoading}
                    onClick={onSecondary}
                >
                    {secondaryLoading ? "Finalizando…" : secondaryLabel}
                </Button>
            )}
        </AthleteFixedFooter>
    );
};
