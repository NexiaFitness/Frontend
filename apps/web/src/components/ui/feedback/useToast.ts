/**
 * useToast.ts — Hook para acceder al contexto de toasts
 *
 * Contexto:
 * - Hook personalizado para usar el ToastContext
 * - Lanza error si se usa fuera de ToastProvider
 * - Separado del provider para cumplir con react-refresh
 *
 * @author Frontend Team
 * @since v6.1.0
 */

import { useContext } from "react";
import { ToastContext } from "./ToastContext";

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

