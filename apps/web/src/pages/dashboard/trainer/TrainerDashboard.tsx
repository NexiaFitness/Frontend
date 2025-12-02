/**
 * TrainerDashboard.tsx — Panel principal del entrenador.
 * 
 * Contexto:
 * Vista principal dentro del área privada de un usuario con rol "Trainer".
 * Renderiza la interfaz del dashboard con estructura responsive según diseño Figma v2.
 * Integra widgets de KPIs, billing, progreso de clientes y alertas prioritarias.
 * 
 * Notas de mantenimiento:
 * - EmailVerificationBanner y CompleteProfileBanner se renderizan condicionalmente
 * - Usa datos reales de backend: Stats, Improvement, Satisfaction, Adherence, Billing, Progress, Alerts
 * - Mantener gradiente mesh de fondo corporativo NEXIA
 * - TODO EN ESPAÑOL según diseño final
 * - ORDEN FIGMA: KPIs → (Alerts + Actions) → (Billing + Progress)
 * 
 * @author Frontend Team
 * @since v2.4.1
 * @updated v5.0.0 - Refactor completo según diseño Figma v2 (orden correcto + español)
 */

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { CompleteProfileBanner, EmailVerificationBanner } from "@/components/dashboard/shared";
import { CompleteProfileModal } from "@/components/dashboard/modals";
import {
    KPICard,
    ClientBillingChart,
    ClientProgressWidget,
    PriorityAlertsWidget,
} from "@/components/dashboard/trainer/widgets";
import {
    useClientStats,
    useCompleteProfileModal,
    useClientImprovement,
    useClientSatisfaction,
    usePlanAdherence,
} from "@nexia/shared";
import { baseApi } from "@nexia/shared/api/baseApi";
import type { RootState, AppDispatch } from "@nexia/shared/store";

export const TrainerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    
    // ✅ CRÍTICO: TODOS los hooks deben ejecutarse ANTES del early return
    // Hooks de datos reales
    const {
        getTotalClients,
        isLoading: isLoadingStats,
        isError: isErrorStats,
    } = useClientStats();

    // Hooks de KPIs del dashboard (datos reales del backend)
    const clientImprovement = useClientImprovement();
    const clientSatisfaction = useClientSatisfaction();
    const planAdherence = usePlanAdherence();

    // Estado del modal de Complete Profile
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

    // Hook para verificar si perfil está completo
    const { isProfileComplete } = useCompleteProfileModal();
    
    // ✅ FASE 2.1: Cleanup en useEffect para cancelar queries cuando se desautentica
    useEffect(() => {
        if (!isAuthenticated) {
            // Cancelar todas las queries cuando se desautentica
            dispatch(baseApi.util.resetApiState());
        }
    }, [isAuthenticated, dispatch]);
    
    // Early return si no está autenticado (DESPUÉS de todos los hooks)
    if (!isAuthenticated) {
        return null;
    }

    // Items del menú superior
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    // Formatear fecha en español
    const currentDate = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            {/* Navbar móvil / tablet */}
            <DashboardNavbar menuItems={menuItems} />

            {/* Sidebar escritorio */}
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Header con nombre y fecha */}
                <div className="mb-6 lg:mb-8 text-center px-4 lg:px-8">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                        ¡Bienvenido de vuelta, {user?.nombre}!
                    </h2>
                    <p className="text-white/80 text-sm md:text-base lg:text-lg capitalize">
                        {currentDate}
                    </p>
                </div>

                {/* Banner de verificación de email (prioridad ALTA) */}
                <EmailVerificationBanner user={user} />

                {/* Banner de perfil incompleto */}
                <CompleteProfileBanner user={user} isProfileComplete={isProfileComplete} />

                {/* 4 KPI Cards */}
                <div className="px-4 lg:px-8 mb-8 lg:mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Total Clients - REAL */}
                        <KPICard
                            value={getTotalClients()}
                            trend="+8%"
                            label="Total de Clientes"
                            description="vs mes anterior"
                            isLoading={isLoadingStats}
                        />

                        {/* Avg Client Improvement - REAL */}
                        <KPICard
                            value={`${clientImprovement.value}%`}
                            trend={clientImprovement.trend}
                            label="Progreso Promedio"
                            description="en todos los programas"
                            isLoading={clientImprovement.isLoading}
                        />

                        {/* Client Satisfaction - REAL */}
                        <KPICard
                            value={clientSatisfaction.value}
                            trend={clientSatisfaction.trend}
                            label="Satisfacción del Cliente"
                            description="feedback post-sesión"
                            isLoading={clientSatisfaction.isLoading}
                        />

                        {/* Plan Adherence - REAL */}
                        <KPICard
                            value={`${planAdherence.value}%`}
                            trend={planAdherence.trend}
                            label="Adherencia al Plan"
                            description="planificado vs ejecutado"
                            isLoading={planAdherence.isLoading}
                        />
                    </div>

                    {/* Error state para stats reales */}
                    {isErrorStats && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <p className="text-red-600 text-sm">
                                No se pudieron cargar las estadísticas. Intenta recargar la página.
                            </p>
                        </div>
                    )}
                </div>

                {/* Priority Alerts (izq) + Quick Actions (der) - SEGÚN FIGMA */}
                <div className="px-4 lg:px-8 mb-8 lg:mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                        {/* Priority Alerts - Izquierda */}
                        <PriorityAlertsWidget />
                        
                        {/* Quick Actions - Derecha */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 flex flex-col">
                            <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-6">
                                Acciones Rápidas
                            </h3>
                            <div className="grid grid-cols-2 gap-4 flex-1">
                                {/* Crear Plan */}
                                <div
                                    className="bg-blue-50 rounded-xl p-5 cursor-pointer hover:bg-blue-100 transition-all flex flex-col items-center justify-center h-full"
                                    onClick={() => navigate("/dashboard/training-plans/create")}
                                >
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 text-sm mb-1">Crear Plan de Entrenamiento</h4>
                                        <p className="text-xs text-slate-600">Construye un programa</p>
                                    </div>
                                </div>

                                {/* Añadir Cliente */}
                                <div
                                    className="bg-blue-50 rounded-xl p-5 cursor-pointer hover:bg-blue-100 transition-all flex flex-col items-center justify-center h-full"
                                    onClick={() => navigate("/dashboard/clients/onboarding")}
                                >
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 text-sm mb-1">Añadir Cliente</h4>
                                        <p className="text-xs text-slate-600">Nuevo registro</p>
                                    </div>
                                </div>

                                {/* Generar Reportes */}
                                <div
                                    className="bg-blue-50 rounded-xl p-5 cursor-pointer hover:bg-blue-100 transition-all flex flex-col items-center justify-center h-full"
                                    onClick={() => navigate("/dashboard/reports/generate")}
                                >
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 text-sm mb-1">Generar Reportes</h4>
                                        <p className="text-xs text-slate-600">Análisis y estadísticas</p>
                                    </div>
                                </div>

                                {/* Programación de Sesiones */}
                                <div
                                    className="bg-blue-50 rounded-xl p-5 cursor-pointer hover:bg-blue-100 transition-all flex flex-col items-center justify-center h-full"
                                    onClick={() => navigate("/dashboard/scheduling")}
                                >
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 text-sm mb-1">Programación</h4>
                                        <p className="text-xs text-slate-600">Calendario de citas</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Billing (izq) + Client Progress (der) - SEGÚN FIGMA */}
                <div className="px-4 lg:px-8 mb-8 lg:mb-12 pb-20 lg:pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Client Billing - Izquierda */}
                        <ClientBillingChart />
                        
                        {/* Client Progress - Derecha */}
                        <ClientProgressWidget />
                    </div>
                </div>
            </DashboardLayout>

            {/* Modal de Complete Profile */}
            <CompleteProfileModal
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
        </>
    );
};