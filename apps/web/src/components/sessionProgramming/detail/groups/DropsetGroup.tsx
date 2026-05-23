/**
 * DropsetGroup.tsx — Renderiza el grupo dropset en modo lectura.
 *
 * Estructura: 1 ejercicio MAIN + N pasos DROP.
 * Header de tabla "Paso" (MAIN, DROP 1…) sin columna de descanso.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { Repeat, Timer } from "lucide-react";
import type { SessionExerciseGroupView } from "@nexia/shared";
import { DetailCardShell } from "../DetailCardShell";
import { DetailSlotRing } from "../DetailSlotRing";
import { DetailSeriesTable, type DetailSeriesRow } from "../DetailSeriesTable";
import { DetailParamItem } from "./DetailParamItem";
import { detailStyleForKind, hintForKind } from "../detailStyles";

export interface DropsetGroupProps {
    blockTitle: string;
    group: SessionExerciseGroupView;
}

function restLabel(seconds: number | null): string | null {
    if (seconds == null) return null;
    if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}'`;
    return `${seconds}s`;
}

export const DropsetGroup: React.FC<DropsetGroupProps> = ({ blockTitle, group }) => {
    const slot = group.slots[0];
    const style = detailStyleForKind(group.kind);

    const rest = restLabel(group.restBetweenSeconds);

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

    if (!slot) {
        return (
            <DetailCardShell
                kind={group.kind}
                blockTitle={blockTitle}
                seriesBadgeLabel={group.badgeLabel}
                paramsBar={paramsBar}
                hint={hintForKind(group.kind, group.rounds)}
            >
                <p className="text-sm text-muted-foreground">Sin ejercicios.</p>
            </DetailCardShell>
        );
    }

    const rows: DetailSeriesRow[] = slot.sets.map((set) => ({
        ...set,
        overrideLabel: set.label,
    }));

    return (
        <DetailCardShell
            kind={group.kind}
            blockTitle={blockTitle}
            seriesBadgeLabel={group.badgeLabel}
            paramsBar={paramsBar}
            hint={hintForKind(group.kind, group.rounds)}
        >
            <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-2">
                    <DetailSlotRing variant="dropset_main" label="MAIN" withConnector />
                    {slot.sets.slice(1).map((set, i, arr) => {
                        const dropNum =
                            set.label.replace(/^DROP\s*/i, "").trim() || String(i + 1);
                        return (
                            <DetailSlotRing
                                key={`${set.label}-${i}`}
                                variant="dropset_step"
                                label="DROP"
                                subLabel={dropNum}
                                withConnector={i < arr.length - 1}
                            />
                        );
                    })}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="mb-2 text-sm font-semibold text-foreground">
                        {slot.exerciseName}
                    </div>
                    <DetailSeriesTable rows={rows} firstColumnLabel="Paso" hideRestColumn />
                    {slot.notes && (
                        <p className="mt-2 text-[11px] italic text-muted-foreground">{slot.notes}</p>
                    )}
                </div>
            </div>
        </DetailCardShell>
    );
};
