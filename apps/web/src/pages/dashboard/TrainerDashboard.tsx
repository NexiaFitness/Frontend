/**
 * Dashboard específico para entrenadores.
 * Renderiza TrainerSideMenu + contenido específico utilizando DashboardLayout.
 *
 * Reglas:
 * - Integra TrainerSideMenu para navegación específica de trainer
 * - Toda la lógica visual del entrenador se mantiene aquí, no en el layout
 * - Se apoya en componentes reutilizables como Button
 * - Compatible con la arquitectura de roles: cada rol tendrá su propio dashboard
 * - Muestra nombre real del usuario autenticado
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v3.2.0 - Añadido nombre dinámico del usuario
 */

import React from "react";
import { useSelector } from "react-redux";
import { DashboardLayout } from "@/components/dashboard/layout";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { Button } from "@/components/ui/buttons";
import type { RootState } from "@shared/store";

export const TrainerDashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <>
            {/* TrainerSideMenu específico */}
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Encabezado de bienvenida */}
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

                {/* Botones de acciones principales */}
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

                {/* Clientes recientes */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 cursor-pointer hover:bg-white/100 transition-all group">
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
            </DashboardLayout>
        </>
    );
};