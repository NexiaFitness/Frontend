/**
 * ClientList.tsx — Lista principal de clientes del trainer
 *
 * Contexto:
 * - Vista protegida (solo trainers) con lista paginada de clientes.
 * - Integra búsqueda en tiempo real y filtros avanzados.
 * - Usa DashboardLayout para consistencia visual con resto del dashboard.
 * - Click en card → navega a /dashboard/clients/{id} (detalle).
 *
 * Features:
 * - Paginación funcional con query params
 * - Búsqueda debounced (500ms)
 * - Filtros: objetivo_entrenamiento, experiencia, activo
 * - Estados: loading, error, empty
 * - Botón "Add New Client" → onboarding wizard
 * - Stats overview (total, activos, inactivos)
 *
 * Notas de mantenimiento:
 * - useGetClientsQuery invalida cache automáticamente
 * - Filtros persisten en URL (compartible)
 * - Responsive mobile-first
 *
 * @author Frontend Team
 * @since v2.6.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetClientsQuery, useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import type { ClientFilters as ClientFiltersType, Client } from "@nexia/shared/types/client";
import type { RootState } from "@nexia/shared/store";

// Layouts
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";

// Components
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientStats } from "@/components/clients/ClientStats";

// UI
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";

// Utils
import { TYPOGRAPHY } from "@/utils/typography";

export const ClientList: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useSelector((state: RootState) => state.auth);

    // State de filtros (inicializado desde URL) - FIX: Type casting para TypeScript strict
    const [filters, setFilters] = useState<ClientFiltersType>({
        search: searchParams.get("search") || "",
        objetivo_entrenamiento: (searchParams.get("objetivo_entrenamiento") as ClientFiltersType["objetivo_entrenamiento"]) || undefined,
        experiencia: (searchParams.get("experiencia") as ClientFiltersType["experiencia"]) || undefined,
        activo: searchParams.get("activo") === "true" ? true : searchParams.get("activo") === "false" ? false : undefined,
    });

    // State de paginación
    const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
    const perPage = 12; // Cards por página

    // Obtener trainer_id si es trainer
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: user?.role !== "trainer",
    });

    // Query RTK - usar endpoint correcto según role
    const isTrainer = user?.role === "trainer";
    const trainerId = trainerProfile?.id;

    const trainerClientsQuery = useGetTrainerClientsQuery(
        { trainerId: trainerId!, filters, page, per_page: perPage },
        { skip: !isTrainer || !trainerId }
    );

    const allClientsQuery = useGetClientsQuery(
        { filters, page, per_page: perPage },
        { skip: isTrainer }
    );

    // Seleccionar query según role
    const { data, isLoading, isError, error } = isTrainer ? trainerClientsQuery : allClientsQuery;

    // Validar datos y calcular valores derivados de forma segura (alineado con backend)
    const clients: Client[] = data?.items ?? [];  // ← Backend usa "items" (no "clients")
    const totalClients = data?.total ?? 0;
    const currentPage = data?.page ?? page;
    const pageSize = data?.page_size ?? perPage;  // ← Backend usa "page_size" (no "per_page")
    const hasMore = data?.has_more ?? false;  // ← Backend usa "has_more"
    
    // Calcular total_pages desde page_size y total (solo para UI)
    const totalPages = pageSize > 0 ? Math.ceil(totalClients / pageSize) : 0;

    // Sincronizar filtros con URL (para compartir links)
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.objetivo_entrenamiento) params.set("objetivo_entrenamiento", filters.objetivo_entrenamiento);
        if (filters.experiencia) params.set("experiencia", filters.experiencia);
        if (filters.activo !== undefined) params.set("activo", filters.activo.toString());
        if (page > 1) params.set("page", page.toString());
        setSearchParams(params);
    }, [filters, page, setSearchParams]);

    // Handlers
    const handleFiltersChange = (newFilters: ClientFiltersType) => {
        setFilters(newFilters);
        setPage(1); // Reset a primera página al filtrar
    };

    const handleCardClick = (clientId: number) => {
        navigate(`/dashboard/clients/${clientId}`);
    };

    const handleAddClient = () => {
        navigate("/dashboard/clients/onboarding");
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Items del menú superior
    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
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
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                                Mis Clientes
                            </h2>
                            <p className="text-white/80 text-sm md:text-base">
                                Gestiona y monitoriza el progreso de tus clientes
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleAddClient}
                            className="w-full sm:w-auto sm:min-w-[180px]"
                        >
                            + Agregar Cliente
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <ClientStats />

                {/* Filtros */}
                <div className="px-4 lg:px-8 mb-6">
                    <ClientFilters filters={filters} onFiltersChange={handleFiltersChange} />
                </div>

                {/* Lista de clientes */}
                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-16">
                            <LoadingSpinner size="lg" />
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <Alert variant="error" className="mb-6">
                            Error al cargar clientes:{" "}
                            {error && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data
                                ? String(error.data.detail)
                                : "Error desconocido"}
                        </Alert>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && clients.length === 0 && (
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-slate-400"
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
                                <h3 className="text-xl font-bold text-slate-800 mb-2">
                                {filters.search || filters.objetivo_entrenamiento || filters.experiencia || filters.activo !== undefined
                                    ? "No se encontraron clientes"
                                    : "Aún no tienes clientes"}
                                </h3>
                                <p className="text-slate-600 mb-6">
                                    {filters.search || filters.objetivo_entrenamiento || filters.experiencia || filters.activo !== undefined
                                        ? "Intenta ajustar los filtros de búsqueda"
                                        : "Comienza agregando tu primer cliente para empezar a gestionar entrenamientos"}
                                </p>
                                <Button variant="primary" size="lg" onClick={handleAddClient}>
                                    + Agregar Primer Cliente
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Grid de clientes */}
                    {!isLoading && !isError && clients.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                {clients.map((client) => (
                                    <ClientCard
                                        key={client.id}
                                        client={client}
                                        onClick={() => handleCardClick(client.id)}
                                    />
                                ))}
                            </div>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                    >
                                        ← Anterior
                                    </Button>

                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Lógica para mostrar 5 páginas alrededor de la actual
                                            let pageNumber: number;
                                            if (totalPages <= 5) {
                                                pageNumber = i + 1;
                                            } else if (page <= 3) {
                                                pageNumber = i + 1;
                                            } else if (page >= totalPages - 2) {
                                                pageNumber = totalPages - 4 + i;
                                            } else {
                                                pageNumber = page - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                                        page === pageNumber
                                                            ? "bg-primary-600 text-white"
                                                            : "bg-white text-slate-700 hover:bg-slate-100"
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page >= totalPages}
                                    >
                                        Siguiente →
                                    </Button>
                                </div>
                            )}

                            {/* Info de paginación */}
                            <div className="text-center mt-4">
                                <p className="text-sm text-white/80">
                                    Mostrando {(page - 1) * pageSize + 1}-
                                    {Math.min(page * pageSize, totalClients)} de {totalClients} clientes
                                </p>
                                <p className="text-xs text-white/60 mt-1">
                                    Página actual: {currentPage} / {totalPages}
                                </p>
                                {hasMore && (
                                    <p className="text-xs text-white/60 mt-1 italic">
                                        Hay más clientes disponibles en las siguientes páginas...
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
};