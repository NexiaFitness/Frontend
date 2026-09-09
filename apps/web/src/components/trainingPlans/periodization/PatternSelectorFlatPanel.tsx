/**
 * PatternSelectorFlatPanel.tsx — Catálogo completo en un scroll (sin tabs, wizard D-PAP).
 */

import React, { useMemo } from "react";

import type { MovementPattern } from "@nexia/shared/types/exercise";

import { LoadingSpinner } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

import {
    BLOCK_PATTERN_PICKER_CATALOG_CLASS,
    BLOCK_PATTERN_PICKER_CHIP_CLASS,
    BLOCK_PATTERN_PICKER_CHIP_ROW_CLASS,
    BLOCK_PATTERN_PICKER_SECTION_CLASS,
    BLOCK_PATTERN_PICKER_SECTION_LABEL_CLASS,
    patternPickerSectionPanelClass,
} from "./blockPatternPickerPresentation";
import { PatternBadge } from "./PatternBadge";
import { groupPatternsByUiBucket } from "./patternSelectorGrouping";

interface Props {
    catalog: MovementPattern[];
    catalogLoading?: boolean;
    catalogError?: boolean;
    selectedPatternIds: readonly number[];
    onToggle: (patternId: number) => void;
    className?: string;
}

function patternDisplayName(pattern: MovementPattern): string {
    return pattern.name_es?.trim() || pattern.name_en;
}

export const PatternSelectorFlatPanel: React.FC<Props> = ({
    catalog,
    catalogLoading,
    catalogError,
    selectedPatternIds,
    onToggle,
    className,
}) => {
    const selectedSet = useMemo(
        () => new Set(selectedPatternIds),
        [selectedPatternIds],
    );

    const grouped = useMemo(
        () => groupPatternsByUiBucket(catalog),
        [catalog],
    );

    if (catalogLoading) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center py-12",
                    className,
                )}
            >
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (catalogError) {
        return (
            <p className={cn("py-6 text-center text-sm text-destructive", className)}>
                No se pudo cargar el catálogo de patrones.
            </p>
        );
    }

    if (catalog.length === 0) {
        return (
            <p
                className={cn(
                    "py-6 text-center text-sm text-muted-foreground",
                    className,
                )}
            >
                No hay patrones disponibles.
            </p>
        );
    }

    return (
        <div className={cn(BLOCK_PATTERN_PICKER_CATALOG_CLASS, className)}>
            {grouped.map((group) => (
                <section
                    key={group.bucket}
                    className={cn(
                        BLOCK_PATTERN_PICKER_SECTION_CLASS,
                        patternPickerSectionPanelClass(group.bucket),
                    )}
                    aria-label={group.label}
                >
                    <p className={BLOCK_PATTERN_PICKER_SECTION_LABEL_CLASS}>
                        {group.label}
                    </p>
                    <div className={BLOCK_PATTERN_PICKER_CHIP_ROW_CLASS}>
                        {group.patterns.map((pattern) => (
                            <PatternBadge
                                key={pattern.id}
                                name={patternDisplayName(pattern)}
                                uiBucket={pattern.ui_bucket}
                                selected={selectedSet.has(pattern.id)}
                                onClick={() => onToggle(pattern.id)}
                                size="md"
                                bucketTintedIdle
                                className={BLOCK_PATTERN_PICKER_CHIP_CLASS}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};
