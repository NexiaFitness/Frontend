/**
 * ClientList.tsx — Lista principal de clientes del trainer
 *
 * Contexto:
 * - Vista protegida (solo trainers) con lista de clientes con métricas.
 * - Diseño basado en Figma con header, tabla y sidebar derecho.
 * - Usa DashboardLayout para consistencia visual con resto del dashboard.
 * - Click en fila → navega a /dashboard/clients/{id} (detalle).
 *
 * Features:
 * - Búsqueda en tiempo real
 * - Tabla con métricas: Name, Fatigue, Adherence
 * - Sidebar derecho con Quick Actions y Recent Activity
 * - Estados: loading, error, empty
 *
 * @author Frontend Team
 * @since v2.6.0
 * @updated v5.0.0 - Rediseño completo basado en Figma
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetClientsWithMetricsQuery, useGetRecentActivityQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useCompleteProfileModal } from "@nexia/shared";
import type { ClientListItem, RecentActivityItem } from "@nexia/shared/types/client";
import type { RootState } from "@nexia/shared/store";

// Layouts
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { CompleteProfileModal } from "@/components/dashboard/modals/CompleteProfileModal";

// UI
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Avatar } from "@/components/ui/avatar";
import { Pagination } from "@/components/ui/pagination";

// Utils
import { TYPOGRAPHY } from "@/utils/typography";

// Helper para obtener color de fatigue
const getFatigueColor = (fatigue: string | null): string => {
    if (!fatigue) return "bg-gray-100 text-gray-600";
    const fatigueLower = fatigue.toLowerCase();
    if (fatigueLower.includes("perfect")) return "bg-green-100 text-green-700";
    if (fatigueLower.includes("slightly")) return "bg-yellow-100 text-yellow-700";
    if (fatigueLower.includes("very")) return "bg-orange-100 text-orange-700";
    if (fatigueLower.includes("exhausted")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
};

// Helper para traducir fatigue
const translateFatigue = (fatigue: string | null): string => {
    if (!fatigue) return "Sin datos";
    const fatigueLower = fatigue.toLowerCase();
    if (fatigueLower.includes("perfect")) return "Perfecto";
    if (fatigueLower.includes("slightly")) return "Ligeramente Cansado";
    if (fatigueLower.includes("very")) return "Muy Cansado";
    if (fatigueLower.includes("exhausted")) return "Agotado";
    return fatigue;
};

// Helper para formatear tiempo relativo
const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    if (diffDays === 1) return "hace 1 día";
    return `hace ${diffDays} días`;
};

// Helper para traducir descripciones de actividades
const translateActivityDescription = (type: string, description: string): string => {
    // Si la descripción ya viene en español del backend, usarla directamente
    // Si viene en inglés, traducir según el tipo
    const typeLower = type.toLowerCase();
    
    if (typeLower.includes("session_completed")) {
        if (description.includes("completed")) {
            return description.replace("completed", "completó").replace("a training session", "una sesión de entrenamiento");
        }
        return description;
    }
    
    if (typeLower.includes("client_added")) {
        if (description.includes("joined")) {
            return "se unió como nuevo cliente";
        }
        return description;
    }
    
    if (typeLower.includes("session_scheduled")) {
        if (description.includes("scheduled")) {
            return description.replace("scheduled", "programó").replace("for", "para");
        }
        return description;
    }
    
    if (typeLower.includes("goal_achieved")) {
        if (description.includes("achieved")) {
            return description.replace("achieved", "alcanzó").replace("their", "su").replace("goal", "objetivo");
        }
        return description;
    }
    
    if (typeLower.includes("test_completed")) {
        if (description.includes("completed")) {
            return description.replace("completed", "completó");
        }
        return description;
    }
    
    return description;
};

// Helper para obtener icono de actividad
const getActivityIcon = (type: string, icon?: string): React.ReactNode => {
    if (icon) {
        // Si hay un icono específico del backend, usarlo
        switch (icon) {
            case "person_add":
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                );
            case "trending_up":
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                );
        }
    }

    // Iconos por tipo
    switch (type) {
        case "session_completed":
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case "client_added":
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            );
        case "session_scheduled":
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        case "goal_achieved":
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            );
        case "test_completed":
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            );
        default:
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
};

export const ClientList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    
    // ✅ Modal de perfil completo
    const { shouldBlock } = useCompleteProfileModal();
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

    const PAGE_SIZE = 15;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");

    // Debounce búsqueda (300 ms) y reset a página 1 al buscar
    useEffect(() => {
        setCurrentPage(1);
        const timer = setTimeout(() => {
            setSearchDebounced(searchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Obtener trainer_id si es trainer
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: user?.role !== "trainer",
    });

    const trainerId = trainerProfile?.id;

    // Query RTK - clientes con métricas (búsqueda server-side en todas las páginas)
    const { data: clientsData, isLoading, isError, error } = useGetClientsWithMetricsQuery(
        {
            page: currentPage,
            page_size: PAGE_SIZE,
            search: searchDebounced.trim() || undefined,
            trainer_id: trainerId,
        },
        { skip: !trainerId }
    );

    // Query RTK - obtener actividad reciente
    const { data: activityData } = useGetRecentActivityQuery(
        { limit: 5, trainer_id: trainerId },
        { skip: !trainerId }
    );

    const activities: RecentActivityItem[] = activityData?.items ?? [];
    const items: ClientListItem[] = clientsData?.items ?? [];
    const total = clientsData?.total ?? 0;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

    const handlePageChange = useCallback(
        (page: number) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        []
    );

    // Handlers
    const handleClientClick = (clientId: number) => {
        navigate(`/dashboard/clients/${clientId}`);
    };

    const handleAddClient = () => {
        if (shouldBlock) {
            setShowCompleteProfileModal(true);
            return;
        }
        navigate("/dashboard/clients/onboarding");
    };

    const handleCreateTrainingPlan = () => {
        navigate("/dashboard/training-plans");
    };

    const handleScheduleSession = () => {
        navigate("/dashboard/scheduling/new");
    };

    const handleManageTemplates = () => {
        // TODO: Navegar a templates
        navigate("/dashboard/training-plans");
    };

    // Items del menú superior
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <>
            {/* Navbar móvil/tablet */}
            <DashboardNavbar menuItems={menuItems} />

            {/* Sidebar escritorio */}
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Header */}
                <div className="mb-6 lg:mb-8 text-center px-4 lg:px-8">
                    <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                        Clientes
                    </h2>
                    <p className="text-white/80 text-sm md:text-base">
                        Gestiona y monitoriza el progreso de tus clientes
                    </p>
                </div>

                {/* Header con búsqueda */}
                <div className="px-4 lg:px-8 mb-6">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
                            <div className="flex items-center">
                                {/* Búsqueda */}
                                <div className="flex-1 relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, apellidos o email..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800"
                                        aria-label="Buscar cliente"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        {/* Contenido principal */}
                        <div className="flex-1 min-w-0">
                            {/* Tabla de clientes */}
                            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex justify-center items-center py-16">
                                    <LoadingSpinner size="lg" />
                                </div>
                            )}

                            {/* Error State */}
                            {isError && (
                                <div className="p-6">
                                    <Alert variant="error">
                                        Error al cargar clientes:{" "}
                                        {error && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data
                                            ? String(error.data.detail)
                                            : "Error desconocido"}
                                    </Alert>
                                </div>
                            )}

                            {/* Tabla */}
                            {!isLoading && !isError && (
                                <>
                                    {/* Headers */}
                                    <div className="grid grid-cols-[1fr_150px_140px_40px] gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 items-center">
                                        <div className="font-semibold text-gray-700 flex items-center gap-3">
                                            <div className="w-10 flex-shrink-0"></div>
                                            <span>Nombre</span>
                                        </div>
                                        <div className="font-semibold text-gray-700 text-center">Fatiga</div>
                                        <div className="font-semibold text-gray-700 text-center">Adherencia</div>
                                        <div className="w-8 flex-shrink-0"></div>
                                    </div>

                                    {/* Resumen y filas */}
                                    {!isLoading && !isError && items.length > 0 && (
                                        <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
                                            <p className="text-sm text-gray-600">
                                                Mostrando {items.length} de {total} clientes
                                            </p>
                                        </div>
                                    )}
                                    {items.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <p className="text-gray-500">
                                                {searchDebounced.trim()
                                                    ? "No se encontraron clientes con ese criterio"
                                                    : "No hay clientes"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            {items.map((client, index) => (
                                                <div
                                                    key={client.id}
                                                    onClick={() => handleClientClick(client.id)}
                                                    className={`grid grid-cols-[1fr_150px_140px_40px] gap-4 px-6 py-4 cursor-pointer transition-colors items-center ${
                                                        index % 2 === 0 ? 'bg-white' : 'bg-primary-50'
                                                    } hover:bg-primary-100 border-b border-gray-200`}
                                                >
                                                    {/* Name */}
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <Avatar
                                                            nombre={client.nombre}
                                                            apellidos={client.apellidos}
                                                            size="sm"
                                                            variant="primary"
                                                        />
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">
                                                                {client.nombre} {client.apellidos}
                                                            </div>
                                                            <div className="text-sm text-gray-500 truncate">{client.mail}</div>
                                                        </div>
                                                    </div>

                                                    {/* Fatigue */}
                                                    <div className="flex justify-center items-center">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getFatigueColor(
                                                                client.fatigue_level
                                                            )}`}
                                                        >
                                                            {translateFatigue(client.fatigue_level)}
                                                        </span>
                                                    </div>

                                                    {/* Adherence */}
                                                    <div className="flex justify-center min-w-[140px]">
                                                        <div className="flex items-center gap-2 w-full max-w-[140px]">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden min-w-[60px]">
                                                                <div
                                                                    className="h-full bg-primary-600 rounded-full transition-all"
                                                                    style={{
                                                                        width: `${client.adherence_percentage ?? 0}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 min-w-[40px] text-right whitespace-nowrap">
                                                                {client.adherence_percentage !== null
                                                                    ? `${Math.round(client.adherence_percentage)}%`
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Arrow */}
                                                    <div className="flex justify-center w-8 flex-shrink-0">
                                                        <svg
                                                            className="w-5 h-5 text-gray-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Paginación */}
                                    {!isLoading && !isError && totalPages > 1 && (
                                        <div className="mt-0">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                totalItems={total}
                                                itemsPerPage={PAGE_SIZE}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                            </div>
                        </div>

                        {/* Sidebar derecho */}
                        <div className="lg:w-80 flex-shrink-0">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6">
                            {/* Quick Actions */}
                            <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                            <div className="space-y-2">
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={handleAddClient}
                                    className="w-full justify-start"
                                >
                                    Agregar Nuevo Cliente
                                </Button>
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={handleCreateTrainingPlan}
                                    className="w-full justify-start bg-white"
                                >
                                    Crear Plan de Entrenamiento
                                </Button>
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={handleScheduleSession}
                                    className="w-full justify-start bg-white"
                                >
                                    Programar Sesión
                                </Button>
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={handleManageTemplates}
                                    className="w-full justify-start bg-white"
                                >
                                    Gestionar Plantillas
                                </Button>
                            </div>

                            {/* Línea separadora azul */}
                            <div className="border-b mb-4 mt-6" style={{ borderColor: 'rgb(74, 103, 179)' }}></div>

                            {/* Recent Activity */}
                            <h3 className="font-semibold text-gray-900 mb-4">ACTIVIDAD RECIENTE</h3>
                            <div className="space-y-4">
                                {activities.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">No hay actividad reciente</p>
                                ) : (
                                    activities.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                                {getActivityIcon(activity.type, activity.icon)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900">
                                                    <span className="font-medium">{activity.actor_name}</span> {translateActivityDescription(activity.type, activity.description)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
            
            {/* ✅ Modal de Complete Profile */}
            <CompleteProfileModal
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
        </>
    );
};
