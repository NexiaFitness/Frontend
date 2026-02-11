/**
 * ExercisePickerModal.tsx — Modal para seleccionar ejercicio desde el catálogo
 *
 * Contexto:
 * - Reutiliza el catálogo de ejercicios (búsqueda + filtros) como fuente única
 * - Usado en CreateSession y cualquier flujo que necesite elegir ejercicio
 * - Evita duplicar lógica de selección
 *
 * @author Frontend Team
 * @since v6.3.0 - Unificación ejercicio picker (fuente única)
 */

import React, { useCallback } from "react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { useExercises } from "@nexia/shared/hooks/exercises";
import { ExerciseSearch } from "./ExerciseSearch";
import { ExerciseFilters } from "./ExerciseFilters";
import { ExerciseCard } from "./ExerciseCard";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";

interface ExercisePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (exercise: Exercise) => void;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
    isOpen,
    onClose,
    onSelect,
}) => {
    const {
        exercises,
        total,
        filters,
        setFilters,
        pagination,
        setPagination,
        isLoading,
    } = useExercises();

    const handleSearch = useCallback(
        (searchTerm: string) => {
            setFilters({ search: searchTerm || undefined });
        },
        [setFilters]
    );

    const handleSelect = useCallback(
        (exercise: Exercise) => {
            onSelect(exercise);
            onClose();
        },
        [onSelect, onClose]
    );

    const handlePageChange = useCallback(
        (direction: "prev" | "next") => {
            const newSkip =
                direction === "next"
                    ? pagination.skip + pagination.limit
                    : Math.max(0, pagination.skip - pagination.limit);
            setPagination(newSkip, pagination.limit);
        },
        [pagination, setPagination]
    );

    const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
    const totalPages = Math.ceil(total / pagination.limit);
    const hasNext = pagination.skip + pagination.limit < total;
    const hasPrev = pagination.skip > 0;

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exercise-picker-title"
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 id="exercise-picker-title" className="text-lg font-semibold text-gray-900">
                        Seleccionar ejercicio desde catálogo
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                        aria-label="Cerrar"
                    >
                        &times;
                    </button>
                </div>

                {/* Search + Filters */}
                <div className="p-4 border-b border-gray-200 space-y-4">
                    <ExerciseSearch
                        value={filters.search ?? ""}
                        onSearch={handleSearch}
                        placeholder="Buscar por nombre..."
                    />
                    <ExerciseFilters filters={filters} onChange={setFilters} />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : exercises.length === 0 ? (
                        <p className="text-center text-gray-500 py-12">
                            No se encontraron ejercicios. Prueba otros filtros.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {exercises.map((exercise) => (
                                <ExerciseCard
                                    key={exercise.id}
                                    exercise={exercise}
                                    onSelect={handleSelect}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                            Página {currentPage} de {totalPages} ({total} ejercicios)
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handlePageChange("prev")}
                                disabled={!hasPrev}
                                className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePageChange("next")}
                                disabled={!hasNext}
                                className="px-3 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
