/**
 * EmomGroup.tsx — EMOM en modo lectura.
 *
 * Una tabla única (V1, V2…) con reps/esfuerzo alineados a la derecha,
 * misma cuadrícula que AMRAP / Giant Set.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React, { useMemo } from "react";
import { Clock, Hourglass, Repeat } from "lucide-react";
import type { SessionExerciseGroupView } from "@nexia/shared";
import { DetailCardShell } from "../DetailCardShell";
import { DetailSlotRing } from "../DetailSlotRing";
import { DetailParamItem } from "./DetailParamItem";
import { detailStyleForKind, hintForKind } from "../detailStyles";
import { formatReps, formatEffort } from "../detailFormatters";
import {
    DETAIL_TABLE_BODY_CLASS,
    DETAIL_TABLE_CLASS,
    DETAIL_TABLE_HEAD_CLASS,
} from "../detailTableLayout";
import {
    DetailEffortCell,
    DetailEffortHeaderCell,
    DetailLeadHeaderCell,
    DetailRepsCell,
    DetailRepsHeaderCell,
    DetailRestEmptyCell,
    DetailRestHeaderCell,
    DetailRoundBodyCell,
    DetailRoundHeaderCell,
    DetailTableColGroup,
} from "../detailTableCells";

export interface EmomGroupProps {
    blockTitle: string;
    group: SessionExerciseGroupView;
}

function formatIntervalSeconds(seconds: number | null): string | null {
    if (seconds == null) return null;
    if (seconds % 60 === 0) return `${seconds / 60}'`;
    return `${seconds}s`;
}

function countWindows(slots: SessionExerciseGroupView["slots"]): number {
    return new Set(slots.map((slot) => slot.slotLabel)).size;
}

export const EmomGroup: React.FC<EmomGroupProps> = ({ blockTitle, group }) => {
    const style = detailStyleForKind(group.kind);
    const windowCount = useMemo(() => countWindows(group.slots), [group.slots]);
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
                value={windowCount}
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
            <div className="overflow-hidden rounded-md border border-border/50">
                <table className={DETAIL_TABLE_CLASS}>
                    <DetailTableColGroup />
                    <thead className={DETAIL_TABLE_HEAD_CLASS}>
                        <tr>
                            <DetailRoundHeaderCell />
                            <DetailLeadHeaderCell label="Ejercicio" />
                            <DetailRepsHeaderCell />
                            <DetailEffortHeaderCell />
                            <DetailRestHeaderCell showLabel={false} />
                        </tr>
                    </thead>
                    <tbody className={DETAIL_TABLE_BODY_CLASS}>
                        {group.slots.map((slot, idx) => {
                            const set = slot.sets[0];
                            const repsText = set ? formatReps(set) ?? "—" : "—";
                            const effortText = set
                                ? formatEffort(set.effortCharacter, set.effortValue) ?? "—"
                                : "—";
                            const isLast = idx === group.slots.length - 1;

                            return (
                                <tr key={`${slot.slotLabel}-${slot.exerciseId}-${idx}`} className="bg-card">
                                    <DetailRoundBodyCell />
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <DetailSlotRing
                                                variant="emom_window"
                                                label={slot.slotLabel}
                                                withConnector={!isLast}
                                            />
                                            <span className="truncate text-sm font-medium text-foreground">
                                                {slot.exerciseName}
                                            </span>
                                        </div>
                                        {slot.notes && (
                                            <p className="mt-1 pl-[46px] text-[11px] italic text-muted-foreground">
                                                {slot.notes}
                                            </p>
                                        )}
                                    </td>
                                    <DetailRepsCell>{repsText}</DetailRepsCell>
                                    <DetailEffortCell>{effortText}</DetailEffortCell>
                                    <DetailRestEmptyCell />
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </DetailCardShell>
    );
};
