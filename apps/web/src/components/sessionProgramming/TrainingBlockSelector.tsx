/**
 * TrainingBlockSelector.tsx — Bloques de entrenamiento (G27).
 *
 * Una fila: roles fijos + cualidades añadidas por el entrenador (+ AddPillGrid).
 * Catálogo cerrado; sin tipos personalizados admin.
 */

import React, { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { AddPill, AddPillGrid, ADD_PILL_SECTION_LABEL_CLASS } from "@/components/ui/chips";
import { Button } from "@/components/ui/buttons";
import { Plus } from "lucide-react";
import { getTrainingBlockDisplayName } from "@nexia/shared";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import { useGetTrainingBlockTypesQuery } from "@nexia/shared/api/sessionProgrammingApi";

import {
    SESSION_PROGRAMMING_PANEL,
    SESSION_PROGRAMMING_PANEL_BODY,
    SESSION_PROGRAMMING_PANEL_TITLE,
    sessionProgrammingBlockChipClass,
} from "./sessionProgrammingPresentation";

export interface TrainingBlockSelectorProps {
    selectedBlockTypeIds: number[];
    onSelect: (blockTypeId: number) => void;
    className?: string;
}

export const TrainingBlockSelector: React.FC<TrainingBlockSelectorProps> = ({
    selectedBlockTypeIds,
    onSelect,
    className,
}) => {
    const [expandedQualitySlugs, setExpandedQualitySlugs] = useState<string[]>([]);
    const [showAddQualities, setShowAddQualities] = useState(false);

    const { data: blockTypes = [], isLoading } = useGetTrainingBlockTypesQuery({
        skip: 0,
        limit: 100,
    });

    const roleTypes = useMemo(
        () =>
            blockTypes
                .filter((bt) => bt.block_role)
                .sort((a, b) => (a.block_role ?? "").localeCompare(b.block_role ?? "")),
        [blockTypes],
    );

    const qualityBySlug = useMemo(() => {
        const map = new Map<string, TrainingBlockType>();
        for (const bt of blockTypes) {
            if (bt.physical_quality_slug) {
                map.set(bt.physical_quality_slug, bt);
            }
        }
        return map;
    }, [blockTypes]);

    const visibleQualityTypes = useMemo(
        () =>
            expandedQualitySlugs
                .map((slug) => qualityBySlug.get(slug))
                .filter((bt): bt is TrainingBlockType => bt != null),
        [expandedQualitySlugs, qualityBySlug],
    );

    const addableQualities = useMemo(
        () =>
            [...qualityBySlug.entries()]
                .filter(([slug]) => !expandedQualitySlugs.includes(slug))
                .sort(([a], [b]) => a.localeCompare(b)),
        [qualityBySlug, expandedQualitySlugs],
    );

    const handleAddQualitySlug = (slug: string) => {
        setExpandedQualitySlugs((prev) =>
            prev.includes(slug) ? prev : [...prev, slug],
        );
        setShowAddQualities(false);
    };

    if (isLoading) {
        return (
            <div className={cn(SESSION_PROGRAMMING_PANEL, "p-4 sm:p-5", className)}>
                <div className="mb-3 h-4 w-40 animate-pulse rounded bg-muted/50" />
                <div className="flex flex-wrap gap-2">
                    <div className="h-9 w-24 animate-pulse rounded-md bg-muted/50 sm:h-7" />
                    <div className="h-9 w-28 animate-pulse rounded-md bg-muted/50 sm:h-7" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn(SESSION_PROGRAMMING_PANEL, className)}>
            <div className={cn(SESSION_PROGRAMMING_PANEL_BODY, "space-y-4 !py-4 sm:!py-5")}>
                <h3 className={SESSION_PROGRAMMING_PANEL_TITLE}>Bloques de Entrenamiento</h3>

                <div className="flex w-full min-w-0 items-center gap-2">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        {roleTypes.map((bt) => (
                            <button
                                key={bt.id}
                                type="button"
                                onClick={() => onSelect(bt.id)}
                                className={sessionProgrammingBlockChipClass(
                                    selectedBlockTypeIds.includes(bt.id),
                                )}
                            >
                                {getTrainingBlockDisplayName(bt)}
                            </button>
                        ))}

                        {visibleQualityTypes.map((bt) => (
                            <button
                                key={bt.id}
                                type="button"
                                onClick={() => onSelect(bt.id)}
                                className={sessionProgrammingBlockChipClass(
                                    selectedBlockTypeIds.includes(bt.id),
                                )}
                            >
                                {getTrainingBlockDisplayName(bt)}
                            </button>
                        ))}
                    </div>

                    {addableQualities.length > 0 ? (
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className="h-8 shrink-0 px-2.5 text-xs sm:px-3"
                            aria-expanded={showAddQualities}
                            onClick={() => setShowAddQualities((v) => !v)}
                        >
                            <Plus className="h-3.5 w-3.5" aria-hidden />
                            Añadir cualidad
                        </Button>
                    ) : null}
                </div>

                {showAddQualities && addableQualities.length > 0 && (
                    <section className="space-y-2" aria-label="Añadir cualidad">
                        <p className={ADD_PILL_SECTION_LABEL_CLASS}>Elegir cualidad</p>
                        <AddPillGrid variant="compact">
                            {addableQualities.map(([slug, bt]) => (
                                <AddPill
                                    key={slug}
                                    label={getTrainingBlockDisplayName(bt)}
                                    variant="compact"
                                    prefix=""
                                    onClick={() => handleAddQualitySlug(slug)}
                                />
                            ))}
                        </AddPillGrid>
                    </section>
                )}
            </div>
        </div>
    );
};
