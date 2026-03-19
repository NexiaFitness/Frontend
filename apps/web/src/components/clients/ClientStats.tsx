/**
 * ClientStats.tsx — Tarjetas de estadísticas de clientes
 *
 * Contexto:
 * - Muestra resumen de métricas clave: total, activos, inactivos.
 * - Usa hook useClientStats que abstrae transformación de datos.
 * - Responsive: 1 columna móvil, 3 columnas desktop.
 *
 * Notas de mantenimiento:
 * - Hook useClientStats mapea nombres de backend a getters semánticos.
 * - Loading skeleton mientras carga.
 * - Error handling silencioso (stats no críticas).
 *
 * @author Frontend Team
 * @since v2.6.0
 */

import React from "react";
import { useClientStats } from "@nexia/shared/hooks/clients/useClientStats";

export const ClientStats: React.FC = () => {
    const {
        getTotalClients,
        getActiveClients,
        getInactiveClients,
        isLoading,
        error
    } = useClientStats();

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="px-4 lg:px-8 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 animate-pulse"
                        >
                            <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
                            <div className="h-4 w-24 bg-slate-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error handling silencioso
    if (error) {
        return null;
    }

    // Obtener valores usando getters
    const totalClients = getTotalClients();
    const activeClients = getActiveClients();
    const inactiveClients = getInactiveClients();

    return (
        <div className="px-4 lg:px-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* Total Clientes */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-3xl font-bold text-slate-800">
                                {totalClients}
                            </p>
                            <p className="text-sm font-medium text-slate-600 mt-1">
                                Total Clientes
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Clientes Activos */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-3xl font-bold text-green-600">
                                {activeClients}
                            </p>
                            <p className="text-sm font-medium text-slate-600 mt-1">
                                Activos
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {totalClients > 0 
                                    ? Math.round((activeClients / totalClients) * 100) 
                                    : 0}% del total
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Clientes Inactivos */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-3xl font-bold text-slate-600">
                                {inactiveClients}
                            </p>
                            <p className="text-sm font-medium text-slate-600 mt-1">
                                Inactivos
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {totalClients > 0 
                                    ? Math.round((inactiveClients / totalClients) * 100) 
                                    : 0}% del total
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-slate-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};