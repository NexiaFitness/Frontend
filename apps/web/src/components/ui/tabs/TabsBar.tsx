/**
 * TabsBar.tsx — Barra segmentada premium reutilizable (atleta + entrenador + admin).
 *
 * Patrón canónico: shell glass → scroll con gutter → track flex (NEXIA_SEGMENTED_*).
 * Usos: tabs de ficha cliente, conmutadores Sesiones/Plantillas, filtros V02 atleta.
 *
 * `distribute="content"` — ítems al ancho del label + scroll (7 tabs cliente).
 * `distribute="equal"` — ítems repartidos en fila (filtros atleta, 2 tabs).
 *
 * Doc: design/platform/04_REGISTRY_CODIGO_FUENTE.md · platformPremiumPresentation.ts
 *
 * @author Frontend Team
 * @since v6.x
 * @updated 2026-07-21 — underline legacy eliminado; diseño unificado plataforma
 */

import React from "react";
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
}

export interface TabsBarProps {
    items: TabsBarItem[];
    value: string;
    onChange: (id: string) => void;
    ariaLabel?: string;
    className?: string;
    /** equal = reparto en fila; content = ancho por label + scroll horizontal */
    distribute?: NexiaSegmentedDistribute;
}

export const TabsBar: React.FC<TabsBarProps> = ({
    items,
    value,
    onChange,
    ariaLabel = "Tabs",
    className,
    distribute = "content",
}) => {
    return (
        <nav className={cn(NEXIA_SEGMENTED_SHELL, className)} aria-label={ariaLabel}>
            <div
                className={NEXIA_SEGMENTED_SCROLL}
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                <div className={nexiaSegmentedTrackClass(distribute)} role="tablist">
                    {items.map((tab) => {
                        const isActive = value === tab.id;
                        const isDisabled = tab.disabled;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                onClick={() => !isDisabled && onChange(tab.id)}
                                disabled={isDisabled}
                                aria-selected={isActive}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    nexiaSegmentedItemClass(isActive, distribute),
                                    isDisabled && "cursor-not-allowed opacity-50"
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
