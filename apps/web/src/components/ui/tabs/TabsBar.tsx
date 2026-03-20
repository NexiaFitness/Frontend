/**
 * TabsBar.tsx — Barra de pestañas horizontal reutilizable
 *
 * Especificación: contenedor flex, gap-1, overflow-x-auto, border-b border-border, pb-px.
 * Cada botón: flex items-center gap-2, whitespace-nowrap, px-4 py-2.5, text-sm font-medium,
 * transition-colors, border-b-2 -mb-px. Activo: border-primary text-primary.
 * Inactivo: border-transparent text-muted-foreground hover:text-foreground.
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
    badge?: number;
    disabled?: boolean;
}

export interface TabsBarProps {
    /** Lista de pestañas */
    items: TabsBarItem[];
    /** Id de la pestaña activa */
    value: string;
    /** Callback al seleccionar una pestaña */
    onChange: (id: string) => void;
    /** aria-label del nav (accesibilidad) */
    ariaLabel?: string;
    /** Clases adicionales para el contenedor */
    className?: string;
    /** Variante visual */
    variant?: "underline" | "segmented";
}

export const TabsBar: React.FC<TabsBarProps> = ({
    items,
    value,
    onChange,
    ariaLabel = "Tabs",
    className,
    variant = "underline",
}) => {
    const activeIndex = Math.max(
        0,
        items.findIndex((tab) => tab.id === value)
    );

    if (variant === "segmented") {
        const itemCount = Math.max(1, items.length);

        return (
            <nav className={cn("flex items-center gap-3", className)} aria-label={ariaLabel}>
                <div className="relative flex rounded-xl border border-border/60 bg-card p-1">
                    <div
                        className="absolute inset-y-1 rounded-lg border border-primary/25 bg-surface-2 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.3)] transition-all duration-300 ease-out"
                        style={{
                            width: `calc((100% - 8px) / ${itemCount})`,
                            left: `calc(4px + ${activeIndex} * ((100% - 8px) / ${itemCount}))`,
                        }}
                        aria-hidden
                    />
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
                                    "relative z-10 flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-colors duration-200",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground",
                                    isDisabled && "cursor-not-allowed opacity-50"
                                )}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {typeof tab.badge === "number" && (
                                    <span
                                        className={cn(
                                            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums",
                                            isActive
                                                ? "bg-primary/15 text-primary"
                                                : "bg-surface-2 text-muted-foreground"
                                        )}
                                    >
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        );
    }

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
                            "flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px",
                            isActive && "border-primary text-primary",
                            !isActive && "border-transparent text-muted-foreground hover:text-foreground",
                            isDisabled && "cursor-not-allowed opacity-50"
                        )}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </nav>
    );
};
