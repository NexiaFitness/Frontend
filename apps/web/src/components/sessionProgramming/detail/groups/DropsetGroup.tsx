/**
 * DropsetGroup.tsx — Renderiza el grupo dropset en modo lectura.
 *
 * Tabla alineada con superset/for time: anillo MAIN/DROP por fila,
 * reps y esfuerzo a la derecha (sin columna Paso).
 *
 * @author Frontend Team
 * @since v6.5.0
 * @updated v6.6.1 — layout tabular round-aligned
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

export interface DropsetGroupProps {
    blockTitle: string;
    group: SessionExerciseGroupView;
}

function restLabel(seconds: number | null): string | null {
    if (seconds == null) return null;
    if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}'`;
    return `${seconds}s`;
}

function dropSubLabel(set: SessionExerciseSetView, stepIndex: number): string {
    const fromLabel = set.label.replace(/^DROP\s*/i, "").trim();
    return fromLabel || String(stepIndex);
}

function DropStepRow({
    set,
    stepIndex,
}: {
    set: SessionExerciseSetView;
    stepIndex: number;
}) {
    const isMain = stepIndex === 0;
    const repsText = formatReps(set) ?? "—";
    const effortText = formatEffort(set.effortCharacter, set.effortValue) ?? "—";

    return (
        <tr className="bg-card">
            <DetailRoundBodyCell />
            <td className="px-3 py-2">
                <div className="flex items-center gap-2.5">
                    {isMain ? (
                        <DetailSlotRing variant="dropset_main" label="MAIN" align="start" />
                    ) : (
                        <DetailSlotRing
                            variant="dropset_step"
                            label="DROP"
                            subLabel={dropSubLabel(set, stepIndex)}
                            align="start"
                        />
                    )}
                </div>
            </td>
            <DetailRepsCell>{repsText}</DetailRepsCell>
            <DetailEffortCell>{effortText}</DetailEffortCell>
            <DetailRestEmptyCell />
        </tr>
    );
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
                    <DetailTableColGroup />
                    <thead className={DETAIL_TABLE_HEAD_CLASS}>
                        <tr>
                            <DetailRoundHeaderCell />
                            <DetailLeadHeaderCell label="Drop" />
                            <DetailRepsHeaderCell />
                            <DetailEffortHeaderCell />
                            <DetailRestHeaderCell showLabel={false} />
                        </tr>
                    </thead>
                    <tbody className={DETAIL_TABLE_BODY_CLASS}>
                        {slot.sets.map((set, stepIndex) => (
                            <DropStepRow
                                key={`${set.label}-${set.sourceLineId}-${stepIndex}`}
                                set={set}
                                stepIndex={stepIndex}
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
