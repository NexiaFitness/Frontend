/**
 * ExerciseSearch.tsx — Barra de búsqueda con debounce para ejercicios
 * 
 * Propósito: Input de búsqueda que emite eventos con debounce para evitar requests excesivos.
 * Contexto: módulo Exercise Database Browser de NEXIA Fitness.
 * Notas de mantenimiento: mantener coherencia con ClientList y otras vistas
 * 
 * @author Frontend Team
 * @since v4.8.0
 */

import React, { useState, useEffect } from "react";

interface ExerciseSearchProps {
    onSearch: (value: string) => void;
    placeholder?: string;
}

export const ExerciseSearch: React.FC<ExerciseSearchProps> = ({
    onSearch,
    placeholder = "Buscar ejercicios...",
}) => {
    const [searchInput, setSearchInput] = useState("");

    // Debounce de búsqueda (300ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchInput);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput, onSearch]);

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                    className="h-5 w-5 text-gray-400"
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
            <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>
    );
};
