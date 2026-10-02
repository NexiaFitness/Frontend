/**
 * ScreenStateCard.tsx — Tarjeta glass de estado de pantalla (sin Alert duplicado).
 *
 * Contexto: NotFound, recurso no encontrado/fallo de carga, ErrorBoundary.
 * DESIGN_PREMIUM.md §2, §4.4 — primary + ghost-primary; una composición.
 *
 * @author Frontend Team
 * @since v9.2.2
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    SCREEN_STATE_ACTIONS_CLASS,
    SCREEN_STATE_BODY_CLASS,
    SCREEN_STATE_CODE_CLASS,
    SCREEN_STATE_TITLE_CLASS,
    screenStateCardClass,
} from "./screenStatePresentation";

export interface ScreenStateCardProps {
    /** Código opcional (p. ej. 404). */
    code?: string;
    title: string;
    body: string;
    /** Acciones (botones); el caller aporta jerarquía primary / ghost-primary. */
    actions?: React.ReactNode;
    /** Altura mínima del shell (ErrorBoundary route/root). */
    minHeight?: "route" | "root" | "none";
    /** role del contenedor: status (404) o alert (crash). */
    role?: "status" | "alert";
    "aria-live"?: "polite" | "assertive";
    className?: string;
    showAccentRim?: boolean;
}

export const ScreenStateCard: React.FC<ScreenStateCardProps> = ({
    code,
    title,
    body,
    actions,
    minHeight = "none",
    role = "status",
    "aria-live": ariaLive = "polite",
    className,
    showAccentRim = true,
}) => {
    return (
        <div
            className={
                className
                    ? `${screenStateCardClass({ minHeight })} ${className}`
                    : screenStateCardClass({ minHeight })
            }
            role={role}
            aria-live={ariaLive}
        >
            {showAccentRim ? <NexiaGlassAccentRim /> : null}
            {code != null && code !== "" ? (
                <p className={SCREEN_STATE_CODE_CLASS}>{code}</p>
            ) : null}
            <h1 className={SCREEN_STATE_TITLE_CLASS}>{title}</h1>
            <p className={SCREEN_STATE_BODY_CLASS}>{body}</p>
            {actions != null ? (
                <div className={SCREEN_STATE_ACTIONS_CLASS}>{actions}</div>
            ) : null}
        </div>
    );
};
