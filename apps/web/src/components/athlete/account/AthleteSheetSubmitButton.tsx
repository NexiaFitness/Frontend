/**
 * AthleteSheetSubmitButton.tsx — CTA fijo premium en footer de BottomSheet.
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";

export interface AthleteSheetSubmitButtonProps {
    form: string;
    label: string;
    loadingLabel: string;
    isLoading?: boolean;
    disabled?: boolean;
}

export const AthleteSheetSubmitButton: React.FC<AthleteSheetSubmitButtonProps> = ({
    form,
    label,
    loadingLabel,
    isLoading = false,
    disabled = false,
}) => {
    return (
        <Button
            type="submit"
            form={form}
            variant="primary"
            isLoading={isLoading}
            disabled={disabled || isLoading}
            className={cn(
                "min-h-touch-athlete w-full text-base font-semibold",
                "shadow-[0_8px_28px_-10px] shadow-primary/35",
                "motion-safe:active:scale-[0.98] motion-reduce:active:scale-100"
            )}
        >
            {isLoading ? loadingLabel : label}
        </Button>
    );
};
