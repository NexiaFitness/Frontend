/**
 * TrainerDashboard.tsx — Panel principal del entrenador.
 * 
 * Contexto:
 * Vista principal dentro del área privada de un usuario con rol "Trainer".
 * Renderiza la interfaz del dashboard con estructura responsive (1-3 columnas),
 * integra el menú lateral, la barra de navegación superior y los componentes
 * informativos como el banner de perfil incompleto (desacoplado en componente aparte).
 * 
 * Notas de mantenimiento:
 * - El banner "CompleteProfileBanner" se renderiza condicionalmente si el perfil 
 *   no está completo. Se encuentra desacoplado en /components/dashboard/shared/.
 * - El banner "EmailVerificationBanner" se renderiza si el email no está verificado.
 * - No contiene lógica de negocio; toda la información proviene de Redux y RTK Query.
 * - Mantener el uso de TIPOGRAFÍA y componentes UI consistentes con el sistema global.
 * - Botón "Add New Client" ahora redirige a lista de clientes (/dashboard/clients).
 * 
 * @author Frontend Team
 * @since v2.4.1
 * @updated v2.5.2 - Agregado EmailVerificationBanner
 * @updated v4.1.0 - Banners reciben datos completos para detectar hydration
 * @updated v4.4.0 - Agregado CompleteProfileModal con bloqueo de creación de clientes
 * @updated v2.6.0 - Botón "Add New Client" redirige a /dashboard/clients (Client Management)
 * @updated v2.6.1 - Integración de estadísticas reales desde API usando useClientStats
 */

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { CompleteProfileBanner, EmailVerificationBanner } from "@/components/dashboard/shared";
import { CompleteProfileModal } from "@/components/dashboard/modals";
import { TYPOGRAPHY } from "@/utils/typography";
import { Button } from "@/components/ui/buttons";
import { useCompleteProfileModal, useClientStats } from "@nexia/shared";
import type { RootState } from "@nexia/shared/store";

export const TrainerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    // Hook de estadísticas de clientes
    const {
        getTotalClients,
        getActiveClients,
        getInactiveClients,
        getActivePercentage,
        isLoading,
        isError,
    } = useClientStats();

    // Estado del modal de Complete Profile
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

    // Hook para verificar si perfil está completo
    const { shouldBlock } = useCompleteProfileModal();

    // Items del menú superior
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    // Handler para gestionar clientes con bloqueo condicional
    const handleManageClients = () => {
        if (shouldBlock) {
            setShowCompleteProfileModal(true);
            return;
        }
        navigate("/dashboard/clients");
    };

    // Loading state para las cards
    const renderMetricValue = (value: number | string) => {
        if (isLoading) {
            return (
                <div className="h-10 bg-slate-200 rounded animate-pulse" />
            );
        }
        return (
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
                {value}
            </h3>
        );
    };

    return (
        <>
            {/* Navbar móvil / tablet */}
            <DashboardNavbar menuItems={menuItems} />

            {/* Sidebar escritorio */}
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Encabezado */}
                <div className="mb-8 lg:mb-12 text-center px-4 lg:px-8">
                    <h2
                        className={`${TYPOGRAPHY.dashboardHero} text-white mb-3 lg:mb-4`}
                    >
                        Bienvenido de vuelta, {user?.nombre}
                    </h2>
                    <p className="text-white/80 text-sm md:text-lg lg:text-xl">
                        Gestiona tus clientes y entrenamientos desde tu panel profesional
                    </p>
                </div>

                {/* Banner de verificación de email (prioridad ALTA) */}
                <EmailVerificationBanner user={user} />

                {/* Banner de perfil incompleto */}
                <CompleteProfileBanner user={user} />

                {/* Cards de métricas */}
                <div className="px-4 lg:px-8 mb-12 lg:mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                        {/* Active Clients */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                            {renderMetricValue(getActiveClients())}
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                Clientes Activos
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">
                                {getActivePercentage()} del total
                            </p>
                        </div>

                        {/* Inactive Clients */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                            {renderMetricValue(getInactiveClients())}
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                Clientes Inactivos
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">
                                Requieren seguimiento
                            </p>
                        </div>

                        {/* Total Clients */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 md:col-span-2 lg:col-span-1">
                            {renderMetricValue(getTotalClients())}
                            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                                Total de Clientes
                            </p>
                            <p className="text-slate-600 text-sm lg:text-base">
                                En tu cartera
                            </p>
                        </div>
                    </div>

                    {/* Error state */}
                    {isError && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <p className="text-red-600 text-sm">
                                No se pudieron cargar las estadísticas. Intenta recargar la página.
                            </p>
                        </div>
                    )}
                </div>

                {/* Botones principales */}
                <div className="px-4 lg:px-8 mb-12 lg:mb-16">
                    <div className="flex flex-col md:flex-row gap-4 lg:gap-6 justify-center max-w-2xl mx-auto">
                        <Button
                            variant="primary"
                            size="lg"
                            className="px-8 lg:px-10 py-3 lg:py-4 text-base lg:text-lg font-semibold w-full md:w-auto md:min-w-[220px]"
                            onClick={handleManageClients}
                        >
                            Gestionar Clientes
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="px-8 lg:px-10 py-3 lg:py-4 text-base lg:text-lg font-semibold w-full md:w-auto md:min-w-[220px]"
                            onClick={() => navigate("/dashboard/training-plans")}
                        >
                            Training Planning
                        </Button>
                    </div>
                </div>

                {/* Bloque de clientes recientes */}
                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <div className="max-w-4xl mx-auto">
                        <div 
                            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 cursor-pointer hover:bg-white/100 transition-all group"
                            onClick={handleManageClients}
                        >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">
                                        Gestión de Clientes
                                    </h3>
                                    <p className="text-slate-600 text-sm lg:text-base">
                                        Visualiza y administra tus clientes
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
                                    {isLoading ? (
                                        <div className="h-8 bg-slate-200 rounded animate-pulse mb-2" />
                                    ) : (
                                        <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">
                                            {getActiveClients()}
                                        </div>
                                    )}
                                    <div className="text-xs lg:text-sm text-slate-600">
                                        Activos
                                    </div>
                                </div>
                                <div>
                                    {isLoading ? (
                                        <div className="h-8 bg-slate-200 rounded animate-pulse mb-2" />
                                    ) : (
                                        <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">
                                            {getInactiveClients()}
                                        </div>
                                    )}
                                    <div className="text-xs lg:text-sm text-slate-600">
                                        Inactivos
                                    </div>
                                </div>
                                <div>
                                    {isLoading ? (
                                        <div className="h-8 bg-slate-200 rounded animate-pulse mb-2" />
                                    ) : (
                                        <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">
                                            {getTotalClients()}
                                        </div>
                                    )}
                                    <div className="text-xs lg:text-sm text-slate-600">
                                        Total
                                    </div>
                                </div>
                            </div>
                        </div>
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