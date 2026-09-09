/**
 * PatternSelectorPopover.tsx — Popover portal para selección de patrones por día.
 */

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { MovementPattern } from "@nexia/shared/types/exercise";

import { cn } from "@/lib/utils";

import { PatternSelectorPanel } from "./PatternSelectorPanel";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    catalog: MovementPattern[];
    catalogLoading?: boolean;
    catalogError?: boolean;
    selectedPatternIds: readonly number[];
    onToggle: (patternId: number) => void;
    anchorRef?: React.RefObject<HTMLElement | null>;
    className?: string;
}

export const PatternSelectorPopover: React.FC<Props> = ({
    isOpen,
    onClose,
    catalog,
    catalogLoading,
    catalogError,
    selectedPatternIds,
    onToggle,
    anchorRef,
    className,
}) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (panelRef.current?.contains(target)) return;
            if (anchorRef?.current?.contains(target)) return;
            onClose();
        };
        document.addEventListener("click", handleClickOutside, true);
        return () =>
            document.removeEventListener("click", handleClickOutside, true);
    }, [isOpen, onClose, anchorRef]);

    if (!isOpen) return null;

    const content = (
        <div
            ref={panelRef}
            className={cn(
                "z-[120] w-[min(100vw-2rem,22rem)] rounded-lg border border-border bg-surface p-3 shadow-lg",
                "max-h-64 overflow-y-auto scrollbar-primary",
                className,
            )}
            role="dialog"
            aria-label="Seleccionar patrones"
        >
            <PatternSelectorPanel
                catalog={catalog}
                catalogLoading={catalogLoading}
                catalogError={catalogError}
                selectedPatternIds={selectedPatternIds}
                onToggle={onToggle}
            />
        </div>
    );

    if (anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        return createPortal(
            <div
                style={{
                    position: "fixed",
                    top: rect.bottom + 4,
                    left: Math.min(rect.left, window.innerWidth - 360),
                    maxWidth: "calc(100vw - 1rem)",
                }}
            >
                {content}
            </div>,
            document.body,
        );
    }

    return content;
};
