/**
 * PeriodBlockStructureDriftCallout.tsx — Inventario G26 en hub planificación (bloque enfocado).
 */

import React from "react";
import { Link } from "react-router-dom";
import type { StructureDriftSessionSummary } from "@nexia/shared";

import { cn } from "@/lib/utils";
import {
    STRUCTURE_DRIFT_CALLOUT_BODY,
    STRUCTURE_DRIFT_CALLOUT_LINK_CLASS,
    STRUCTURE_DRIFT_CALLOUT_LIST_CLASS,
    STRUCTURE_DRIFT_CALLOUT_SHELL,
    STRUCTURE_DRIFT_CALLOUT_TITLE,
    buildEditSessionPath,
} from "./structureDriftPresentation";

interface Props {
    sessions: StructureDriftSessionSummary[];
    className?: string;
}

function formatSessionLine(row: StructureDriftSessionSummary): string {
    const name = row.session_name?.trim();
    if (name) return `${name} · ${row.session_date}`;
    return row.session_date;
}

export const PeriodBlockStructureDriftCallout: React.FC<Props> = ({
    sessions,
    className,
}) => {
    if (sessions.length === 0) return null;

    return (
        <aside
            className={cn(STRUCTURE_DRIFT_CALLOUT_SHELL, className)}
            aria-labelledby="structure-drift-callout-title"
        >
            <h3
                id="structure-drift-callout-title"
                className="text-sm font-semibold text-foreground"
            >
                {STRUCTURE_DRIFT_CALLOUT_TITLE}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {STRUCTURE_DRIFT_CALLOUT_BODY}
            </p>
            <ul className={STRUCTURE_DRIFT_CALLOUT_LIST_CLASS}>
                {sessions.map((row) => (
                    <li key={row.id}>
                        <Link
                            to={buildEditSessionPath(row.id)}
                            className={STRUCTURE_DRIFT_CALLOUT_LINK_CLASS}
                        >
                            Revisar sesión — {formatSessionLine(row)}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};
