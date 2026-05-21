/**
 * AmrapGroup.tsx — AMRAP en modo lectura.
 *
 * Estructura: lista numerada (slot rings rojos) con cada ejercicio + reps/tiempo.
 * Barra: Time Cap · Rondas objetivo (opcional).
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { Hourglass, Repeat } from "lucide-react";
import type { SessionExerciseGroupView } from "@nexia/shared";
import { DetailCardShell } from "../DetailCardShell";
import { DetailSlotRing } from "../DetailSlotRing";
import { DetailSeriesTable } from "../DetailSeriesTable";
import { DetailParamItem } from "./DetailParamItem";
import { detailStyleForKind, hintForKind } from "../detailStyles";

export interface AmrapGroupProps {
    blockTitle: string;
    group: SessionExerciseGroupView;
}

export const AmrapGroup: React.FC<AmrapGroupProps> = ({ blockTitle, group }) => {
    const style = detailStyleForKind(group.kind);
    const headerBadge = <span className={style.badgeClass}>{group.badgeLabel}</span>;

    const paramsBar = (
        <>
            {group.timeCapMinutes != null && (
                <DetailParamItem
                    icon={<Hourglass className="h-3.5 w-3.5" />}
                    label="Time cap"
                    value={`${group.timeCapMinutes}'`}
                    accentTextClass={style.accentTextClass}
                />
            )}
            {group.rounds != null && (
                <DetailParamItem
                    icon={<Repeat className="h-3.5 w-3.5" />}
                    label="Rondas objetivo"
                    value={group.rounds}
                    accentTextClass={style.accentTextClass}
                />
            )}
        </>
    );

    return (
        <DetailCardShell
            kind={group.kind}
            blockTitle={blockTitle}
            headerTrailing={headerBadge}
            paramsBar={paramsBar}
            hint={hintForKind(group.kind, group.rounds)}
        >
            <div className="space-y-4">
                {group.slots.map((slot, idx) => {
                    const isLast = idx === group.slots.length - 1;
                    return (
                        <div key={slot.slotLabel + idx} className="flex items-start gap-3">
                            <DetailSlotRing
                                variant="amrap"
                                label={slot.slotLabel}
                                withConnector={!isLast}
                            />
                            <div className="min-w-0 flex-1">
                                <div className="mb-2 text-sm font-semibold text-foreground">
                                    {slot.exerciseName}
                                </div>
                                <DetailSeriesTable
                                    rows={slot.sets}
                                    firstColumnLabel="Bloque"
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
