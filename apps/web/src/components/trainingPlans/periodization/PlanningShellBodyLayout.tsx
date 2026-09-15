/**
 * PlanningShellBodyLayout — Grid F5: columna principal (izq) · sidebar (der).
 *
 * Calendario (izq) · plan activo + guía nuevo bloque (der). Misma rejilla 13/7 en explore y createWhen.
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    PLANNING_CREATE_WHEN_SIDEBAR_CLASS,
    PLANNING_SHELL_MAIN_COLUMN,
    planningShellSplitGridClass,
    type PlanningShellSplitVariant,
} from "./planningShellPresentation";

export interface PlanningShellBodyLayoutProps {
    /** Columna izquierda (calendario; en explore puede incluir PeriodBlockCard encima). */
    main: React.ReactNode;
    /** Columna derecha (plan activo + BlockCalendarRangeHint). */
    sidebar: React.ReactNode;
    variant?: PlanningShellSplitVariant;
    className?: string;
    sidebarClassName?: string;
    "data-testid"?: string;
}

export const PlanningShellBodyLayout: React.FC<PlanningShellBodyLayoutProps> = ({
    main,
    sidebar,
    variant = "explore",
    className,
    sidebarClassName,
    "data-testid": testId,
}) => {
    return (
        <div
            className={cn(planningShellSplitGridClass(variant), className)}
            data-testid={testId}
        >
            <div className={PLANNING_SHELL_MAIN_COLUMN}>{main}</div>
            <div className={cn(PLANNING_CREATE_WHEN_SIDEBAR_CLASS, sidebarClassName)}>
                {sidebar}
            </div>
        </div>
    );
};
