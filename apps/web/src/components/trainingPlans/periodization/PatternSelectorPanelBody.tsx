import React, { useMemo } from "react";

import type { MovementPattern } from "@nexia/shared/types/exercise";

import { cn } from "@/lib/utils";

import { PatternBadge } from "./PatternBadge";
import { groupPatternsByUiBucket } from "./patternSelectorGrouping";

export type PatternSelectorPanelDensity = "default" | "compact";

export interface PatternSelectorPanelBodyProps {
    catalog: MovementPattern[];
    catalogLoading?: boolean;
    catalogError?: boolean;
    selectedPatternIds: number[];
    onToggle: (patternId: number) => void;
    /** compact: constructor inline (sin scroll, chips pequeños). */
    density?: PatternSelectorPanelDensity;
    className?: string;
}

export const PatternSelectorPanelBody: React.FC<PatternSelectorPanelBodyProps> = ({
    catalog,
    catalogLoading,
    catalogError,
    selectedPatternIds,
    onToggle,
    density = "default",
    className,
}) => {
    const isCompact = density === "compact";
    const groupedPatterns = useMemo(
        () => groupPatternsByUiBucket(catalog),
        [catalog],
    );

    return (
        <div className={className}>
            {catalogLoading && (
                <p className="text-xs text-muted-foreground text-center py-2">
                    Cargando…
                </p>
            )}
            {catalogError && (
                <p className="text-xs text-destructive text-center py-2">
                    Error al cargar patrones
                </p>
            )}
            {!catalogLoading &&
                !catalogError &&
                groupedPatterns.map((group) => (
                    <div
                        key={group.bucket}
                        className={cn(isCompact && "mb-3 last:mb-0")}
                    >
                        <p
                            className={cn(
                                "font-semibold uppercase text-muted-foreground px-0.5",
                                isCompact
                                    ? "mb-1.5 text-[10px] tracking-[0.06em]"
                                    : "mb-1.5 text-[10px] tracking-wider",
                            )}
                        >
                            {group.label}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {group.patterns.map((p) => {
                                const active = selectedPatternIds.includes(p.id);
                                return (
                                    <PatternBadge
                                        key={p.id}
                                        name={p.name_es || p.name_en}
                                        uiBucket={p.ui_bucket}
                                        active={active}
                                        onClick={() => onToggle(p.id)}
                                        className={
                                            isCompact
                                                ? "px-[6px] py-[2px] text-[11px] leading-tight"
                                                : undefined
                                        }
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
        </div>
    );
};
