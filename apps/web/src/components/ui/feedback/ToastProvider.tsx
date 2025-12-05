/**
 * ToastProvider.tsx — Provider y contexto para sistema de toasts
 *
 * Contexto:
 * - Gestiona estado global de toasts
 * - Proporciona funciones para mostrar/ocultar toasts
 * - Renderiza contenedor de toasts con posicionamiento fijo
 * - Auto-gestiona IDs únicos para cada toast
 *
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Toast, type ToastVariant } from "./Toast";

export interface ToastItem {
    id: string;
    variant: ToastVariant;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (variant: ToastVariant, message: string, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (variant: ToastVariant, message: string, duration?: number) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            setToasts((prev) => [...prev, { id, variant, message, duration }]);
        },
        []
    );

    const showSuccess = useCallback(
        (message: string, duration?: number) => {
            showToast("success", message, duration);
        },
        [showToast]
    );

    const showError = useCallback(
        (message: string, duration?: number) => {
            showToast("error", message, duration);
        },
        [showToast]
    );

    const showWarning = useCallback(
        (message: string, duration?: number) => {
            showToast("warning", message, duration);
        },
        [showToast]
    );

    const showInfo = useCallback(
        (message: string, duration?: number) => {
            showToast("info", message, duration);
        },
        [showToast]
    );

    const value: ToastContextType = {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Contenedor de toasts - posición fija esquina superior derecha */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast
                            id={toast.id}
                            variant={toast.variant}
                            message={toast.message}
                            duration={toast.duration}
                            onClose={removeToast}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

