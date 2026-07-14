/**
 * BottomSheet.tsx — Panel deslizante desde abajo (portal atleta móvil).
 * Contexto: UX-FE-01, patrón SidePanel (backdrop, ESC, a11y).
 * Contratos: DESIGN_MOBILE §3.5, §6.7, agent.md
 */

import React, { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";
import { NEXIA_SCROLLBAR } from "@/components/ui/layout/scrollPresentation";
import {
    NEXIA_DIVIDER_GLOW,
    NEXIA_DIVIDER_GLOW_BAND,
} from "@/components/ui/surface/nexiaDividerPresentation";

export interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    /** Pie fijo con blur — CTA separado del scroll */
    footer?: React.ReactNode;
}

const SHEET_MOTION =
    "animate-in slide-in-from-bottom fade-in duration-300 motion-reduce:animate-none [animation-timing-function:cubic-bezier(0.32,0.72,0,1)]";

const BACKDROP_MOTION =
    "animate-in fade-in duration-300 motion-reduce:animate-none";

export const BottomSheet: React.FC<BottomSheetProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
}) => {
    const titleId = useId();
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "hidden";
            sheetRef.current?.focus();
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/65 backdrop-blur-[3px]",
                    BACKDROP_MOTION
                )}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={sheetRef}
                tabIndex={-1}
                className={cn(
                    "fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col",
                    "rounded-t-[1.35rem] border-t border-border/70",
                    "bg-gradient-to-b from-card/98 via-card/94 to-background/95 backdrop-blur-xl",
                    "shadow-[0_-20px_60px_-16px] shadow-black/55",
                    SHEET_MOTION
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden rounded-t-[1.35rem]">
                    <div className={NEXIA_DIVIDER_GLOW_BAND} aria-hidden />
                    <div className={cn("absolute inset-x-3 top-0", NEXIA_DIVIDER_GLOW)} aria-hidden />
                </div>

                <div className="flex shrink-0 flex-col items-center px-5 pb-3 pt-3">
                    <div
                        className="mb-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/35"
                        aria-hidden
                    />
                    <div className="w-full space-y-1">
                        <h2
                            id={titleId}
                            className="text-base font-semibold tracking-tight text-foreground"
                        >
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                </div>

                <div
                    className={cn(
                        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5",
                        NEXIA_SCROLLBAR,
                        footer ? "pb-3" : "pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
                    )}
                >
                    {children}
                </div>

                {footer && (
                    <div
                        className={cn(
                            "relative shrink-0 border-t border-border/50 px-5 pt-4",
                            "pb-[calc(1.25rem+env(safe-area-inset-bottom))]",
                            "bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/55",
                            "shadow-[0_-12px_32px_-12px] shadow-black/35"
                        )}
                    >
                        <div
                            className="pointer-events-none absolute -top-6 inset-x-0 h-6 bg-gradient-to-t from-background/80 to-transparent"
                            aria-hidden
                        />
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
};
