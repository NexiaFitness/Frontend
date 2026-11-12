/**
 * WeekAccordionHeader.tsx — Cabecera del acordeón de semana (Ver semanas).
 *
 * Superficie: fila. El botón de expandir y «Restaurar semana tipo» son hermanos;
 * no se anida un button dentro de otro (misma regla que PeriodBlockCard).
 */

import React from "react";
import { ChevronDown } from "lucide-react";

import type { WeekStructureKind } from "@nexia/shared";

import { cn } from "@/lib/utils";

import {
    WEEK_ACCORDION_HEADER_COLLAPSED_CLASS,
    WEEK_ACCORDION_HEADER_EXPANDED_CLASS,
    WEEK_ACCORDION_HEADER_ROW_CLASS,
    WEEK_ACCORDION_RESTORE_BTN_CLASS,
    WEEK_ACCORDION_TOGGLE_BTN_CLASS,
    WEEK_KIND_BADGE_CLASS,
    WEEK_KIND_LABEL_ES,
} from "./phaseConstructorPresentation";

export interface WeekAccordionHeaderProps {
    weekOrdinal: number;
    weekRange: string;
    configured: number;
    total: number;
    isExpanded: boolean;
    weekKind?: WeekStructureKind;
    showRestore: boolean;
    onToggle: () => void;
    onRestore?: () => void;
}

export const WeekAccordionHeader: React.FC<WeekAccordionHeaderProps> = ({
    weekOrdinal,
    weekRange,
    configured,
    total,
    isExpanded,
    weekKind,
    showRestore,
    onToggle,
    onRestore,
}) => (
    <div
        className={cn(
            WEEK_ACCORDION_HEADER_ROW_CLASS,
            isExpanded
                ? WEEK_ACCORDION_HEADER_EXPANDED_CLASS
                : WEEK_ACCORDION_HEADER_COLLAPSED_CLASS,
        )}
    >
        <button
            type="button"
            onClick={onToggle}
            className={WEEK_ACCORDION_TOGGLE_BTN_CLASS}
            aria-expanded={isExpanded}
        >
            <ChevronDown
                className={cn(
                    "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
                    isExpanded ? "" : "-rotate-90",
                )}
                aria-hidden
            />
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary text-[10px] font-semibold shrink-0">
                S{weekOrdinal}
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">
                        Semana {weekOrdinal}
                    </p>
                    {weekKind && weekOrdinal !== 1 && (
                        <span
                            className={cn(
                                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
                                WEEK_KIND_BADGE_CLASS[weekKind],
                            )}
                        >
                            {WEEK_KIND_LABEL_ES[weekKind]}
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    {weekRange}
                    {" · "}
                    <span className="tabular-nums">
                        {configured}/{total} días
                    </span>
                </p>
            </div>
        </button>
        {showRestore && onRestore ? (
            <button
                type="button"
                className={WEEK_ACCORDION_RESTORE_BTN_CLASS}
                onClick={onRestore}
                aria-label={`Restaurar semana tipo de la semana ${weekOrdinal}`}
            >
                Restaurar semana tipo
            </button>
        ) : null}
    </div>
);
