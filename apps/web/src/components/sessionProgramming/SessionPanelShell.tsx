/**
 * SessionPanelShell — Contenedor de sección (Constructor de sesión, Alineación con el plan, etc.).
 * Patrón: borde surface/20, cabecera con título + subtítulo opcional, cuerpo con padding.
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    SESSION_PROGRAMMING_PANEL,
    SESSION_PROGRAMMING_PANEL_BODY,
    SESSION_PROGRAMMING_PANEL_HEADER,
    SESSION_PROGRAMMING_PANEL_SUBTITLE,
    SESSION_PROGRAMMING_PANEL_TITLE,
} from "./sessionProgrammingPresentation";

export interface SessionPanelShellProps {
    title: string;
    subtitle?: string;
    headerAccessory?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    bodyClassName?: string;
}

export const SessionPanelShell: React.FC<SessionPanelShellProps> = ({
    title,
    subtitle,
    headerAccessory,
    children,
    className,
    bodyClassName,
}) => {
    return (
        <div className={cn(SESSION_PROGRAMMING_PANEL, className)}>
            <div className={SESSION_PROGRAMMING_PANEL_HEADER}>
                <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <h3 className={cn(SESSION_PROGRAMMING_PANEL_TITLE, "truncate")}>{title}</h3>
                        {subtitle ? (
                            <p className={SESSION_PROGRAMMING_PANEL_SUBTITLE}>{subtitle}</p>
                        ) : null}
                    </div>
                    {headerAccessory ? (
                        <div className="flex shrink-0 items-center">{headerAccessory}</div>
                    ) : null}
                </div>
            </div>
            <div className={cn(SESSION_PROGRAMMING_PANEL_BODY, bodyClassName)}>{children}</div>
        </div>
    );
};
