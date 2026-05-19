/**
 * PatternSelectorPopover.tsx — Popover de selección de patrones de movimiento.
 *
 * Extraído de PeriodizationWeeklyStructureDraft (Fase E) para poder reutilizarse
 * tanto en el draft inline como en el futuro `PeriodizationWeeklyStructureModal`
 * (spec: docs/specs/estructura-semanal/02_SPEC_TECNICO_MODAL.md §4.6).
 *
 * Reglas:
 * - Agrupa el catálogo por `ui_bucket` siguiendo `UI_BUCKET_ORDER`.
 * - Cierra al hacer click fuera del contenedor del popover.
 * - No persiste estado interno: `onToggle(patternId)` mutuamente con el padre.
 */

import React, { useEffect, useMemo, useRef } from "react";

import { UI_BUCKET_LABELS, UI_BUCKET_ORDER } from "@nexia/shared";
import type { MovementPattern } from "@nexia/shared/types/exercise";

import { PatternBadge } from "./PatternBadge";

export interface PatternSelectorPopoverProps {
    isOpen: boolean;
    onClose: () => void;
    catalog: MovementPattern[];
    catalogLoading?: boolean;
    catalogError?: boolean;
    selectedPatternIds: number[];
    onToggle: (patternId: number) => void;
    /** Clase opcional para el wrapper del popover (posicionamiento, ancho). */
    className?: string;
}

export const PatternSelectorPopover: React.FC<PatternSelectorPopoverProps> = ({
    isOpen,
    onClose,
    catalog,
    catalogLoading,
    catalogError,
    selectedPatternIds,
    onToggle,
    className,
}) => {
    const popoverRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen, onClose]);

    const groupedPatterns = useMemo(() => {
        const map = new Map<string, MovementPattern[]>();
        for (const p of catalog) {
            const bucket = (p.ui_bucket || "ACCESSORY").toString().toUpperCase();
            if (!map.has(bucket)) map.set(bucket, []);
            map.get(bucket)!.push(p);
        }
        const ordered: { bucket: string; label: string; patterns: MovementPattern[] }[] = [];
        for (const bucket of UI_BUCKET_ORDER) {
            const list = map.get(bucket);
            if (list && list.length > 0) {
                ordered.push({
                    bucket,
                    label: UI_BUCKET_LABELS[bucket],
                    patterns: list.sort((a, b) => a.id - b.id),
                });
            }
        }
        for (const [bucket, list] of map) {
            if (!UI_BUCKET_ORDER.includes(bucket as typeof UI_BUCKET_ORDER[number])) {
                ordered.push({ bucket, label: bucket, patterns: list.sort((a, b) => a.id - b.id) });
            }
        }
        return ordered;
    }, [catalog]);

    if (!isOpen) return null;

    const wrapperClass = className
        ?? "absolute right-0 top-full mt-1 z-30 w-64 rounded-lg border border-border bg-surface shadow-xl p-2 space-y-2 max-h-64 overflow-y-auto scrollbar-primary";

    return (
        <div ref={popoverRef} className={wrapperClass} role="dialog">
            {catalogLoading && (
                <p className="text-xs text-muted-foreground text-center py-2">Cargando…</p>
            )}
            {catalogError && (
                <p className="text-xs text-destructive text-center py-2">
                    Error al cargar patrones
                </p>
            )}
            {!catalogLoading && !catalogError && groupedPatterns.map((group) => (
                <div key={group.bucket}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 px-1">
                        {group.label}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {group.patterns.map((p) => {
                            const active = selectedPatternIds.includes(p.id);
                            return (
                                <PatternBadge
                                    key={p.id}
                                    name={p.name_es || p.name_en}
                                    uiBucket={p.ui_bucket}
                                    active={active}
                                    onClick={() => onToggle(p.id)}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
