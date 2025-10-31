/**
 * ClientFilters.tsx — Componente de búsqueda y filtros para lista de clientes
 *
 * Contexto:
 * - Barra de filtros con búsqueda debounced (500ms).
 * - Filtros: objetivo_entrenamiento, experiencia, activo.
 * - Botón reset para limpiar todos los filtros.
 * - Responsive: columna en mobile, fila en desktop.
 *
 * Props:
 * - filters: ClientFiltersType (estado actual)
 * - onFiltersChange: Callback para actualizar filtros
 *
 * Notas de mantenimiento:
 * - Debounce previene requests excesivos en búsqueda.
 * - Reset button solo visible si hay filtros activos.
 * - Select components usan native HTML (performance).
 *
 * @author Frontend Team
 * @since v2.6.0
 */

import React, { useState, useEffect } from "react";
import type { ClientFilters as ClientFiltersType } from "@nexia/shared/types/client";
import { TRAINING_GOAL_ENUM, EXPERIENCE_ENUM } from "@nexia/shared";

interface ClientFiltersProps {
    filters: ClientFiltersType;
    onFiltersChange: (filters: ClientFiltersType) => void;
}

export const ClientFilters: React.FC<ClientFiltersProps> = ({ filters, onFiltersChange }) => {
    // State local para búsqueda (debounced)
    const [searchInput, setSearchInput] = useState(filters.search || "");

    // Debounce de búsqueda (500ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                onFiltersChange({ ...filters, search: searchInput });
            }
        }, 500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    // Sync con filters prop (cuando vienen de URL)
    useEffect(() => {
        if (filters.search !== searchInput) {
            setSearchInput(filters.search || "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.search]);

    // Handlers
    const handleObjetivoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || undefined;
        onFiltersChange({ ...filters, objetivo_entrenamiento: value as ClientFiltersType["objetivo_entrenamiento"] });
    };

    const handleExperienciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value || undefined;
        onFiltersChange({ ...filters, experiencia: value as ClientFiltersType["experiencia"] });
    };

    const handleActivoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const activo = value === "true" ? true : value === "false" ? false : undefined;
        onFiltersChange({ ...filters, activo });
    };

    const handleReset = () => {
        setSearchInput("");
        onFiltersChange({
            search: "",
            objetivo_entrenamiento: undefined,
            experiencia: undefined,
            activo: undefined,
        });
    };

    // Check si hay filtros activos
    const hasActiveFilters =
        filters.search || filters.objetivo_entrenamiento || filters.experiencia || filters.activo !== undefined;

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Búsqueda */}
                <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
                        Buscar cliente
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="search"
                            placeholder="Nombre, apellidos o mail..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Filtro Objetivo */}
                <div className="w-full lg:w-48">
                    <label htmlFor="objetivo_entrenamiento" className="block text-sm font-medium text-slate-700 mb-2">
                        Objetivo
                    </label>
                    <select
                        id="objetivo_entrenamiento"
                        value={filters.objetivo_entrenamiento || ""}
                        onChange={handleObjetivoChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
                    >
                        <option value="">Todos</option>
                        <option value={TRAINING_GOAL_ENUM.PERDIDA_PESO}>Pérdida de peso</option>
                        <option value={TRAINING_GOAL_ENUM.AUMENTAR_MASA}>Ganancia muscular</option>
                        <option value={TRAINING_GOAL_ENUM.RENDIMIENTO}>Rendimiento deportivo</option>
                    </select>
                </div>

                {/* Filtro Experiencia */}
                <div className="w-full lg:w-48">
                    <label htmlFor="experiencia" className="block text-sm font-medium text-slate-700 mb-2">
                        Experiencia
                    </label>
                    <select
                        id="experiencia"
                        value={filters.experiencia || ""}
                        onChange={handleExperienciaChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
                    >
                        <option value="">Todos</option>
                        <option value={EXPERIENCE_ENUM.BAJA}>Principiante (Baja)</option>
                        <option value={EXPERIENCE_ENUM.MEDIA}>Intermedio (Media)</option>
                        <option value={EXPERIENCE_ENUM.ALTA}>Avanzado (Alta)</option>
                    </select>
                </div>

                {/* Filtro Activo */}
                <div className="w-full lg:w-40">
                    <label htmlFor="activo" className="block text-sm font-medium text-slate-700 mb-2">
                        Estado
                    </label>
                    <select
                        id="activo"
                        value={filters.activo === undefined ? "" : filters.activo.toString()}
                        onChange={handleActivoChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
                    >
                        <option value="">Todos</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </div>

                {/* Botón Reset */}
                {hasActiveFilters && (
                    <div className="w-full lg:w-auto lg:self-end">
                        <button
                            onClick={handleReset}
                            className="w-full lg:w-auto px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};