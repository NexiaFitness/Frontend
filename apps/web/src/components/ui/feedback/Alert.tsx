/**
 * Alert.tsx — Alerta unificada de feedback inline (apps/web).
 *
 * Contexto: capa de feedback premium (DESIGN_PREMIUM.md §3, §5.2). API con
 * title/description/action/onDismiss/icon; contrato ARIA en alertContract.ts.
 *
 * Notas de mantenimiento: diferimiento packages/ui-* (agent.md §6) — extracción
 * futura mueve contrato + presentation + este componente. No usar para Toast
 * ni pantallas NotFound/ErrorBoundary enteras.
 *
 * @author Frontend Team
 * @since v2.6.0
 * @updated v9.2.0 — API unificada + ARIA por variante
 */

import React from "react";

import { NexiaSemanticIcon } from "./NexiaSemanticIcon";
import type { NexiaSemanticTone } from "./nexiaSemanticIconPresentation";
import {
    alertAriaLive,
    alertAriaRole,
    type AlertVariant,
} from "./alertContract";
import {
    ALERT_ACTION_ROW_CLASS,
    ALERT_ACTION_SLOT_CLASS,
    ALERT_BODY_CLASS,
    ALERT_DESCRIPTION_CLASS,
    ALERT_ICON_WRAP_CLASS,
    ALERT_TITLE_CLASS,
    alertDismissButtonClass,
    alertRootClass,
} from "./alertPresentation";

export type { AlertVariant } from "./alertContract";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant;
    /** Título opcional (línea principal). */
    title?: React.ReactNode;
    /** Descripción opcional; si no hay title/description, se usa children. */
    description?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    onDismiss?: () => void;
    /** Acciones (Reintentar, enlace, etc.). */
    action?: React.ReactNode;
    /**
     * Icono semántico por defecto; `false` lo oculta; ReactNode lo sustituye.
     * @default true
     */
    icon?: boolean | React.ReactNode;
}

const toneByVariant: Record<AlertVariant, NexiaSemanticTone> = {
    info: "info",
    success: "success",
    warning: "warning",
    error: "error",
};

export const Alert: React.FC<AlertProps> = ({
    variant = "info",
    title,
    description,
    children,
    className = "",
    onDismiss,
    action,
    icon = true,
    ...rest
}) => {
    const role = alertAriaRole(variant);
    const live = alertAriaLive(variant);

    const body =
        title != null || description != null ? (
            <>
                {title != null ? <p className={ALERT_TITLE_CLASS}>{title}</p> : null}
                {description != null ? (
                    <div className={title != null ? ALERT_DESCRIPTION_CLASS : ALERT_BODY_CLASS}>
                        {description}
                    </div>
                ) : null}
                {children != null ? (
                    <div className={title != null || description != null ? ALERT_DESCRIPTION_CLASS : undefined}>
                        {children}
                    </div>
                ) : null}
            </>
        ) : (
            children
        );

    const iconNode =
        icon === false ? null : icon === true ? (
            <NexiaSemanticIcon
                tone={toneByVariant[variant]}
                className={ALERT_ICON_WRAP_CLASS}
            />
        ) : (
            <span className={ALERT_ICON_WRAP_CLASS}>{icon}</span>
        );

    return (
        <div
            className={alertRootClass(variant, className)}
            role={role}
            aria-live={live}
            {...rest}
        >
            {iconNode}
            {action ? (
                <div className={ALERT_ACTION_ROW_CLASS}>
                    <div className={ALERT_BODY_CLASS}>{body}</div>
                    <div className={ALERT_ACTION_SLOT_CLASS}>{action}</div>
                </div>
            ) : (
                <div className={ALERT_BODY_CLASS}>{body}</div>
            )}
            {onDismiss ? (
                <button
                    type="button"
                    onClick={onDismiss}
                    className={alertDismissButtonClass(variant)}
                    aria-label="Cerrar alerta"
                >
                    ×
                </button>
            ) : null}
        </div>
    );
};
