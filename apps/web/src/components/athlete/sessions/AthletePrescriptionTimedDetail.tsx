/**
 * Detalle expandible AMRAP / EMOM / FOR TIME («Ver prescripción»).
 */

import React, { useState } from "react";
import { AthletePrescriptionExpandTable } from "@/components/athlete/sessions/AthletePrescriptionExpandTable";
import {
    ATHLETE_SESSION_PRESCRIPTION_DETAIL_LIST,
    ATHLETE_SESSION_PRESCRIPTION_DETAIL_TERM,
    ATHLETE_SESSION_PRESCRIPTION_EXPAND_PANEL,
    ATHLETE_SESSION_SERIES_TOGGLE,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { AthleteTimedPrescriptionExpandView } from "@nexia/shared/utils/athlete/athleteTimedPrescriptionExpand";
import { forTimeExpandTableColumns } from "@nexia/shared/utils/athlete/athleteTimedPrescriptionExpand";

export const AthletePrescriptionTimedDetail: React.FC<{
    expand: AthleteTimedPrescriptionExpandView;
}> = ({ expand }) => {
    const [open, setOpen] = useState(false);
    if (!expand.hasExpandable) return null;

    const forTimeRows = expand.forTimeSetRows;
    const columns = forTimeRows ? forTimeExpandTableColumns(forTimeRows) : [];

    return (
        <>
            <button
                type="button"
                className={ATHLETE_SESSION_SERIES_TOGGLE}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                {open ? "Ocultar prescripción" : "Ver prescripción"}
            </button>
            {open ? (
                <div className={ATHLETE_SESSION_PRESCRIPTION_EXPAND_PANEL}>
                    {forTimeRows && columns.length > 0 ? (
                        <AthletePrescriptionExpandTable
                            rowColumnLabel="Ronda"
                            rows={forTimeRows.map((row) => ({
                                rowKey: row.roundLabel,
                                rowLabel: row.roundLabel,
                                reps: columns.includes("reps") ? row.reps : null,
                                load: columns.includes("load") ? row.load : null,
                                effort: columns.includes("effort") ? row.effort : null,
                                rest: columns.includes("rest") ? row.rest : null,
                            }))}
                        />
                    ) : (
                        <dl className={ATHLETE_SESSION_PRESCRIPTION_DETAIL_LIST}>
                            {expand.detailRows.map((row) => (
                                <div key={row.label} className="flex gap-3">
                                    <dt className={ATHLETE_SESSION_PRESCRIPTION_DETAIL_TERM}>
                                        {row.label}:
                                    </dt>
                                    <dd className="min-w-0">{row.value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>
            ) : null}
        </>
    );
};
