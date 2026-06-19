/**
 * Toast.tsx — Notificación toast NEXIA (glass neutro, sin animación).
 */

import React, { useEffect, useCallback } from "react";
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    NEXIA_TOAST_CLOSE,
    NEXIA_TOAST_CONTAINER,
    NEXIA_TOAST_ICON,
    NEXIA_TOAST_MESSAGE,
    NEXIA_TOAST_VARIANT,
} from "./toastPresentation";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastProps {
    id: string;
    variant: ToastVariant;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
} as const;

export const Toast: React.FC<ToastProps> = ({
    id,
    variant,
    message,
    duration = 4000,
    onClose,
}) => {
    const styles = NEXIA_TOAST_VARIANT[variant];
    const Icon = ICONS[variant];

    const handleClose = useCallback(() => {
        onClose(id);
    }, [id, onClose]);

    useEffect(() => {
        const timer = window.setTimeout(handleClose, duration);
        return () => window.clearTimeout(timer);
    }, [duration, handleClose]);

    return (
        <div
            className={cn(NEXIA_TOAST_CONTAINER, styles.container)}
            role="alert"
            aria-live="polite"
        >
            <Icon className={cn(NEXIA_TOAST_ICON, styles.icon)} aria-hidden />
            <p className={NEXIA_TOAST_MESSAGE}>{message}</p>
            <button
                type="button"
                onClick={handleClose}
                className={cn(NEXIA_TOAST_CLOSE, styles.close)}
                aria-label="Cerrar notificación"
            >
                <X className="size-4" aria-hidden />
            </button>
        </div>
    );
};
