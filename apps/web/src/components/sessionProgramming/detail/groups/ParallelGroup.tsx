/**
 * ParallelGroup.tsx — Superset / Giant Set (read-only).
 *
 * Estructura compartida: rondas × N ejercicios. Cada ejercicio se renderiza con
 * su slot ring (A1, A2…) y una tabla con una fila por ronda.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { Repeat, Timer } from "lucide-react";
import type { SessionExerciseGroupView } from "@nexia/shared";
import { DetailCardShell } from "../DetailCardShell";
import { DetailSlotRing } from "../DetailSlotRing";
import { DetailSeriesTable } from "../DetailSeriesTable";
import { DetailParamItem } from "./DetailParamItem";
import { detailStyleForKind, hintForKind } from "../detailStyles";

export interface ParallelGroupProps {
    blockTitle: string;
    group: SessionExerciseGroupView;
}

function restLabel(group: SessionExerciseGroupView): string | null {
    const seconds = group.restBetweenSeconds;
    if (seconds == null) return null;
    if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}'`;
    return `${seconds}s`;
}

export const ParallelGroup: React.FC<ParallelGroupProps> = ({ blockTitle, group }) => {
    const style = detailStyleForKind(group.kind);
    const rest = restLabel(group);

    const paramsBar = (
        <>
            <DetailParamItem
                icon={<Repeat className="h-3.5 w-3.5" />}
                label="Rondas"
                value={group.rounds ?? 1}
                accentTextClass={style.accentTextClass}
            />
            {rest && (
                <DetailParamItem
                    icon={<Timer className="h-3.5 w-3.5" />}
                    label="Descanso entre rondas"
                    value={rest}
                    accentTextClass={style.accentTextClass}
                />
            )}
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
            <div className="space-y-4">
                {group.slots.map((slot, idx) => {
                    const isLast = idx === group.slots.length - 1;
                    return (
                        <div key={slot.slotLabel + idx} className="flex items-start gap-3">
                            <DetailSlotRing
                                variant="primary"
                                label={slot.slotLabel}
                                withConnector={!isLast}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="mb-2 text-sm font-semibold text-foreground">
                                    {slot.exerciseName}
                                </div>
                                <DetailSeriesTable
                                    rows={slot.sets}
                                    firstColumnLabel="Ronda"
                                    hideRestColumn
                                />
                                {slot.notes && (
                                    <p className="mt-2 text-[11px] italic text-muted-foreground">
                                        {slot.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </DetailCardShell>
    );
};
