/**
 * TrainerDashboard.tsx — Panel principal del entrenador.
 *
 * Layout según DASHBOARD_LAYOUT_SPEC:
 * Saludo + fecha → Banners → 4 StatCards → Dos columnas (Requiere atención + Hoy | Mis clientes + Facturación)
 *
 * @author Frontend Team
 * @since v2.4.1
 * @updated v5.x - DASHBOARD_LAYOUT_SPEC: layout profesional de raíz
 */

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Users, TrendingUp, Smile, ClipboardCheck } from "lucide-react";
import { CompleteProfileBanner, EmailVerificationBanner, GreetingHeader } from "@/components/dashboard/shared";
import { CompleteProfileModal } from "@/components/dashboard/modals";
import {
    KPICard,
    PriorityAlertsWidget,
    TodaySessionsWidget,
    ClientListWidget,
    BillingWidget,
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
    const dispatch = useDispatch<AppDispatch>();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    const {
        getTotalClients,
        isLoading: isLoadingStats,
        isError: isErrorStats,
    } = useClientStats();

    const clientImprovement = useClientImprovement();
    const clientSatisfaction = useClientSatisfaction();
    const planAdherence = usePlanAdherence();

    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
    const { isProfileComplete } = useCompleteProfileModal();

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(baseApi.util.resetApiState());
        }
    }, [isAuthenticated, dispatch]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="space-y-8">
            <GreetingHeader userName={user?.nombre} />

            <EmailVerificationBanner user={user} />
            <CompleteProfileBanner user={user} isProfileComplete={isProfileComplete} />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    value={getTotalClients()}
                    trend="+8%"
                    label="Total de Clientes"
                    description="vs mes anterior"
                    icon={Users}
                    color="primary"
                    isLoading={isLoadingStats}
                />
                <KPICard
                    value={`${clientImprovement.value}%`}
                    trend={clientImprovement.trend}
                    label="Progreso Promedio"
                    description="en todos los programas"
                    icon={TrendingUp}
                    color="success"
                    isLoading={clientImprovement.isLoading}
                />
                <KPICard
                    value={clientSatisfaction.value}
                    trend={clientSatisfaction.trend}
                    label="Satisfacción del Cliente"
                    description="feedback post-sesión"
                    icon={Smile}
                    color="info"
                    isLoading={clientSatisfaction.isLoading}
                />
                <KPICard
                    value={`${planAdherence.value}%`}
                    trend={planAdherence.trend}
                    label="Adherencia al Plan"
                    description="planificado vs ejecutado"
                    icon={ClipboardCheck}
                    color="primary"
                    isLoading={planAdherence.isLoading}
                />
            </div>

            {isErrorStats && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center">
                    <p className="text-sm text-destructive">
                        No se pudieron cargar las estadísticas. Intenta recargar la página.
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-8 lg:flex-row">
                <div className="flex-1 space-y-8 lg:w-[70%]">
                    <PriorityAlertsWidget />
                    <TodaySessionsWidget />
                </div>

                <aside className="space-y-8 lg:w-[30%]">
                    <ClientListWidget />
                    <BillingWidget />
                </aside>
            </div>

            <CompleteProfileModal
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
        </div>
    );
};
