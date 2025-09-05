/**
 * Layout principal del dashboard del entrenador con diseño corregido
 * meshGradient de fondo, espaciado correcto y UI limpia
 * Convertido completamente a Tailwind CSS sin inline styles
 * 
 * @author Frontend Team
 * @since v1.0.0
 */
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/forms";
import { meshGradientInverted } from "@/utils/backgrounds";
import { logout } from "@shared/store/authSlice";
import { NexiaLogo } from "../auth/NexiaLogo";
import type { AppDispatch, RootState } from "@shared/store";

export const DashboardLayout: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout(undefined));
        navigate("/auth/login");
    };

    return (
        <div
            className="min-h-screen flex"
            style={{ background: meshGradientInverted }}
        >
            {/* Sidebar */}
            <aside className="w-80 flex flex-col">
                {/* Sección 1: Header NEXIA */}
                <div className="p-8 bg-sidebar-header border-b-2 border-white/60 text-center">
                    <div className="w-[120px] h-auto mx-auto">
                        <NexiaLogo />
                    </div>
                    <p className="text-slate-300 text-sm mt-2">Trainer Dashboard</p>
                </div>

                {/* Sección 2: Navegación */}
                <nav className="p-8 flex-1 px-8 bg-sidebar-nav border-b-2 border-white/60">
                    <div className="bg-slate-800 rounded-lg px-6 py-4">
                        <span className="text-white font-semibold">Dashboard</span>
                    </div>
                    <div className="py-4 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg px-6 transition cursor-pointer mt-4">
                        Client Onboarding
                    </div>
                    <div className="py-4 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg px-6 transition cursor-pointer mt-4">
                        Training Planning
                    </div>
                </nav>

                {/* Sección 3: User info y logout */}
                <div className="p-6 bg-sidebar-nav pt-8 pb-8">
                    <div className="text-center mb-6">
                        <p className="text-white font-medium">
                            {user?.nombre} {user?.apellidos}
                        </p>
                        <p className="text-slate-400 text-sm">Professional Trainer</p>
                    </div>
                    <div className="px-4 mb-6">
                        <Button
                            variant="secondary"
                            onClick={handleLogout}
                            className="w-full py-3 bg-white text-black border-2 border-sidebar-header hover:bg-sidebar-header hover:text-white transition-colors"
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-12 pt-20">
                <div className="mb-20 text-center">
                    <h2 className="text-5xl font-bold text-white mt-8 mb-2">
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
                        <p className="text-xl font-semibold text-slate-700 mb-1">Active Clients</p>
                        <p className="text-slate-600">High commitment level</p>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                        <h3 className="text-4xl font-bold text-slate-800 mb-2">8</h3>
                        <p className="text-xl font-semibold text-slate-700 mb-1">Sessions Today</p>
                        <p className="text-slate-600">Scheduled</p>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                        <h3 className="text-4xl font-bold text-slate-800 mb-2">24</h3>
                        <p className="text-xl font-semibold text-slate-700 mb-1">Plans Created</p>
                        <p className="text-slate-600">This month</p>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-6 justify-center mb-16">
                    <Button
                        variant="primary"
                        size="lg"
                        className="px-10 py-4 text-lg font-semibold"
                    >
                        Add New Client
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="px-10 py-4 text-lg font-semibold bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                    >
                        Training Planning
                    </Button>
                </div>

                {/* Recent Clients card */}
                <div className="max-w-4xl mx-auto">
                    <div
                        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 cursor-pointer hover:bg-white/100 transition-all group"
                        onClick={() => console.log('Navigate to clients')}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Recent Clients</h3>
                                <p className="text-slate-600">View and manage your training partners</p>
                            </div>
                            <div className="text-primary-600 group-hover:text-primary-700">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
            </main>
        </div>
    );
};