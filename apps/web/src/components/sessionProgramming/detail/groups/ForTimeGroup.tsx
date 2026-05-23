/**
 * ForTimeGroup.tsx — For Time en modo lectura.
 *
 * Estructura: lista numerada (slot rings verdes) con cada ejercicio.
 * Barra: Rondas (1 si no se especifica) + objetivo de menor tiempo posible.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { Repeat } from "lucide-react";
import type { SessionExerciseGroupView } from "@nexia/shared";
import { DetailCardShell } from "../DetailCardShell";
import { DetailSlotRing } from "../DetailSlotRing";
import { DetailSeriesTable } from "../DetailSeriesTable";
import { DetailParamItem } from "./DetailParamItem";
import { detailStyleForKind, hintForKind } from "../detailStyles";

export interface ForTimeGroupProps {
    blockTitle: string;
    group: SessionExerciseGroupView;
}

export const ForTimeGroup: React.FC<ForTimeGroupProps> = ({ blockTitle, group }) => {
    const style = detailStyleForKind(group.kind);
    const paramsBar = (
        <DetailParamItem
            icon={<Repeat className="h-3.5 w-3.5" />}
            label="Rondas"
            value={group.rounds ?? 1}
            accentTextClass={style.accentTextClass}
        />
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
                                variant="for_time"
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
