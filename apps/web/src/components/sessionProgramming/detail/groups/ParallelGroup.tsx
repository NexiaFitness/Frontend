/**
 * ParallelGroup.tsx — Superset / Giant Set (read-only).
 *
 * Renderiza los ejercicios agrupados por ronda (Round-centric).
 * Cada ronda (R1, R2...) muestra todos los ejercicios del grupo en esa ronda,
 * permitiendo al atleta seguir el flujo de entrenamiento de forma natural.
 *
 * @author Frontend Team
 * @since v6.6.0
 */

import React from "react";
import { Repeat, Timer } from "lucide-react";
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

function RoundRow({
    roundIndex,
    slotCount,
    slotLabel,
    exerciseName,
    set,
    variant,
}: {
    roundIndex: number;
    slotCount: number;
    slotLabel: string;
    exerciseName: string;
    set: SessionExerciseSetView;
    variant: "primary" | "for_time";
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
                    <DetailSlotRing variant={variant} label={slotLabel} />
                    <span className="text-sm font-medium text-foreground">{exerciseName}</span>
                </div>
            </td>
            <DetailRepsCell>{repsText}</DetailRepsCell>
            <DetailEffortCell>{effortText}</DetailEffortCell>
            <DetailRestEmptyCell />
        </tr>
    );
}

export const ParallelGroup: React.FC<ParallelGroupProps> = ({ blockTitle, group }) => {
    const style = detailStyleForKind(group.kind);
    const rest = restLabel(group);
    const roundCount = group.slots[0]?.sets.length ?? 0;

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
                    {Array.from({ length: roundCount }).map((_, roundIdx) => {
                        const visibleSlots = group.slots.filter((slot) => slot.sets[roundIdx]);

                        return (
                            <React.Fragment key={roundIdx}>
                                <tbody className={DETAIL_TABLE_BODY_CLASS}>
                                    {visibleSlots.map((slot, slotIdx) => (
                                        <RoundRow
                                            key={`${roundIdx}-${slotIdx}`}
                                            roundIndex={roundIdx}
                                            slotCount={slotIdx === 0 ? visibleSlots.length : 0}
                                            slotLabel={slot.slotLabel}
                                            exerciseName={slot.exerciseName}
                                            set={slot.sets[roundIdx]}
                                            variant="primary"
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
                        );
                    })}
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
