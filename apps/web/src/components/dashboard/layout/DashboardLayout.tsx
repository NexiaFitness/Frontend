/**
 * Layout principal del dashboard (Trainer, Athlete, Admin).
 * Proporciona estructura base: fondo, overlays de loading/error, área de contenido.
 * 
 * Reglas:
 * - Renderiza overlay de loading y errores automáticamente.
 * - NO renderiza SideMenu: cada dashboard específico renderiza su propio SideMenu.
 * - Acepta children: cada dashboard (Trainer, Athlete, Admin) define su contenido.
 * - RESPONSIVE: Centrado en mobile/tablet, offset en desktop para sidebar.
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v4.0.0 - Limpieza de padding lateral global (para banners full width)
 */

import React from "react";
import { useSelector } from "react-redux";
import { meshGradientInverted } from "@/utils/backgrounds";
import { ToastProvider } from "@/components/ui/feedback";
import type { RootState } from "@nexia/shared/store";

interface DashboardLayoutProps {
    children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { isLoading, error } = useSelector((state: RootState) => state.auth);

    return (
        <ToastProvider>
            <div className="min-h-screen w-full" style={{ background: meshGradientInverted }}>
            {/* Overlay de loading durante logout */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
                        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-700 font-medium">Cerrando sesión...</p>
                        <p className="text-slate-500 text-sm mt-2">
                            Procesando logout de forma segura
                        </p>
                    </div>
                </div>
            )}

            {/* Error de logout */}
            {error && (
                <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-300 rounded-lg p-4 shadow-lg">
                    <p className="text-red-700 text-sm font-medium">Error durante logout</p>
                    <p className="text-red-600 text-xs mt-1">{error}</p>
                </div>
            )}

            {/* Contenido principal - offset sidebar, sin padding lateral */}
            <main className="lg:ml-80 pt-8 md:pt-10 lg:pt-12 pb-16 min-h-screen">
                {children}
            </main>
        </div>
        </ToastProvider>
    );
};
