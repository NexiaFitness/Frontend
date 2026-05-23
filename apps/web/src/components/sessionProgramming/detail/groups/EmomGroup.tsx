/**
 * EmomGroup.tsx — EMOM en modo lectura.
 *
 * Estructura: ventanas (V1, V2…) cada una con sus ejercicios. Cada ventana se
 * agrupa visualmente con el cuadrado púrpura a la izquierda y la lista de
 * ejercicios a la derecha.
 *
 * Barra: Tiempo total · Intervalo · Ventanas.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React, { useMemo } from "react";
import { Clock, Hourglass, Repeat } from "lucide-react";
import type { SessionExerciseGroupView, SessionExerciseSlotView } from "@nexia/shared";
import { DetailCardShell } from "../DetailCardShell";
import { DetailSlotRing } from "../DetailSlotRing";
import { DetailSeriesTable } from "../DetailSeriesTable";
import { DetailParamItem } from "./DetailParamItem";
import { detailStyleForKind, hintForKind } from "../detailStyles";

export interface EmomGroupProps {
    blockTitle: string;
    group: SessionExerciseGroupView;
}

interface WindowGroup {
    label: string;
    slots: SessionExerciseSlotView[];
}

function groupByWindow(group: SessionExerciseGroupView): WindowGroup[] {
    const map = new Map<string, SessionExerciseSlotView[]>();
    for (const slot of group.slots) {
        if (!map.has(slot.slotLabel)) map.set(slot.slotLabel, []);
        map.get(slot.slotLabel)!.push(slot);
    }
    return Array.from(map.entries()).map(([label, slots]) => ({ label, slots }));
}

function formatIntervalSeconds(seconds: number | null): string | null {
    if (seconds == null) return null;
    if (seconds % 60 === 0) return `${seconds / 60}'`;
    return `${seconds}s`;
}

export const EmomGroup: React.FC<EmomGroupProps> = ({ blockTitle, group }) => {
    const style = detailStyleForKind(group.kind);
    const windows = useMemo(() => groupByWindow(group), [group]);
    const interval = formatIntervalSeconds(group.intervalSeconds);

    const paramsBar = (
        <>
            {group.timeCapMinutes != null && (
                <DetailParamItem
                    icon={<Hourglass className="h-3.5 w-3.5" />}
                    label="Tiempo total"
                    value={`${group.timeCapMinutes}'`}
                    accentTextClass={style.accentTextClass}
                />
            )}
            {interval && (
                <DetailParamItem
                    icon={<Clock className="h-3.5 w-3.5" />}
                    label="Intervalo"
                    value={interval}
                    accentTextClass={style.accentTextClass}
                />
            )}
            <DetailParamItem
                icon={<Repeat className="h-3.5 w-3.5" />}
                label="Ventanas"
                value={windows.length}
                accentTextClass={style.accentTextClass}
            />
        </>
    );

    return (
        <DetailCardShell
            kind={group.kind}
            blockTitle={blockTitle}
            seriesBadgeLabel={group.badgeLabel}
            paramsBar={paramsBar}
            hint={hintForKind(group.kind, group.rounds)}
        >
            <div className="space-y-3">
                {windows.map((win) => (
                    <div
                        key={win.label}
                        className="rounded-md border border-purple-500/20 bg-purple-500/[0.04] px-3 pb-3 pt-2"
                    >
                        <div className="flex items-start gap-3">
                            <DetailSlotRing variant="emom_window" label={win.label} />
                            <div className="min-w-0 flex-1 space-y-3">
                                {win.slots.map((slot, idx) => (
                                    <div key={slot.exerciseId + "-" + idx} className="min-w-0">
                                        <div className="mb-1 text-sm font-semibold text-foreground">
                                            {slot.exerciseName}
                                        </div>
                                        <DetailSeriesTable
                                            rows={slot.sets}
                                            firstColumnLabel="Ventana"
                                            hideRestColumn
                                        />
                                        {slot.notes && (
                                            <p className="mt-1 text-[11px] italic text-muted-foreground">
                                                {slot.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DetailCardShell>
    );
};
