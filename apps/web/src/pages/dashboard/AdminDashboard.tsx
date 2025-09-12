/**
 * Dashboard específico para administradores.
 * Renderiza AdminSideMenu + contenido específico utilizando DashboardLayout.
 *
 * Reglas:
 * - Integra AdminSideMenu para navegación específica de admin
 * - Toda la lógica visual del administrador se mantiene aquí, no en el layout
 * - Se apoya en componentes reutilizables como Button
 * - Compatible con la arquitectura de roles: cada rol tendrá su propio dashboard
 * - Muestra nombre real del usuario autenticado
 *
 * @author Frontend Team
 * @since v3.1.0 - Dashboard específico para administradores
 * @updated v3.2.0 - Añadido nombre dinámico del usuario
 */

import React from "react";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { AdminSideMenu } from "@/components/dashboard/admin/AdminSideMenu";
import { Button } from "@/components/ui/buttons";
import type { RootState } from "@shared/store";

export const AdminDashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <>
            {/* AdminSideMenu específico */}
            <AdminSideMenu />
            
            <DashboardLayout>
                {/* Encabezado de bienvenida */}
                <div className="mb-12 text-center">
                    <h2 className="text-5xl font-bold text-white mb-4">
                        Bienvenido {user?.nombre}, Panel de Administración
                    </h2>
                    <p className="text-white/80 text-xl">
                        Gestiona usuarios, entrenadores y el sistema desde tu panel de control
                    </p>
                </div>

                {/* Cards de métricas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 mt-12">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                        <h3 className="text-4xl font-bold text-slate-800 mb-2">156</h3>
                        <p className="text-xl font-semibold text-slate-700 mb-1">
                            Total Users
                        </p>
                        <p className="text-slate-600">Active in platform</p>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                        <h3 className="text-4xl font-bold text-slate-800 mb-2">23</h3>
                        <p className="text-xl font-semibold text-slate-700 mb-1">
                            Active Trainers
                        </p>
                        <p className="text-slate-600">Professional accounts</p>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                        <h3 className="text-4xl font-bold text-slate-800 mb-2">98.2%</h3>
                        <p className="text-xl font-semibold text-slate-700 mb-1">
                            System Uptime
                        </p>
                        <p className="text-slate-600">Last 30 days</p>
                    </div>
                </div>

                {/* Botones de acciones principales */}
                <div className="flex gap-6 justify-center mb-16">
                    <Button
                        variant="primary"
                        size="lg"
                        className="px-10 py-4 text-lg font-semibold min-w-[220px]"
                    >
                        Manage Users
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="px-10 py-4 text-lg font-semibold bg-white/20 backdrop-blur-sm border border-white text-white hover:bg-white/30 min-w-[220px]"
                    >
                        System Settings
                    </Button>
                </div>

                {/* Panel de actividad del sistema */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 cursor-pointer hover:bg-white/100 transition-all group">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                    System Activity
                                </h3>
                                <p className="text-slate-600">
                                    Monitor platform usage and performance metrics
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
                                <div className="text-3xl font-bold text-slate-800">12</div>
                                <div className="text-sm text-slate-600">New Users Today</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">89</div>
                                <div className="text-sm text-slate-600">Active Sessions</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">245</div>
                                <div className="text-sm text-slate-600">Daily Logins</div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};