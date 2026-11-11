/**
 * TabsBar.tsx — Barra segmentada premium reutilizable (atleta + entrenador + admin).
 *
 * Patrón canónico: shell glass → scroll → track flex (NEXIA_SEGMENTED_*).
 * Indicador activo: solo pill (NEXIA_SEGMENTED_ITEM_SELECTED). Scrollbar oculto
 * para no leerse como segunda barra bajo la pestaña.
 * Al cambiar `value`, centra el ítem activo en el scroll (móvil).
 *
 * Doc: design/platform/04_REGISTRY_CODIGO_FUENTE.md · platformPremiumPresentation.ts
 *
 * @author Frontend Team
 * @since v6.x
 * @updated v9.2.3 — scrollIntoView activo; sin doble indicador scrollbar
 */

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
    NEXIA_SEGMENTED_SCROLL,
    NEXIA_SEGMENTED_SHELL,
    nexiaSegmentedItemClass,
    nexiaSegmentedTrackClass,
    type NexiaSegmentedDistribute,
} from "@/components/ui/surface/platformPremiumPresentation";

export interface TabsBarItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    /** Wizard: paso ya visitado (estilo secundario cuando no está activo). */
    completed?: boolean;
}

export interface TabsBarProps {
    items: TabsBarItem[];
    value: string;
    onChange: (id: string) => void;
    ariaLabel?: string;
    className?: string;
    /** equal = reparto en fila; content = ancho por label + scroll horizontal */
    distribute?: NexiaSegmentedDistribute;
    /** Valor ARIA del ítem activo — `step` en wizards multi-paso. */
    activeAriaCurrent?: "page" | "step";
}

function centerTabInScroller(tab: HTMLElement, scroller: HTMLElement) {
    const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const tabCenter = tab.offsetLeft + tab.offsetWidth / 2;
    let target = tabCenter - scroller.clientWidth / 2;
    // Extremos: alinear al borde para no dejar media etiqueta visible.
    if (target <= 8) target = 0;
    else if (target >= max - 8) target = max;
    scroller.scrollTo({
        left: Math.min(Math.max(0, target), max),
        behavior: "smooth",
    });
}

export const TabsBar: React.FC<TabsBarProps> = ({
    items,
    value,
    onChange,
    ariaLabel = "Tabs",
    className,
    distribute = "content",
    activeAriaCurrent = "page",
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const tab = activeRef.current;
        const scroller = scrollRef.current;
        if (!tab || !scroller) return;
        if (typeof scroller.scrollTo !== "function") return;
        centerTabInScroller(tab, scroller);
    }, [value]);

    return (
        <nav className={cn(NEXIA_SEGMENTED_SHELL, className)} aria-label={ariaLabel}>
            <div
                ref={scrollRef}
                className={NEXIA_SEGMENTED_SCROLL}
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                <div
                    className={nexiaSegmentedTrackClass(distribute)}
                    role="tablist"
                    aria-label={ariaLabel}
                >
                    {items.map((tab) => {
                        const isActive = value === tab.id;
                        const isDisabled = tab.disabled;

                        return (
                            <button
                                key={tab.id}
                                ref={isActive ? activeRef : undefined}
                                type="button"
                                role="tab"
                                onClick={() => !isDisabled && onChange(tab.id)}
                                disabled={isDisabled}
                                aria-selected={isActive}
                                aria-current={
                                    isActive ? activeAriaCurrent : undefined
                                }
                                className={cn(
                                    nexiaSegmentedItemClass(isActive, distribute),
                                    !isActive &&
                                        tab.completed &&
                                        "text-foreground/80",
                                    isDisabled &&
                                        "pointer-events-none cursor-not-allowed opacity-45",
                                )}
                            >
                                {tab.icon ? (
                                    <span className="shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5">
                                        {tab.icon}
                                    </span>
                                ) : null}
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
