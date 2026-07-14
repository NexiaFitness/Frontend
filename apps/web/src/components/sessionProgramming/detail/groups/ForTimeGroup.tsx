/**
 * ForTimeGroup.tsx — For Time en modo lectura.
 *
 * Renderiza los ejercicios agrupados por ronda (Round-centric).
 * Cada ronda muestra la secuencia completa de ejercicios a realizar,
 * facilitando que el atleta siga el circuito de forma clara.
 *
 * @author Frontend Team
 * @since v6.6.0
 */

import React from "react";
import { Repeat } from "lucide-react";
import type { SessionExerciseGroupView, SessionExerciseSetView } from "@nexia/shared";
import { DetailCardShell } from "../DetailCardShell";
import { DetailSlotRing } from "../DetailSlotRing";
import { DetailParamItem } from "./DetailParamItem";
import { detailStyleForKind, hintForKind } from "../detailStyles";
import { formatReps, formatEffort } from "../detailFormatters";
import {
    DETAIL_TABLE_BODY_CLASS,
    DETAIL_TABLE_CLASS,
    DETAIL_TABLE_HEAD_CLASS,
    detailTableColSpan,
} from "../detailTableLayout";
import {
    DetailEffortCell,
    DetailEffortHeaderCell,
    DetailLeadHeaderCell,
    DetailRepsCell,
    DetailRepsHeaderCell,
    DetailRestEmptyCell,
    DetailRestHeaderCell,
    DetailRoundHeaderCell,
    DetailRoundLabelCell,
    DetailTableColGroup,
} from "../detailTableCells";

export interface ForTimeGroupProps {
    blockTitle: string;
    group: SessionExerciseGroupView;
}

function RoundRow({
    roundIndex,
    slotCount,
    slotLabel,
    exerciseName,
    set,
}: {
    roundIndex: number;
    slotCount: number;
    slotLabel: string;
    exerciseName: string;
    set: SessionExerciseSetView;
}) {
    const repsText = formatReps(set) ?? "—";
    const effortText = formatEffort(set.effortCharacter, set.effortValue) ?? "—";

    return (
        <tr className="bg-card">
            {slotCount > 0 && (
                <DetailRoundLabelCell label={`R${roundIndex + 1}`} rowSpan={slotCount} />
            )}
            <td className="px-3 py-2">
                <div className="flex items-center gap-2.5">
                    <DetailSlotRing variant="for_time" label={slotLabel} />
                    <span className="text-sm font-medium text-foreground">{exerciseName}</span>
                </div>
            </td>
            <DetailRepsCell>{repsText}</DetailRepsCell>
            <DetailEffortCell>{effortText}</DetailEffortCell>
            <DetailRestEmptyCell />
        </tr>
    );
}

export const ForTimeGroup: React.FC<ForTimeGroupProps> = ({ blockTitle, group }) => {
    const style = detailStyleForKind(group.kind);
    const roundCount = Math.max(1, group.rounds ?? 1);

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
            <div className="overflow-hidden rounded-md border border-border/50">
                <table className={DETAIL_TABLE_CLASS}>
                    <DetailTableColGroup />
                    <thead className={DETAIL_TABLE_HEAD_CLASS}>
                        <tr>
                            <DetailRoundHeaderCell showLabel />
                            <DetailLeadHeaderCell label="Ejercicio" />
                            <DetailRepsHeaderCell />
                            <DetailEffortHeaderCell />
                            <DetailRestHeaderCell showLabel={false} />
                        </tr>
                    </thead>
                    {Array.from({ length: roundCount }).map((_, roundIdx) => (
                        <React.Fragment key={roundIdx}>
                            <tbody className={DETAIL_TABLE_BODY_CLASS}>
                                {group.slots.map((slot, slotIdx) => (
                                    <RoundRow
                                        key={`${roundIdx}-${slotIdx}`}
                                        roundIndex={roundIdx}
                                        slotCount={slotIdx === 0 ? group.slots.length : 0}
                                        slotLabel={slot.slotLabel}
                                        exerciseName={slot.exerciseName}
                                        set={slot.sets[roundIdx] ?? slot.sets[0]}
                                    />
                                ))}
                            </tbody>
                            {roundIdx < roundCount - 1 && (
                                <tbody aria-hidden="true">
                                    <tr>
                                        <td
                                            colSpan={detailTableColSpan({})}
                                            className="bg-card px-2 py-1.5"
                                        >
                                            <div className="border-t-2 border-border/70" />
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                        </React.Fragment>
                    ))}
                </table>
            </div>

            {group.slots.some((s) => s.notes) && (
                <div className="mt-3 space-y-1">
                    {group.slots
                        .filter((s) => s.notes)
                        .map((slot) => (
                            <p
                                key={slot.slotLabel}
                                className="text-[11px] italic text-muted-foreground"
                            >
                                {slot.slotLabel}: {slot.notes}
                            </p>
                        ))}
                </div>
            )}
        </DetailCardShell>
    );
};
