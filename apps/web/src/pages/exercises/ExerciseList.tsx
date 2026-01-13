/**
 * ExerciseList.tsx — Lista principal de ejercicios (Exercise Database Browser)
 * 
 * Propósito: Vista protegida con lista de ejercicios, búsqueda y filtros.
 * Contexto: módulo Exercise Database Browser de NEXIA Fitness.
 * Notas de mantenimiento: mantener coherencia con ClientList y TrainingPlansPage y otras vistas
 * 
 * @author Frontend Team
 * @since v4.8.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useExercises } from "@nexia/shared/hooks/exercises";

// Layouts
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";

// Components
import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { ExerciseFilters } from "@/components/exercises/ExerciseFilters";
import { ExerciseSearch } from "@/components/exercises/ExerciseSearch";

// UI
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Pagination } from "@/components/ui/pagination";

// Utils
import { TYPOGRAPHY } from "@/utils/typography";

export const ExerciseList: React.FC = () => {
    const navigate = useNavigate();

    // Hook de ejercicios con filtros y paginación
    const {
        exercises,
        total,
        filters,
        setFilters,
        pagination,
        setPagination,
        isLoading,
        isError,
        refetch,
    } = useExercises();

    // Handlers
    const handleSearch = (searchTerm: string) => {
        setFilters({ search: searchTerm || undefined });
    };

    const handleCardClick = (exerciseId: number) => {
        navigate(`/dashboard/exercises/${exerciseId}`);
    };

    // Calcular paginación para componente Pagination
    const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
    const totalPages = Math.ceil(total / pagination.limit);
    const itemsPerPage = pagination.limit;

    // Handler para cambio de página
    const handlePageChange = (page: number) => {
        const newSkip = (page - 1) * pagination.limit;
        setPagination(newSkip, pagination.limit);
        // Scroll suave hacia arriba
        window.scrollTo({ top: 0, behavior: "smooth" });
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
                        Base de Datos de Ejercicios
                    </h2>
                    <p className="text-white/80 text-sm md:text-base">
                        Explora y busca ejercicios para tus planes de entrenamiento
                    </p>
                </div>

                {/* Búsqueda */}
                <div className="px-4 lg:px-8 mb-4">
                    <ExerciseSearch onSearch={handleSearch} />
                </div>

                {/* Filtros */}
                <div className="px-4 lg:px-8 mb-6">
                    <ExerciseFilters filters={filters} onChange={setFilters} />
                </div>

                {/* Lista de ejercicios */}
                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-16">
                            <LoadingSpinner size="lg" />
                            <p className="ml-4 text-white">Cargando ejercicios...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <Alert variant="error" className="mb-6">
                            Error al cargar ejercicios. Por favor, intenta de nuevo.
                            <button
                                onClick={() => refetch()}
                                className="ml-2 text-blue-600 hover:text-blue-700 underline"
                            >
                                Reintentar
                            </button>
                        </Alert>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && exercises.length === 0 && (
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 lg:p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {filters.search || filters.equipo || filters.nivel
                                        ? "No se encontraron ejercicios"
                                        : "Aún no hay ejercicios"}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {filters.search || filters.equipo || filters.nivel
                                        ? "Intenta ajustar los filtros de búsqueda"
                                        : "Los ejercicios aparecerán aquí cuando estén disponibles"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Grid de ejercicios */}
                    {!isLoading && !isError && exercises.length > 0 && (
                        <>
                            {/* Info de resultados */}
                            <div className="mb-4">
                                <p className="text-sm text-white/80">
                                    Mostrando {exercises.length} de {total} ejercicios
                                </p>
                            </div>

                            {/* Grid responsive */}
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {exercises.map((exercise) => (
                                    <ExerciseCard
                                        key={exercise.id}
                                        exercise={exercise}
                                        onSelect={() => handleCardClick(exercise.id)}
                                    />
                                ))}
                            </div>

                            {/* Paginación reutilizable */}
                            {totalPages > 1 && (
                                <div className="mt-8">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={total}
                                        itemsPerPage={itemsPerPage}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
};
