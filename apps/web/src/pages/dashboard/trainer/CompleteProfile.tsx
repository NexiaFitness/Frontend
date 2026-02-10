/**
 * CompleteProfile - Formulario de completado de perfil profesional para trainers
 * Aparece tras registro básico, requerido para acceso completo al dashboard
 * Layout consistente con dashboard (sidebar + navbar responsive)
 * 
 * @author Frontend Team
 * @since v2.2.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TRAINER_MENU_ITEMS } from "@/config/trainerNavigation";
import { CompleteProfileForm } from "@/components/dashboard/trainer";
import { TYPOGRAPHY_COMBINATIONS } from "@/utils/typography";
import { useCompleteProfile } from "@nexia/shared";

export const CompleteProfile: React.FC = () => {
    const navigate = useNavigate();
    
    
    // Hook compartido para lógica de Complete Profile
    const { 
        isLoadingTrainer
    } = useCompleteProfile({ 
        onRedirect: (path: string) => navigate(path, { replace: true }) 
    });

    // Loading state
    if (isLoadingTrainer) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-white">Cargando perfil...</div>
            </div>
        );
    }

    return (
        <>
            <DashboardNavbar menuItems={TRAINER_MENU_ITEMS} />
            <TrainerSideMenu />
            
            <DashboardLayout>
                {/* Encabezado responsive igual a dashboards */}
                <div className="mb-8 lg:mb-12 text-center px-4 lg:px-8">
                    <h2 className={TYPOGRAPHY_COMBINATIONS.dashboardHeroTitle}>
                        Completa tu perfil profesional
                    </h2>
                    <p className={TYPOGRAPHY_COMBINATIONS.dashboardHeroSubtitle}>
                        Solo necesitamos algunos datos más para personalizar tu experiencia y desbloquear todas las funcionalidades
                    </p>
                </div>

                {/* Progress Indicator - Responsive */}
                <div className="px-4 lg:px-8 mb-8 lg:mb-12">
                    <div className="flex items-center justify-center space-x-2 lg:space-x-4">
                        {/* Step 1 - Completado */}
                        <div className="flex items-center">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                            </div>
                            <span className="ml-2 text-white/60 text-xs sm:text-sm font-medium hidden sm:inline">
                                Cuenta creada
                            </span>
                        </div>

                        {/* Connector */}
                        <div className="w-8 lg:w-16 h-0.5 bg-white/30"></div>

                        {/* Step 2 - Activo */}
                        <div className="flex items-center">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary-500 flex items-center justify-center shadow-lg ring-4 ring-primary-500/30 animate-pulse">
                                <span className="text-white font-bold text-lg lg:text-xl">2</span>
                            </div>
                            <span className="ml-2 text-white font-semibold text-xs sm:text-sm hidden sm:inline">
                                Perfil profesional
                            </span>
                        </div>

                        {/* Connector */}
                        <div className="w-8 lg:w-16 h-0.5 bg-white/20"></div>

                        {/* Step 3 - Pendiente */}
                        <div className="flex items-center">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="text-white/40 font-bold text-lg lg:text-xl">3</span>
                            </div>
                            <span className="ml-2 text-white/40 text-xs sm:text-sm font-medium hidden sm:inline">
                                Dashboard completo
                            </span>
                        </div>
                    </div>

                    {/* Mobile labels */}
                    <div className="flex justify-between sm:hidden mt-3 px-2 text-xs text-white/60">
                        <span>Cuenta</span>
                        <span className="font-semibold text-white">Perfil</span>
                        <span>Dashboard</span>
                    </div>
                </div>

                {/* Form Card - Centrado como Recent Clients en dashboard */}
                <div className="px-4 lg:px-8 mb-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
                            <CompleteProfileForm />
                        </div>
                    </div>
                </div>

                {/* Help Section - Responsive */}
                <div className="px-4 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center space-y-3">
                        <div className="flex items-center justify-center space-x-2 text-white/50 text-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Tus datos están protegidos y encriptados</span>
                        </div>
                        <p className="text-white/50 text-sm">
                            ¿Necesitas ayuda?{" "}
                            <a 
                                href="mailto:support@nexia.app" 
                                className="text-primary-400 hover:text-primary-300 underline transition-colors"
                            >
                                Contacta con soporte
                            </a>
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};