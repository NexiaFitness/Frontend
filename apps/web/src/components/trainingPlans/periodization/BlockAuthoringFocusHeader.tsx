/**
 * BlockAuthoringFocusHeader.tsx — Cabecera sutil del wizard D-PAP (modo foco).
 * Solo tipografía y espaciado; el cuerpo del paso lleva el peso visual.
 */

import React, { useMemo } from "react";
import { Trash2 } from "lucide-react";
import type { Client } from "@nexia/shared/types/client";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import type { BlockAuthorMode } from "./blockAuthoringModel";
import {
    buildBlockAuthoringBreadcrumbs,
    buildClientAuthoringMetaItems,
    formatClientDisplayName,
} from "./blockAuthoringFocusContext";
import { PeriodBlockIconButton } from "./PeriodBlockIconButton";
import { PlanningDateRangeMeta } from "./PlanningDateRangeMeta";
import {
    AUTHORING_FOCUS_BLOCK_PERIOD_CLASS,
    AUTHORING_FOCUS_IDENTITY_ROW_CLASS,
    AUTHORING_FOCUS_META_CLASS,
    AUTHORING_FOCUS_NAME_CLASS,
    AUTHORING_FOCUS_NAME_GRADIENT_CLASS,
    AUTHORING_FOCUS_SHELL_CLASS,
    AUTHORING_FOCUS_STEPPER_ROW_CLASS,
    AUTHORING_FOCUS_TASK_SUBTITLE_CLASS,
    AUTHORING_FOCUS_TASK_TITLE_SPACER_CLASS,
    AUTHORING_FOCUS_TOP_ROW_CLASS,
} from "./phaseAuthoringPresentation";

interface Props {
    clientId: number;
    planId: number;
    clientProfile?: Client | null;
    mode: BlockAuthorMode;
    blockStartDate?: string | null;
    blockEndDate?: string | null;
    taskSubtitle: string;
    onExit: () => void;
    stepper: React.ReactNode;
}

export const BlockAuthoringFocusHeader: React.FC<Props> = ({
    clientId,
    planId,
    clientProfile,
    mode,
    blockStartDate = null,
    blockEndDate = null,
    taskSubtitle,
    onExit,
    stepper,
}) => {
    const showBlockPeriod = Boolean(blockStartDate && blockEndDate);
    const clientName = clientProfile
        ? formatClientDisplayName(clientProfile)
        : "Cliente";
    const firstName = clientProfile?.nombre?.trim() || clientName;
    const lastName = clientProfile?.apellidos?.trim() ?? "";

    const metaItems = useMemo(
        () =>
            clientProfile ? buildClientAuthoringMetaItems(clientProfile) : [],
        [clientProfile],
    );

    const breadcrumbItems = useMemo(
        () =>
            buildBlockAuthoringBreadcrumbs({
                clientId,
                clientName,
                planId,
                mode,
            }),
        [clientId, clientName, planId, mode],
    );

    return (
        <header
            className={AUTHORING_FOCUS_SHELL_CLASS}
            data-testid="block-authoring-focus-header"
        >
            <Breadcrumbs items={breadcrumbItems} />

            <div className={AUTHORING_FOCUS_TOP_ROW_CLASS}>
                <div className="min-w-0 flex-1 space-y-1">
                    <div className={AUTHORING_FOCUS_IDENTITY_ROW_CLASS}>
                        <h2 className={AUTHORING_FOCUS_NAME_CLASS}>
                            <span className={AUTHORING_FOCUS_NAME_GRADIENT_CLASS}>
                                {firstName}
                            </span>
                            {lastName ? ` ${lastName}` : ""}
                        </h2>

                        {metaItems.length > 0 ? (
                            <p
                                className={AUTHORING_FOCUS_META_CLASS}
                                aria-label="Contexto del cliente"
                            >
                                {metaItems.map((item, index) => (
                                    <React.Fragment key={item.label}>
                                        {index > 0 ? " · " : null}
                                        <span>
                                            {item.label}: {item.value}
                                        </span>
                                    </React.Fragment>
                                ))}
                            </p>
                        ) : (
                            <p className={AUTHORING_FOCUS_META_CLASS}>
                                Cargando contexto del cliente…
                            </p>
                        )}
                    </div>

                    <div
                        className={AUTHORING_FOCUS_TASK_TITLE_SPACER_CLASS}
                        aria-hidden
                    />
                    <p className={AUTHORING_FOCUS_TASK_SUBTITLE_CLASS}>
                        {taskSubtitle}
                    </p>
                    {showBlockPeriod ? (
                        <PlanningDateRangeMeta
                            startDate={blockStartDate!}
                            endDate={blockEndDate!}
                            className={AUTHORING_FOCUS_BLOCK_PERIOD_CLASS}
                            testId="block-authoring-period-meta"
                        />
                    ) : null}
                </div>
            </div>

            <div className={AUTHORING_FOCUS_STEPPER_ROW_CLASS}>
                <div className="min-w-0 flex-1">{stepper}</div>
                <PeriodBlockIconButton
                    variant="discard"
                    aria-label="Descartar borrador del bloque"
                    title="Descartar borrador"
                    data-testid="block-authoring-discard-btn"
                    onClick={onExit}
                >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </PeriodBlockIconButton>
            </div>
        </header>
    );
};
