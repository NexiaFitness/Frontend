/**
 * Tabla compacta compartida: «Ver series» (fuerza) y FOR TIME «Ver prescripción».
 */

import React from "react";
import {
    ATHLETE_SESSION_SET_TABLE,
    ATHLETE_SESSION_SET_TABLE_CELL,
    ATHLETE_SESSION_SET_TABLE_CELL_FIRST,
    ATHLETE_SESSION_SET_TABLE_CELL_REST,
    ATHLETE_SESSION_SET_TABLE_HEAD,
    ATHLETE_SESSION_SET_TABLE_ROW,
    ATHLETE_SESSION_SET_TABLE_WRAP,
} from "@/components/athlete/sessions/athleteSessionsPresentation";

const DATA_COLUMNS = [
    { key: "reps" as const, head: "Reps" },
    { key: "load" as const, head: "Carga" },
    { key: "effort" as const, head: "Esfuerzo" },
    { key: "rest" as const, head: "Desc" },
] as const;

const LABEL_COL_PERCENT = 27;

export interface AthletePrescriptionExpandTableRow {
    rowKey: string;
    rowLabel: string;
    reps: string | null;
    load: string | null;
    effort: string | null;
    rest: string | null;
}

function cell(value: string | null, variant: "default" | "first" | "rest"): React.ReactNode {
    const text = value?.trim() ? value : "—";
    const className =
        variant === "first"
            ? ATHLETE_SESSION_SET_TABLE_CELL_FIRST
            : variant === "rest"
              ? ATHLETE_SESSION_SET_TABLE_CELL_REST
              : ATHLETE_SESSION_SET_TABLE_CELL;
    return <td className={className}>{text}</td>;
}

export const AthletePrescriptionExpandTable: React.FC<{
    rowColumnLabel: string;
    rows: AthletePrescriptionExpandTableRow[];
}> = ({ rowColumnLabel, rows }) => {
    if (rows.length === 0) return null;

    const visible = DATA_COLUMNS.filter((col) =>
        rows.some((row) => row[col.key]?.trim())
    );
    if (visible.length === 0) return null;

    const dataColPercent =
        visible.length > 0 ? (100 - LABEL_COL_PERCENT) / visible.length : 0;

    return (
        <div className={ATHLETE_SESSION_SET_TABLE_WRAP}>
            <table className={ATHLETE_SESSION_SET_TABLE}>
                <colgroup>
                    <col style={{ width: `${LABEL_COL_PERCENT}%` }} />
                    {visible.map((col) => (
                        <col key={col.key} style={{ width: `${dataColPercent}%` }} />
                    ))}
                </colgroup>
                <thead>
                    <tr>
                        <th scope="col" className={ATHLETE_SESSION_SET_TABLE_HEAD}>
                            {rowColumnLabel}
                        </th>
                        {visible.map((col) => (
                            <th key={col.key} scope="col" className={ATHLETE_SESSION_SET_TABLE_HEAD}>
                                {col.head}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.rowKey} className={ATHLETE_SESSION_SET_TABLE_ROW}>
                            {cell(row.rowLabel, "first")}
                            {visible.map((col) =>
                                cell(row[col.key], col.key === "rest" ? "rest" : "default")
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
