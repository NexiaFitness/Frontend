/**
 * PatternSelectorPopover.tsx — Popover de selección de patrones de movimiento.
 *
 * - placement="portal": fixed + portal (modal legacy).
 * - placement="inline": panel debajo del día en el constructor (sin empujar otros días).
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { MovementPattern } from "@nexia/shared/types/exercise";

import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";

import { PatternSelectorPanelBody } from "./PatternSelectorPanelBody";

const GAP_PX = 8;
const VIEWPORT_PAD_PX = 12;
const BOTTOM_MARGIN_PX = 20;
const MODAL_CONTENT_INSET_PX = 12;
const MODAL_FOOTER_RESERVE_PX = 88;
const POPOVER_MAX_HEIGHT_PX = 320;
const MIN_WIDTH_PX = 280;

export type PatternSelectorPlacement = "portal" | "inline";

type PopoverCoords = {
    top: number;
    left: number;
    width: number;
    maxHeight: number;
};

export interface PatternSelectorPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    catalog: MovementPattern[];
    catalogLoading?: boolean;
    catalogError?: boolean;
    selectedPatternIds: number[];
    onToggle: (patternId: number) => void;
    anchorRef: React.RefObject<HTMLElement | null>;
    alignRef: React.RefObject<HTMLElement | null>;
    placement?: PatternSelectorPlacement;
    /** Inline: botón «Listo» (por defecto onClose). */
    onDone?: () => void;
    className?: string;
}

function clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
}

function getModalContentRect(anchor: HTMLElement): DOMRect | null {
    const modal = anchor.closest('[role="dialog"]');
    if (!modal) return null;
    const content = modal.querySelector<HTMLElement>(":scope > div");
    return content?.getBoundingClientRect() ?? modal.getBoundingClientRect();
}

export const PatternSelectorPopover: React.FC<PatternSelectorPopoverProps> = ({
    isOpen,
    onClose,
    catalog,
    catalogLoading,
    catalogError,
    selectedPatternIds,
    onToggle,
    anchorRef,
    alignRef,
    placement = "portal",
    onDone,
    className,
}) => {
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const [coords, setCoords] = React.useState<PopoverCoords>({
        top: 0,
        left: 0,
        width: MIN_WIDTH_PX,
        maxHeight: POPOVER_MAX_HEIGHT_PX,
    });

    const updatePopoverPosition = useCallback(() => {
        const anchor = anchorRef.current;
        const align = alignRef.current ?? anchor;
        if (!anchor || !align) return;

        const anchorRect = anchor.getBoundingClientRect();
        const alignRect = align.getBoundingClientRect();
        const modal = anchor.closest('[role="dialog"]');
        const modalRect = modal?.getBoundingClientRect();
        const contentRect = getModalContentRect(anchor);

        const belowTop = anchorRect.bottom + GAP_PX;
        let maxBottom = window.innerHeight - VIEWPORT_PAD_PX - BOTTOM_MARGIN_PX;
        if (modalRect) {
            maxBottom = Math.min(
                maxBottom,
                modalRect.bottom - MODAL_FOOTER_RESERVE_PX - BOTTOM_MARGIN_PX,
            );
        }

        const spaceBelow = maxBottom - belowTop;
        const spaceAbove = anchorRect.top - VIEWPORT_PAD_PX;
        const preferBelow = spaceBelow >= Math.min(140, spaceAbove);
        const rawMax = preferBelow ? spaceBelow : spaceAbove - GAP_PX;
        const maxHeight = Math.min(
            POPOVER_MAX_HEIGHT_PX,
            Math.max(120, rawMax),
        );
        const top = preferBelow
            ? belowTop
            : Math.max(VIEWPORT_PAD_PX, anchorRect.top - GAP_PX - maxHeight);

        let left: number;
        let width: number;
        if (contentRect) {
            left = contentRect.left + MODAL_CONTENT_INSET_PX;
            width = contentRect.width - MODAL_CONTENT_INSET_PX * 2;
        } else {
            left = alignRect.left;
            width = alignRect.width;
        }
        width = clamp(
            width,
            MIN_WIDTH_PX,
            window.innerWidth - VIEWPORT_PAD_PX * 2,
        );
        left = clamp(
            left,
            VIEWPORT_PAD_PX,
            window.innerWidth - width - VIEWPORT_PAD_PX,
        );

        setCoords({ top, left, width, maxHeight });
    }, [anchorRef, alignRef]);

    useLayoutEffect(() => {
        if (!isOpen || placement !== "portal") return;
        updatePopoverPosition();
        const onReposition = () => updatePopoverPosition();
        window.addEventListener("resize", onReposition);
        window.addEventListener("scroll", onReposition, true);
        return () => {
            window.removeEventListener("resize", onReposition);
            window.removeEventListener("scroll", onReposition, true);
        };
    }, [isOpen, placement, updatePopoverPosition]);

    useEffect(() => {
        if (!isOpen || placement !== "portal") return;
        const handler = (e: PointerEvent) => {
            const t = e.target as Node;
            if (anchorRef.current?.contains(t)) return;
            if (popoverRef.current?.contains(t)) return;
            onClose();
        };
        document.addEventListener("pointerdown", handler);
        return () => document.removeEventListener("pointerdown", handler);
    }, [isOpen, placement, onClose, anchorRef]);

    if (!isOpen) return null;

    const handleDone = onDone ?? onClose;

    if (placement === "inline") {
        return (
            <div
                className={cn(
                    "border-t border-border/60 mt-2 pt-2",
                    className,
                )}
                role="dialog"
                aria-label="Seleccionar patrones de movimiento"
            >
                <PatternSelectorPanelBody
                    density="compact"
                    catalog={catalog}
                    catalogLoading={catalogLoading}
                    catalogError={catalogError}
                    selectedPatternIds={selectedPatternIds}
                    onToggle={onToggle}
                    className="px-0.5"
                />
                <div className="flex justify-end pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDone}
                    >
                        Listo ✓
                    </Button>
                </div>
            </div>
        );
    }

    if (typeof document === "undefined") return null;

    const panelClass = cn(
        "fixed z-[200] rounded-lg border border-border bg-surface-2/95 backdrop-blur-sm shadow-2xl p-3",
        className,
    );

    return createPortal(
        <div
            ref={popoverRef}
            role="dialog"
            className={panelClass}
            style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
                maxHeight: coords.maxHeight + 12,
            }}
        >
            <div
                className="overflow-y-auto scrollbar-primary space-y-2.5 px-2 py-1"
                style={{ maxHeight: coords.maxHeight }}
            >
                <PatternSelectorPanelBody
                    catalog={catalog}
                    catalogLoading={catalogLoading}
                    catalogError={catalogError}
                    selectedPatternIds={selectedPatternIds}
                    onToggle={onToggle}
                />
            </div>
        </div>,
        document.body,
    );
};
