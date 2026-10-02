/**
 * Alert.tsx — Alerta unificada de feedback inline (apps/web).
 *
 * Contexto: capa de feedback premium (DESIGN_PREMIUM.md §3, §5.2, §4.4).
 * API title/description/action/onDismiss/icon; ARIA en alertContract.ts.
 * Criterio pantalla vs Alert: si quitando el mensaje no queda contenido útil,
 * usar tarjeta de estado de pantalla (B2/B3), no este componente.
 *
 * Notas de mantenimiento: diferimiento packages/ui-* (agent.md §6). Acción
 * interna: una sola, Button ghost-primary (nunca outline-primary).
 *
 * @author Frontend Team
 * @since v2.6.0
 * @updated v9.2.1 — CircleAlert error; slots 1ª línea; Cerrar aviso
 */

import React from "react";
import { X } from "lucide-react";

import { NexiaSemanticIcon } from "./NexiaSemanticIcon";
import type { NexiaSemanticTone } from "./nexiaSemanticIconPresentation";
import {
    alertAriaLive,
    alertAriaRole,
    type AlertVariant,
} from "./alertContract";
import {
    ALERT_ACTION_SLOT_CLASS,
    ALERT_BODY_CLASS,
    ALERT_CONTENT_COLUMN_CLASS,
    ALERT_DESCRIPTION_CLASS,
    ALERT_FIRST_LINE_SLOT_CLASS,
    ALERT_TITLE_CLASS,
    alertDismissButtonClass,
    alertRootClass,
} from "./alertPresentation";

export type { AlertVariant } from "./alertContract";

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    variant?: AlertVariant;
    /** Título opcional (línea principal). */
    title?: React.ReactNode;
    /** Descripción opcional; si no hay title/description, se usa children. */
    description?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    onDismiss?: () => void;
    /** Una sola acción (ghost-primary). En estrecho baja bajo el texto. */
    action?: React.ReactNode;
    /**
     * Icono semántico por defecto; `false` lo oculta; ReactNode lo sustituye.
     * @default true
     */
    icon?: boolean | React.ReactNode;
    /** Densidad reducida (callouts atleta / filas). */
    compact?: boolean;
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
    compact = false,
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
                    <div
                        className={
                            title != null || description != null
                                ? ALERT_DESCRIPTION_CLASS
                                : undefined
                        }
                    >
                        {children}
                    </div>
                ) : null}
            </>
        ) : (
            children
        );

    const iconNode =
        icon === false ? null : icon === true ? (
            <span className={ALERT_FIRST_LINE_SLOT_CLASS} data-testid="alert-icon-slot">
                <NexiaSemanticIcon
                    tone={toneByVariant[variant]}
                    size={compact ? "sm" : "md"}
                />
            </span>
        ) : (
            <span className={ALERT_FIRST_LINE_SLOT_CLASS} data-testid="alert-icon-slot">
                {icon}
            </span>
        );

    return (
        <div
            className={alertRootClass(variant, className, compact)}
            role={role}
            aria-live={live}
            {...rest}
        >
            {iconNode}
            {action ? (
                <div className={ALERT_CONTENT_COLUMN_CLASS}>
                    <div className={ALERT_BODY_CLASS}>{body}</div>
                    <div className={ALERT_ACTION_SLOT_CLASS}>{action}</div>
                </div>
            ) : (
                <div className={ALERT_BODY_CLASS}>{body}</div>
            )}
            {onDismiss ? (
                <span className={ALERT_FIRST_LINE_SLOT_CLASS} data-testid="alert-dismiss-slot">
                    <button
                        type="button"
                        onClick={onDismiss}
                        className={alertDismissButtonClass(variant)}
                        aria-label="Cerrar aviso"
                    >
                        <X className="size-4" aria-hidden />
                    </button>
                </span>
            ) : null}
        </div>
    );
};
