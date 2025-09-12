/**
 * Layout principal del dashboard (Trainer, Athlete, Admin).
 * Orquesta el SideMenu (navegación lateral) y el área de contenido principal.
 * ACTUALIZADO: Main content con offset para sidebar fijo profesional
 *
 * Reglas:
 * - Usa createAsyncThunk (logout) para gestión profesional del cierre de sesión.
 * - Renderiza overlay de loading y errores de logout automáticamente.
 * - Integra SideMenu modularizado para navegación clara y escalable.
 * - Acepta children: si hay contenido, lo muestra; si no, renderiza el overview (métricas).
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v2.4.0 - Fixed sidebar layout con consistencia visual
 */

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { meshGradientInverted } from "@/utils/backgrounds";
import { logout } from "@shared/store/authSlice";
import type { AppDispatch, RootState } from "@shared/store";
import { SideMenu } from "./SideMenu";

interface DashboardLayoutProps {
    children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user, isLoading, error } = useSelector(
        (state: RootState) => state.auth
    );

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            navigate("/auth/login", { replace: true });
        } catch (logoutError) {
            console.warn("Logout completed with warnings:", logoutError);
            navigate("/auth/login", { replace: true });
        }
    };

    return (
        <div
            className="min-h-screen"
            style={{ background: meshGradientInverted }}
        >
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

            {/* SideMenu modular - Fixed positioning */}
            <SideMenu />

            {/* Contenido principal - Con offset para sidebar fijo */}
            <main className="ml-80 p-12 pt-20 min-h-screen">
                {children ? (
                    children
                ) : (
                    <>
                        <div className="mb-12 text-center">
                            <h2 className="text-5xl font-bold text-white mb-4">
                                Bienvenido de vuelta, {user?.nombre}
                            </h2>
                            <p className="text-white/80 text-xl">
                                Gestiona tus clientes y entrenamientos desde tu panel profesional
                            </p>
                        </div>

                        {/* Cards de métricas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 mt-12">
                            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                                <h3 className="text-4xl font-bold text-slate-800 mb-2">16</h3>
                                <p className="text-xl font-semibold text-slate-700 mb-1">
                                    Active Clients
                                </p>
                                <p className="text-slate-600">High commitment level</p>
                            </div>
                            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                                <h3 className="text-4xl font-bold text-slate-800 mb-2">8</h3>
                                <p className="text-xl font-semibold text-slate-700 mb-1">
                                    Sessions Today
                                </p>
                                <p className="text-slate-600">Scheduled</p>
                            </div>
                            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                                <h3 className="text-4xl font-bold text-slate-800 mb-2">24</h3>
                                <p className="text-xl font-semibold text-slate-700 mb-1">
                                    Plans Created
                                </p>
                                <p className="text-slate-600">This month</p>
                            </div>
                        </div>

                        {/* Botones con ancho uniforme */}
                        <div className="flex gap-6 justify-center mb-16">
                            <Button
                                variant="primary"
                                size="lg"
                                className="px-10 py-4 text-lg font-semibold min-w-[220px]"
                            >
                                Add New Client
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="px-10 py-4 text-lg font-semibold bg-white/20 backdrop-blur-sm border border-white text-white hover:bg-white/30 min-w-[220px]"
                            >
                                Training Planning
                            </Button>
                        </div>

                        {/* Recent Clients card */}
                        <div className="max-w-4xl mx-auto">
                            <div
                                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 cursor-pointer hover:bg-white/100 transition-all group"
                                onClick={() => console.log("Navigate to clients")}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                            Recent Clients
                                        </h3>
                                        <p className="text-slate-600">
                                            View and manage your training partners
                                        </p>
                                    </div>
                                    <div className="text-primary-600 group-hover:text-primary-700">
                                        <svg
                                            className="w-8 h-8"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-between text-center">
                                    <div>
                                        <div className="text-3xl font-bold text-slate-800">4</div>
                                        <div className="text-sm text-slate-600">Active Today</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-slate-800">12</div>
                                        <div className="text-sm text-slate-600">This Week</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-slate-800">45</div>
                                        <div className="text-sm text-slate-600">Total Clients</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};