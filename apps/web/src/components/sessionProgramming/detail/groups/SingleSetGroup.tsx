/**
 * SingleSetGroup.tsx — Renderiza un grupo single_set en modo lectura.
 *
 * Header de tarjeta: Bloque + badge "SINGLE SET".
 * Barra: Series · Descanso (si todas las series comparten descanso).
 * Cuerpo: anillo S(N) + nombre del ejercicio + tabla de series.
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

export interface SingleSetGroupProps {
    blockTitle: string;
    group: SessionExerciseGroupView;
}

function commonRest(group: SessionExerciseGroupView): string | null {
    const slot = group.slots[0];
    if (!slot) return null;
    const rests = slot.sets.map((s) => s.plannedRest).filter((v) => v != null) as number[];
    if (rests.length === 0) return null;
    const allEqual = rests.every((r) => r === rests[0]);
    if (!allEqual) return null;
    const seconds = rests[0];
    if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}'`;
    return `${seconds}s`;
}

export const SingleSetGroup: React.FC<SingleSetGroupProps> = ({ blockTitle, group }) => {
    const slot = group.slots[0];
    const style = detailStyleForKind(group.kind);
    const restLabel = commonRest(group);
    const seriesCount = slot?.sets.length ?? 0;

    const headerBadge = (
        <span className={style.badgeClass}>{group.badgeLabel}</span>
    );

    const paramsBar = (
        <>
            <DetailParamItem
                icon={<Repeat className="h-3.5 w-3.5" />}
                label="Series"
                value={seriesCount}
                accentTextClass={style.accentTextClass}
            />
            {restLabel && (
                <DetailParamItem
                    icon={<Timer className="h-3.5 w-3.5" />}
                    label="Descanso"
                    value={restLabel}
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
                headerTrailing={headerBadge}
                paramsBar={paramsBar}
                hint={hintForKind(group.kind, group.rounds)}
            >
                <p className="text-sm text-muted-foreground">Sin ejercicios.</p>
            </DetailCardShell>
        );
    }

    return (
        <DetailCardShell
            kind={group.kind}
            blockTitle={blockTitle}
            headerTrailing={headerBadge}
            paramsBar={paramsBar}
            hint={hintForKind(group.kind, group.rounds)}
        >
            <div className="flex items-start gap-3">
                <DetailSlotRing variant="primary" label={`S${seriesCount}`} />
                <div className="min-w-0 flex-1">
                    <div className="mb-2 text-sm font-semibold text-foreground">
                        {slot.exerciseName}
                    </div>
                    <DetailSeriesTable rows={slot.sets} firstColumnLabel="Serie" />
                    {slot.notes && (
                        <p className="mt-2 text-[11px] italic text-muted-foreground">{slot.notes}</p>
                    )}
                </div>
            </div>
        </DetailCardShell>
    );
};
