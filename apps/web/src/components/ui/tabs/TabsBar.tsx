/**
 * TabsBar.tsx — Barra de pestañas horizontal reutilizable
 *
 * Estilo: contenedor flex, gap-1, overflow-x-auto, border-b border-border, pb-px.
 * Cada botón: whitespace-nowrap, px-4 py-2.5, text-sm font-medium, transition-colors,
 * border-b-2 -mb-px. Activo: border-primary text-primary.
 * Inactivo: border-transparent text-muted-foreground hover:text-foreground.
 * Icono opcional por item (gap-2); sin contenedor tipo “segmented”.
 *
 * @author Frontend Team
 * @since v6.x
 */

import React from "react";
import { cn } from "@/lib/utils";

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
}

export const TabsBar: React.FC<TabsBarProps> = ({
    items,
    value,
    onChange,
    ariaLabel = "Tabs",
    className,
}) => {
    return (
        <nav
            className={cn(
                "flex gap-1 overflow-x-auto border-b border-border pb-px",
                "[&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/70",
                className
            )}
            aria-label={ariaLabel}
            style={{ WebkitOverflowScrolling: "touch" }}
        >
            {items.map((tab) => {
                const isActive = value === tab.id;
                const isDisabled = tab.disabled;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => !isDisabled && onChange(tab.id)}
                        disabled={isDisabled}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                            "flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px",
                            isActive && "border-primary text-primary",
                            !isActive && "border-transparent text-muted-foreground hover:text-foreground",
                            isDisabled && "cursor-not-allowed opacity-50"
                        )}
                    >
                        {tab.icon ? <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4">{tab.icon}</span> : null}
                        {tab.label}
                    </button>
                );
            })}
        </nav>
    );
};
