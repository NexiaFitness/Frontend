/**
 * AthleteStickyActionBar.tsx — CTA inferior fijo en ejecución gym.
 */

import React from "react";
import { Button } from "@/components/ui/buttons";

export interface AthleteStickyActionBarProps {
    primaryLabel: string;
    primaryDisabled?: boolean;
    primaryLoading?: boolean;
    onPrimary: () => void;
    secondaryLabel?: string;
    secondaryDisabled?: boolean;
    secondaryLoading?: boolean;
    onSecondary?: () => void;
}

export const AthleteStickyActionBar: React.FC<AthleteStickyActionBarProps> = ({
    primaryLabel,
    primaryDisabled,
    primaryLoading,
    onPrimary,
    secondaryLabel,
    secondaryDisabled,
    secondaryLoading,
    onSecondary,
}) => {
    return (
        <div className="fixed inset-x-0 bottom-16 z-30 space-y-2 border-t border-border bg-background/95 p-4">
            <Button
                variant="primary"
                className="min-h-touch-athlete w-full active:scale-[0.98]"
                disabled={primaryDisabled || primaryLoading}
                onClick={onPrimary}
            >
                {primaryLoading ? "Guardando…" : primaryLabel}
            </Button>
            {secondaryLabel && onSecondary && (
                <Button
                    variant="secondary"
                    className="min-h-touch-athlete w-full"
                    disabled={secondaryDisabled || secondaryLoading}
                    onClick={onSecondary}
                >
                    {secondaryLoading ? "Finalizando…" : secondaryLabel}
                </Button>
            )}
        </div>
    );
};
