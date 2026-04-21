/**
 * InlineNumberInput.tsx — Input number compacto con botones Up/Down custom
 *
 * Diseñado para inputs number muy estrechos en tablas, grids y constructores
 * donde el componente Input (con wrapper w-full y label) no encaja.
 * Los botones usan tokens primary de Nexia Sparkle Flow.
 *
 * @author Frontend Team
 * @since v8.1.0
 */

import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type InlineNumberSize = "xs" | "compact" | "sm" | "md" | "lg";

interface InlineNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    size?: InlineNumberSize;
    className?: string;
}

const sizeStyles: Record<InlineNumberSize, string> = {
    compact: "h-7 px-1.5 py-1 pr-3.5 text-[11px] rounded-md border border-border/60 bg-surface",
    xs: "h-8 px-2 py-1.5 pr-4 text-xs rounded-md border border-border/60 bg-surface",
    sm: "h-9 px-2 py-1.5 pr-5 text-sm rounded-md border border-input bg-background",
    md: "h-10 px-2.5 py-2 pr-6 text-sm rounded-md border border-input bg-background sm:text-base",
    lg: "h-12 px-3 py-2.5 pr-7 text-base rounded-md border border-input bg-background",
};

const btnSizeStyles: Record<InlineNumberSize, string> = {
    compact: "w-3",
    xs: "w-3.5",
    sm: "w-4",
    md: "w-4",
    lg: "w-5",
};

const iconSizeStyles: Record<InlineNumberSize, string> = {
    compact: "h-2 w-2",
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-3 w-3",
    lg: "h-4 w-4",
};

export const InlineNumberInput = forwardRef<HTMLInputElement, InlineNumberInputProps>(
    ({ size = "sm", className, ...props }, ref) => {
        const innerRef = useRef<HTMLInputElement>(null);
        useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

        const handleStepUp = () => innerRef.current?.stepUp();
        const handleStepDown = () => innerRef.current?.stepDown();

        return (
            <div className={cn("relative inline-flex", className)}>
                <input
                    ref={innerRef}
                    type="number"
                    className={cn(
                        "block w-full rounded-md border text-foreground transition-colors placeholder:text-muted-foreground caret-primary focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 text-center",
                        sizeStyles[size],
                        "nexia-no-native-spinners"
                    )}
                    {...props}
                />
                <div
                    className={cn(
                        "absolute inset-y-0 right-0 flex flex-col overflow-hidden rounded-r-md border-l border-border/40",
                        btnSizeStyles[size]
                    )}
                >
                    <button
                        type="button"
                        onClick={handleStepUp}
                        className="flex flex-1 items-center justify-center text-muted-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                        aria-label="Incrementar"
                    >
                        <ChevronUp className={iconSizeStyles[size]} aria-hidden />
                    </button>
                    <button
                        type="button"
                        onClick={handleStepDown}
                        className="flex flex-1 items-center justify-center border-t border-border/40 text-muted-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                        aria-label="Decrementar"
                    >
                        <ChevronDown className={iconSizeStyles[size]} aria-hidden />
                    </button>
                </div>
            </div>
        );
    }
);

InlineNumberInput.displayName = "InlineNumberInput";
