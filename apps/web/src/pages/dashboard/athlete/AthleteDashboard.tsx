/**
 * Dashboard específico para atletas/clientes.
 * Renderiza AthleteSideMenu + contenido específico utilizando DashboardLayout.
 * 
 * RESPONSIVE BEHAVIOR:
 * - Desktop: AthleteSideMenu visible + DashboardLayout offset
 * - Mobile/Tablet: DashboardNavbar + AthleteSideMenu hidden
 *
 * @author Frontend Team
 * @since v4.1.0 - Unified responsive behavior with DashboardNavbar
 */

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout";
import { AthleteSideMenu } from "@/components/dashboard/athlete/AthleteSideMenu";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";
import type { RootState } from "@nexia/shared/store";

export const AthleteDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    // Menu items para mobile navbar - Athlete específico
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Mi Plan", path: "/dashboard/my-plan" },
        { label: "Mis Sesiones", path: "/dashboard/sessions" },
        { label: "Progreso", path: "/dashboard/progress" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <>
            {/* Mobile/Tablet Navbar - visible cuando sidebar desaparece */}
            <DashboardNavbar menuItems={menuItems} />

            {/* Desktop Sidebar - oculto en mobile/tablet */}
            <AthleteSideMenu />

            <DashboardLayout>
                {/* Header */}
                <div className="mb-6 lg:mb-8 text-center px-4 lg:px-8">
                    <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                        Bienvenido {user?.nombre}, a tu Panel de Entrenamiento
                    </h2>
                    <p className="text-white/80 text-sm md:text-base">
                        Sigue tu progreso y accede a tus planes de entrenamiento personalizados
                    </p>
                </div>

                {/* Cards RESPONSIVE */}
                <div className="px-4 lg:px-8 mb-12 lg:mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">12</h3>
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                Sessions This Week
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">Completed</p>
                        </div>

                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">85%</h3>
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                Goal Progress
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">Monthly target</p>
                        </div>

                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 md:col-span-2 lg:col-span-1">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">+5kg</h3>
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                Strength Gain
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">Last month</p>
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
                            onClick={() => navigate("/dashboard/my-plan")}
                        >
                            View My Plan
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="px-8 lg:px-10 py-3 lg:py-4 text-base lg:text-lg font-semibold bg-white/20 backdrop-blur-sm border border-white text-white hover:bg-white/30 w-full md:w-auto md:min-w-[220px]"
                            onClick={() => navigate("/dashboard/sessions")}
                        >
                            Log Workout
                        </Button>
                    </div>
                </div>

                {/* Upcoming Sessions responsive */}
                <div className="px-4 lg:px-8 pb-20 lg:pb-24">
                    <div className="max-w-4xl mx-auto">
                        <div 
                            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 cursor-pointer hover:bg-white/100 transition-all group"
                            onClick={() => navigate("/dashboard/sessions")}
                        >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">
                                        Upcoming Sessions
                                    </h3>
                                    <p className="text-slate-600 text-sm lg:text-base">
                                        Your scheduled training sessions and progress tracking
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
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">3</div>
                                    <div className="text-xs lg:text-sm text-slate-600">Next 7 Days</div>
                                </div>
                                <div>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">18</div>
                                    <div className="text-xs lg:text-sm text-slate-600">This Month</div>
                                </div>
                                <div>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">92%</div>
                                    <div className="text-xs lg:text-sm text-slate-600">Completion Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};