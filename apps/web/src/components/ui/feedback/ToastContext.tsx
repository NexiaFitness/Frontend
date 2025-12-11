/**
 * ToastContext.tsx — Contexto React para sistema de toasts
 *
 * Contexto:
 * - Define el contexto y tipos para el sistema de toasts
 * - Separado del provider para cumplir con react-refresh
 *
 * @author Frontend Team
 * @since v6.1.0
 */

import { createContext } from "react";
import type { ToastVariant } from "./Toast";

export interface ToastContextType {
    showToast: (variant: ToastVariant, message: string, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);


