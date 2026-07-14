/**
 * SingleSetGroup.tsx — Renderiza un grupo single_set en modo lectura.
 *
 * Tabla alineada con dropset/superset: anillo S1…Sn por fila bajo "Serie",
 * reps / esfuerzo / descanso a la derecha. Nombre del ejercicio encima.
 *
 * @author Frontend Team
 * @since v6.5.0
 * @updated v6.6.1 — layout tabular alineado con dropset
 */

import React, { useMemo } from "react";
import { Repeat, Timer } from "lucide-react";
import type { SessionExerciseGroupView, SessionExerciseSetView } from "@nexia/shared";
import { DetailCardShell } from "../DetailCardShell";
import { DetailSlotRing } from "../DetailSlotRing";
import { DetailParamItem } from "./DetailParamItem";
import { detailStyleForKind, hintForKind } from "../detailStyles";
import { formatReps, formatEffort, formatRest } from "../detailFormatters";
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
    DetailRestCell,
    DetailRestEmptyCell,
    DetailRestHeaderCell,
    DetailRoundBodyCell,
    DetailRoundHeaderCell,
    DetailTableColGroup,
} from "../detailTableCells";

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

function SeriesRow({
    set,
    showRest,
    showActualReps,
    showActualWeight,
    showActualEffort,
}: {
    set: SessionExerciseSetView;
    showRest: boolean;
    showActualReps: boolean;
    showActualWeight: boolean;
    showActualEffort: boolean;
}) {
    const repsText = formatReps(set) ?? "—";
    const effortText = formatEffort(set.effortCharacter, set.effortValue) ?? "—";
    const restText = formatRest(set.plannedRest) ?? "—";

    return (
        <tr className="bg-card">
            <DetailRoundBodyCell />
            <td className="px-3 py-2 align-middle">
                <div className="flex items-center gap-2.5">
                    <DetailSlotRing variant="primary" label={set.label} align="start" />
                </div>
            </td>
            <DetailRepsCell>{repsText}</DetailRepsCell>
            <DetailEffortCell>{effortText}</DetailEffortCell>
            {showRest ? (
                <DetailRestCell>{restText}</DetailRestCell>
            ) : (
                <DetailRestEmptyCell />
            )}
            {showActualReps && (
                <td className="px-3 py-2 text-right">
                    <span className="text-sm text-foreground">{set.actualReps ?? "—"}</span>
                </td>
            )}
            {showActualWeight && (
                <td className="px-3 py-2 text-right">
                    <span className="text-sm text-foreground">
                        {set.actualWeight != null ? `${set.actualWeight} kg` : "—"}
                    </span>
                </td>
            )}
            {showActualEffort && (
                <td className="px-3 py-2 text-right">
                    <span className="text-sm text-foreground">
                        {set.actualEffortValue != null ? `${set.actualEffortValue}` : "—"}
                    </span>
                </td>
            )}
        </tr>
    );
}

export const SingleSetGroup: React.FC<SingleSetGroupProps> = ({ blockTitle, group }) => {
    const slot = group.slots[0];
    const style = detailStyleForKind(group.kind);
    const restLabel = commonRest(group);
    const seriesCount = slot?.sets.length ?? 0;

    const showRest = useMemo(
        () => (slot?.sets.some((s) => s.plannedRest != null) ?? false),
        [slot]
    );
    const showActualReps = useMemo(
        () => slot?.sets.some((s) => s.actualReps != null && s.actualReps !== "") ?? false,
        [slot]
    );
    const showActualWeight = useMemo(
        () => slot?.sets.some((s) => s.actualWeight != null) ?? false,
        [slot]
    );
    const showActualEffort = useMemo(
        () => slot?.sets.some((s) => s.actualEffortValue != null) ?? false,
        [slot]
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

    const trailingColumnCount =
        (showActualReps ? 1 : 0) + (showActualWeight ? 1 : 0) + (showActualEffort ? 1 : 0);

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

    return (
        <DetailCardShell
            kind={group.kind}
            blockTitle={blockTitle}
            seriesBadgeLabel={group.badgeLabel}
            paramsBar={paramsBar}
            hint={hintForKind(group.kind, group.rounds)}
        >
            <p className="mb-2 text-sm font-semibold text-foreground">{slot.exerciseName}</p>
            <div className="overflow-hidden rounded-md border border-border/50">
                <table className={DETAIL_TABLE_CLASS}>
                    <DetailTableColGroup trailingColumnCount={trailingColumnCount} />
                    <thead className={DETAIL_TABLE_HEAD_CLASS}>
                        <tr>
                            <DetailRoundHeaderCell />
                            <DetailLeadHeaderCell label="Serie" />
                            <DetailRepsHeaderCell />
                            <DetailEffortHeaderCell />
                            <DetailRestHeaderCell showLabel={showRest} />
                            {showActualReps && <th className="px-3 py-2 text-right">Reps real</th>}
                            {showActualWeight && <th className="px-3 py-2 text-right">Peso movido</th>}
                            {showActualEffort && <th className="px-3 py-2 text-right">RPE percibido</th>}
                        </tr>
                    </thead>
                    <tbody className={DETAIL_TABLE_BODY_CLASS}>
                        {slot.sets.map((set) => (
                            <SeriesRow
                                key={`${set.label}-${set.sourceLineId}-${set.index}`}
                                set={set}
                                showRest={showRest}
                                showActualReps={showActualReps}
                                showActualWeight={showActualWeight}
                                showActualEffort={showActualEffort}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {slot.notes && (
                <p className="mt-2 text-[11px] italic text-muted-foreground">{slot.notes}</p>
            )}
        </DetailCardShell>
    );
};
