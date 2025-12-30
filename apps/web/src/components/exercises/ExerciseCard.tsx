/**
 * ExerciseCard.tsx — Card individual de ejercicio para lista
 *
 * Propósito: Componente presentacional reutilizable que muestra información clave del ejercicio
 * Contexto: módulo Exercise Database Browser de NEXIA Fitness
 * Notas de mantenimiento: mantener coherencia con TrainingPlanCard y ClientCard
 *
 * @author Frontend Team
 * @since v4.8.0
 * @updated v5.0.0 - Refactorizado para Exercise Catalog, alineado con TrainingPlanCard
 */

import React from "react";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import {
    getMuscleLabel,
    getEquipmentLabel,
    getLevelLabel,
    getLevelBadgeColor,
    getMuscleGradient,
} from "@/utils/exercises";

interface ExerciseCardProps {
    exercise: Exercise;
    onSelect?: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect }) => {
    // Extraer músculo principal (puede ser comma-separated)
    const primaryMuscle = exercise.musculatura_principal
        ? exercise.musculatura_principal.split(',')[0].trim()
        : '';

    // Handler para click
    const handleClick = () => {
        if (onSelect) {
            onSelect(exercise);
        }
    };

    // Handler para navegación con teclado
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    // Aria label para accesibilidad
    const ariaLabel = `${exercise.nombre} - ${getMuscleLabel(primaryMuscle)}`;

    return (
        <div
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={onSelect ? ariaLabel : undefined}
            className={`bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 flex flex-col h-full ${
                onSelect ? "cursor-pointer" : ""
            }`}
        >
            {/* Imagen placeholder con gradiente */}
            <div
                className={`aspect-video rounded-lg mb-4 bg-gradient-to-br ${getMuscleGradient(primaryMuscle)} flex items-center justify-center`}
            >
                <div className="text-white text-4xl font-bold opacity-50">
                    💪
                </div>
            </div>

            {/* Nombre del ejercicio */}
            <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
                {exercise.nombre}
            </h3>

            {/* Grupo muscular principal */}
            {primaryMuscle && (
                <div className="mb-3">
                    <span className="text-sm text-slate-600">
                        {getMuscleLabel(primaryMuscle)}
                    </span>
                </div>
            )}

            {/* Badges: Nivel y Equipamiento */}
            <div className="flex flex-wrap gap-2 mb-3">
                {exercise.nivel && (
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(exercise.nivel)}`}
                    >
                        {getLevelLabel(exercise.nivel)}
                    </span>
                )}
                {exercise.equipo && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {getEquipmentLabel(exercise.equipo)}
                    </span>
                )}
            </div>

            {/* Descripción corta (si existe) */}
            {exercise.descripcion && (
                <div className="flex-1 min-h-[2.5rem]">
                    <p className="text-sm text-slate-600 line-clamp-2">
                        {exercise.descripcion}
                    </p>
                </div>
            )}
        </div>
    );
};
