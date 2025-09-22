/**
 * TrainerDashboard - RESPONSIVE GRID SYSTEM
 * 
 * Mobile: 1 columna (cards apiladas) - CENTRADO
 * Tablet: 2 columnas - CENTRADO  
 * Desktop: 3 columnas - CON SIDEBAR
 * 
 * + Navbar mobile cuando sidebar desaparece
 */

import React from "react";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Button } from "@/components/ui/buttons";
import type { RootState } from "@shared/store";

export const TrainerDashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    // Menu items para mobile navbar
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/plans" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <>
            {/* Mobile/Tablet Navbar - visible cuando sidebar desaparece */}
            <DashboardNavbar menuItems={menuItems} />

            {/* Desktop Sidebar - oculto en mobile/tablet */}
            <TrainerSideMenu />

            {/* LAYOUT SIN WRAPPER - DashboardLayout maneja el responsive offset */}
            <DashboardLayout>
                {/* Encabezado responsive */}
                <div className="mb-8 lg:mb-12 text-center px-4 lg:px-8">
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-3 lg:mb-4">
                        Bienvenido de vuelta, {user?.nombre}
                    </h2>
                    <p className="text-white/80 text-sm md:text-lg lg:text-xl">
                        Gestiona tus clientes y entrenamientos desde tu panel profesional
                    </p>
                </div>

                {/* Cards RESPONSIVE */}
                <div className="px-4 lg:px-8 mb-12 lg:mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">16</h3>
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                Active Clients
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">High commitment level</p>
                        </div>
                        
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">8</h3>
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                Sessions Today
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">Scheduled</p>
                        </div>
                        
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 md:col-span-2 lg:col-span-1">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">24</h3>
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                Plans Created
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">This month</p>
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
                            Add New Client
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="px-8 lg:px-10 py-3 lg:py-4 text-base lg:text-lg font-semibold bg-white/20 backdrop-blur-sm border border-white text-white hover:bg-white/30 w-full md:w-auto md:min-w-[220px]"
                        >
                            Training Planning
                        </Button>
                    </div>
                </div>

                {/* Recent Clients responsive */}
                <div className="px-4 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 cursor-pointer hover:bg-white/100 transition-all group">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">
                                        Recent Clients
                                    </h3>
                                    <p className="text-slate-600 text-sm lg:text-base">
                                        View and manage your training partners
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
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">4</div>
                                    <div className="text-xs lg:text-sm text-slate-600">Active Today</div>
                                </div>
                                <div>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">12</div>
                                    <div className="text-xs lg:text-sm text-slate-600">This Week</div>
                                </div>
                                <div>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">45</div>
                                    <div className="text-xs lg:text-sm text-slate-600">Total Clients</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};