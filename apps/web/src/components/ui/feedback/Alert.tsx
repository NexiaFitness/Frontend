/**
 * Alert.tsx — Componente de alertas reutilizable
 *
 * Contexto:
 * - Alertas para diferentes contextos: info, success, warning, error.
 * - Usa tokens de diseño de la app (primary, success, warning, destructive).
 * - Botón de cierre opcional (onDismiss).
 * - Prop opcional `action` para botones (ej. Reintentar) con gap y alineación respecto al texto.
 * - Iconos Lucide en trazo (`NexiaSemanticIcon`), sin SVG rellenos.
 * - Accesibilidad con role="alert"
 *
 * @author Frontend Team
 * @since v2.6.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import { NexiaSemanticIcon } from "./NexiaSemanticIcon";
import type { NexiaSemanticTone } from "./nexiaSemanticIconPresentation";

interface AlertProps {
    variant?: "info" | "success" | "warning" | "error";
    children: React.ReactNode;
    className?: string;
    onDismiss?: () => void;
    /** Botones u otras acciones: se separan del mensaje con gap y alineación vertical */
    action?: React.ReactNode;
}

/** Estilos por variante usando tokens de la app (sin fondos blancos) */
const variantStyles = {
    info: {
        container: "bg-primary/10 border border-primary/30",
        text: "text-foreground",
        dismissButton: "text-primary/80 hover:text-primary",
    },
    success: {
        container: "bg-success/10 border border-success/30",
        text: "text-foreground",
        dismissButton: "text-success/80 hover:text-success",
    },
    warning: {
        container: "bg-warning/10 border border-warning/30",
        text: "text-foreground",
        dismissButton: "text-warning/80 hover:text-warning",
    },
    error: {
        container: "bg-destructive/10 border border-destructive/30",
        text: "text-foreground",
        dismissButton: "text-destructive/80 hover:text-destructive",
    },
};

const toneByVariant: Record<
    NonNullable<AlertProps["variant"]>,
    NexiaSemanticTone
> = {
    info: "info",
    success: "success",
    warning: "warning",
    error: "error",
};

export const Alert: React.FC<AlertProps> = ({
    variant = "info",
    children,
    className = "",
    onDismiss,
    action,
}) => {
    const styles = variantStyles[variant];

    return (
        <div
            className={cn(
                "relative flex items-start gap-3 rounded-lg border p-4",
                styles.container,
                className
            )}
            role="alert"
        >
            <NexiaSemanticIcon
                tone={toneByVariant[variant]}
                className="mt-0.5"
            />
            {action ? (
                <div
                    className={cn(
                        "flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                        styles.text
                    )}
                >
                    <div className="min-w-0 flex-1 text-sm leading-snug">{children}</div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                        {action}
                    </div>
                </div>
            ) : (
                <div className={cn("min-w-0 flex-1 text-sm leading-snug", styles.text)}>{children}</div>
            )}
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className={`absolute top-3 right-3 text-sm ${styles.dismissButton}`}
                    aria-label="Cerrar alerta"
                >
                    ×
                </button>
            )}
        </div>
    );
};