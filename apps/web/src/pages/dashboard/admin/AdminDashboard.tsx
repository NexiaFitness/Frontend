/**
 * Dashboard específico para administradores.
 * Renderiza AdminSideMenu + contenido específico utilizando DashboardLayout.
 * 
 * RESPONSIVE BEHAVIOR:
 * - Desktop: AdminSideMenu visible + DashboardLayout offset
 * - Mobile/Tablet: DashboardNavbar + AdminSideMenu hidden
 *
 * @author Frontend Team
 * @since v4.1.0 - Unified responsive behavior with DashboardNavbar
 */

import React from "react";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { AdminSideMenu } from "@/components/dashboard/admin/AdminSideMenu";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Button } from "@/components/ui/buttons";
import type { RootState } from "@nexia/shared/store";

export const AdminDashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    // Menu items para mobile navbar - Admin específico
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Usuarios", path: "/dashboard/users" },
        { label: "Entrenadores", path: "/dashboard/trainers" },
        { label: "Sistema", path: "/dashboard/system" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <>
            {/* Mobile/Tablet Navbar - visible cuando sidebar desaparece */}
            <DashboardNavbar menuItems={menuItems} />

            {/* Desktop Sidebar - oculto en mobile/tablet */}
            <AdminSideMenu />

            <DashboardLayout>
                {/* Encabezado responsive */}
                <div className="mb-8 lg:mb-12 text-center px-4 lg:px-8">
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-3 lg:mb-4">
                        Bienvenido {user?.nombre}, Panel de Administración
                    </h2>
                    <p className="text-white/80 text-sm md:text-lg lg:text-xl">
                        Gestiona usuarios, entrenadores y el sistema desde tu panel de control
                    </p>
                </div>

                {/* Cards RESPONSIVE */}
                <div className="px-4 lg:px-8 mb-12 lg:mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">156</h3>
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                Total Users
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">Active in platform</p>
                        </div>

                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">23</h3>
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                Active Trainers
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">Professional accounts</p>
                        </div>

                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 md:col-span-2 lg:col-span-1">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">98.2%</h3>
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                System Uptime
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">Last 30 days</p>
                        </div>
                    </div>
                </div>

                {/* Botones responsive */}
                <div className="px-4 lg:px-8 mb-12 lg:mb-16">
                    <div className="flex flex-col md:flex-row gap-4 lg:gap-6 justify-center max-w-2xl mx-auto">
                        <Button
                            variant="primary"
                            size="lg"
                            className="px-8 lg:px-10 py-3 lg:py-4 text-base lg:text-lg font-semibold w-full md:w-auto md:min-w-[220px]"
                        >
                            Manage Users
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="px-8 lg:px-10 py-3 lg:py-4 text-base lg:text-lg font-semibold bg-white/20 backdrop-blur-sm border border-white text-white hover:bg-white/30 w-full md:w-auto md:min-w-[220px]"
                        >
                            System Settings
                        </Button>
                    </div>
                </div>

                {/* System Activity responsive */}
                <div className="px-4 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 cursor-pointer hover:bg-white/100 transition-all group">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">
                                        System Activity
                                    </h3>
                                    <p className="text-slate-600 text-sm lg:text-base">
                                        Monitor platform usage and performance metrics
                                    </p>
                                </div>
                                <div className="text-primary-600 group-hover:text-primary-700 self-end md:self-center">
                                    <svg
                                        className="w-6 h-6 lg:w-8 lg:h-8"
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

                            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">12</div>
                                    <div className="text-xs lg:text-sm text-slate-600">New Users Today</div>
                                </div>
                                <div>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">89</div>
                                    <div className="text-xs lg:text-sm text-slate-600">Active Sessions</div>
                                </div>
                                <div>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">245</div>
                                    <div className="text-xs lg:text-sm text-slate-600">Daily Logins</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};