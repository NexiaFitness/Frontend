/**
 * AmrapGroup.tsx — AMRAP en modo lectura.
 *
 * Lista numerada: ejercicio + reps/tiempo + esfuerzo por movimiento de la ronda.
 * Barra: Time cap · Rondas objetivo (opcional).
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { Hourglass, Repeat } from "lucide-react";
import type { SessionExerciseGroupView } from "@nexia/shared";
import { amrapFooterHint } from "@nexia/shared";
import { DetailCardShell } from "../DetailCardShell";
import { DetailSlotRing } from "../DetailSlotRing";
import { DetailParamItem } from "./DetailParamItem";
import { detailStyleForKind } from "../detailStyles";
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

export interface AmrapGroupProps {
    blockTitle: string;
    group: SessionExerciseGroupView;
}

export const AmrapGroup: React.FC<AmrapGroupProps> = ({ blockTitle, group }) => {
    const style = detailStyleForKind(group.kind);
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
            seriesBadgeLabel={group.badgeLabel}
            paramsBar={paramsBar}
            hint={amrapFooterHint(group.timeCapMinutes)}
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
                                <tr key={slot.slotLabel + idx} className="bg-card">
                                    <DetailRoundBodyCell />
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2.5">
                                            <DetailSlotRing
                                                variant="amrap"
                                                label={slot.slotLabel}
                                                withConnector={!isLast}
                                            />
                                            <span className="text-sm font-medium text-foreground">
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
