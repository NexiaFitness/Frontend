/**
 * PatternSelectorPanel.tsx — Catálogo de patrones agrupado por ui_bucket.
 */

import React, { useMemo } from "react";

import {
    UI_BUCKET_ORDER,
    UI_BUCKET_LABELS,
    uiBucketLabel,
} from "@nexia/shared";
import type { MovementPattern } from "@nexia/shared/types/exercise";

import { LoadingSpinner } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

import { PatternBadge } from "./PatternBadge";

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

export const PatternSelectorPanel: React.FC<Props> = ({
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

    const grouped = useMemo(() => {
        const byBucket = new Map<string, MovementPattern[]>();
        for (const pattern of catalog) {
            const key = pattern.ui_bucket ?? "ACCESSORY";
            if (!byBucket.has(key)) byBucket.set(key, []);
            byBucket.get(key)!.push(pattern);
        }
        for (const patterns of byBucket.values()) {
            patterns.sort((a, b) =>
                patternDisplayName(a).localeCompare(patternDisplayName(b), "es"),
            );
        }
        const ordered: { bucket: string; label: string; patterns: MovementPattern[] }[] =
            [];
        for (const bucket of UI_BUCKET_ORDER) {
            const patterns = byBucket.get(bucket);
            if (patterns?.length) {
                ordered.push({
                    bucket,
                    label: UI_BUCKET_LABELS[bucket],
                    patterns,
                });
                byBucket.delete(bucket);
            }
        }
        for (const [bucket, patterns] of byBucket.entries()) {
            if (patterns.length > 0) {
                ordered.push({
                    bucket,
                    label: uiBucketLabel(bucket),
                    patterns,
                });
            }
        }
        return ordered;
    }, [catalog]);

    if (catalogLoading) {
        return (
            <div className={cn("flex items-center justify-center py-10", className)}>
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (catalogError) {
        return (
            <p className={cn("text-sm text-destructive py-4", className)}>
                No se pudo cargar el catálogo de patrones.
            </p>
        );
    }

    if (catalog.length === 0) {
        return (
            <p className={cn("text-sm text-muted-foreground py-4", className)}>
                No hay patrones disponibles.
            </p>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {grouped.map(({ bucket, label, patterns }) => (
                <section key={bucket} className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {patterns.map((pattern) => (
                            <PatternBadge
                                key={pattern.id}
                                name={patternDisplayName(pattern)}
                                uiBucket={pattern.ui_bucket}
                                selected={selectedSet.has(pattern.id)}
                                onClick={() => onToggle(pattern.id)}
                                size="md"
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};
