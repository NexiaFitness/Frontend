/**
 * ClientStats.tsx — Tarjetas de estadísticas de clientes
 *
 * Contexto:
 * - Muestra resumen de métricas clave: total, activos, inactivos.
 * - Usa endpoint /clients/stats (si backend lo tiene).
 * - Fallback: calcula stats desde lista de clientes actual.
 * - Responsive: 1 columna móvil, 3 columnas desktop.
 *
 * Notas de mantenimiento:
 * - Si backend no tiene /clients/stats, usar data de getClients.
 * - Loading skeleton mientras carga.
 * - Error handling silencioso (stats no críticas).
 *
 * @author Frontend Team
 * @since v2.6.0
 */

import React from "react";
import { useGetClientStatsQuery } from "@nexia/shared/api/clientsApi";

export const ClientStats: React.FC = () => {
    const { data: stats, isLoading } = useGetClientStatsQuery();

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

    // Si no hay stats, no renderizar nada (error silencioso)
    if (!stats) {
        return null;
    }

    return (
        <div className="px-4 lg:px-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* Total Clientes */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                            <p className="text-sm font-medium text-slate-600 mt-1">Total Clientes</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
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
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                            <p className="text-sm font-medium text-slate-600 mt-1">Activos</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% del total
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
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
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-600">{stats.inactive}</p>
                            <p className="text-sm font-medium text-slate-600 mt-1">Inactivos</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% del total
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-slate-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
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