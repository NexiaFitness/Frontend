/**
 * Detalle expandible AMRAP / EMOM / FOR TIME (mismo copy de toggle que fuerza).
 */

import React, { useState } from "react";
import { AthletePrescriptionExpandTable } from "@/components/athlete/sessions/AthletePrescriptionExpandTable";
import {
    ATHLETE_SESSION_PRESCRIPTION_DETAIL_LIST,
    ATHLETE_SESSION_PRESCRIPTION_DETAIL_TERM,
    ATHLETE_SESSION_PRESCRIPTION_EXPAND_PANEL,
    ATHLETE_SESSION_SERIES_TOGGLE,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { AthleteTimedPrescriptionKind } from "@nexia/shared/utils/athlete/athleteTimedPrescriptionExpand";
import type { AthleteTimedPrescriptionExpandView } from "@nexia/shared/utils/athlete/athleteTimedPrescriptionExpand";
import { forTimeExpandTableColumns } from "@nexia/shared/utils/athlete/athleteTimedPrescriptionExpand";
import { strengthPrescriptionToggleLabels } from "@nexia/shared/utils/athlete/athleteStrengthPrescriptionPresentation";

export const AthletePrescriptionTimedDetail: React.FC<{
    kind: AthleteTimedPrescriptionKind;
    expand: AthleteTimedPrescriptionExpandView;
}> = ({ kind, expand }) => {
    const [open, setOpen] = useState(false);
    if (!expand.hasExpandable) return null;

    const forTimeRows = expand.forTimeSetRows;
    const columns = forTimeRows ? forTimeExpandTableColumns(forTimeRows) : [];
    const toggle = strengthPrescriptionToggleLabels(kind);

    return (
        <>
            <button
                type="button"
                className={ATHLETE_SESSION_SERIES_TOGGLE}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                {open ? toggle.hide : toggle.show}
            </button>
            {open ? (
                <div className={ATHLETE_SESSION_PRESCRIPTION_EXPAND_PANEL}>
                    {forTimeRows && columns.length > 0 ? (
                        <AthletePrescriptionExpandTable
                            rowColumnLabel={toggle.rowColumn}
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
