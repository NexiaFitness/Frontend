/**
 * MilestonesTab.tsx — Gestión de milestones del training plan
 * 
 * UI: Header + Formulario colapsable + Lista ordenada por fecha
 * Estructura: Siguiendo Figma pero con paleta azul del proyecto
 * 
 * @author Nelson Valero
 * @since v4.7.0 - Training Planning FASE 3A
 */

import React, { useState } from 'react';
import { useMilestones } from '@nexia/shared/hooks/training/useMilestones';
import { MILESTONE_TYPES, MILESTONE_IMPORTANCE, type MilestoneType, type MilestoneImportance } from '@nexia/shared/types/training';
import type { Milestone } from '@nexia/shared/types/training';

interface MilestonesTabProps {
    planId: number;
}

export const MilestonesTab: React.FC<MilestonesTabProps> = ({ planId }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        milestone_date: string;
        type: MilestoneType;
        importance: MilestoneImportance;
        notes: string;
    }>({
        title: '',
        milestone_date: '',
        type: MILESTONE_TYPES.CUSTOM,
        importance: MILESTONE_IMPORTANCE.MEDIUM,
        notes: '',
    });

    const {
        milestones,
        isLoading,
        createMilestone,
        deleteMilestone,
        toggleComplete,
        isCreating: isSubmitting,
    } = useMilestones({ planId });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.milestone_date) {
            alert('El título y la fecha son obligatorios');
            return;
        }

        try {
            await createMilestone(formData);
            setFormData({
                title: '',
                milestone_date: '',
                type: MILESTONE_TYPES.CUSTOM,
                importance: MILESTONE_IMPORTANCE.MEDIUM,
                notes: '',
            });
            setIsCreating(false);
        } catch (error) {
            console.error('Failed to create milestone:', error);
            alert('Error al crear el hito');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este hito?')) return;

        try {
            await deleteMilestone(id);
        } catch (error) {
            console.error('Failed to delete milestone:', error);
            alert('Error al eliminar el hito');
        }
    };

    const handleToggle = async (milestone: Milestone) => {
        try {
            await toggleComplete(milestone);
        } catch (error) {
            console.error('Failed to toggle milestone:', error);
        }
    };

    const getImportanceStars = (importance: string) => {
        const levels = {
            low: '⭐',
            medium: '⭐⭐',
            high: '⭐⭐⭐',
        };
        return levels[importance as keyof typeof levels] || '⭐⭐';
    };

    const getTypeLabel = (type: string) => {
        const labels = {
            start: 'Fecha de Inicio',
            end: 'Fecha de Fin',
            competition: 'Competición',
            test: 'Prueba',
            custom: 'Personalizado',
        };
        return labels[type as keyof typeof labels] || type;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Cargando hitos...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Hitos Importantes</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Añade eventos importantes (competiciones, pruebas, fechas de inicio/fin) para guiar tu planificación.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-lg">{isCreating ? '−' : '+'}</span>
                    </button>
                </div>

                {/* Create Form */}
                {isCreating && (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t pt-4">
                        {/* Milestone Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Hito
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as MilestoneType })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={MILESTONE_TYPES.START}>Fecha de Inicio</option>
                                <option value={MILESTONE_TYPES.END}>Fecha de Fin</option>
                                <option value={MILESTONE_TYPES.COMPETITION}>Competición</option>
                                <option value={MILESTONE_TYPES.TEST}>Prueba</option>
                                <option value={MILESTONE_TYPES.CUSTOM}>Personalizado</option>
                            </select>
                        </div>

                        {/* Name & Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="ej., Final 100m sprint, Prueba de Peso, Inicio de Temporada"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    value={formData.milestone_date}
                                    onChange={(e) => setFormData({ ...formData, milestone_date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Importance */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Importancia
                            </label>
                            <select
                                value={formData.importance}
                                onChange={(e) => setFormData({ ...formData, importance: e.target.value as MilestoneImportance })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={MILESTONE_IMPORTANCE.LOW}>Baja ⭐</option>
                                <option value={MILESTONE_IMPORTANCE.MEDIUM}>Media ⭐⭐</option>
                                <option value={MILESTONE_IMPORTANCE.HIGH}>Alta ⭐⭐⭐</option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas (opcional)
                            </label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Añadiendo...' : 'Añadir Hito'}
                        </button>
                    </form>
                )}
            </div>

            {/* Milestones List */}
            {milestones.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 mb-2">Aún no hay hitos</p>
                        <p className="text-sm text-gray-400">
                            Haz clic en el botón + de arriba para añadir tu primer hito
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {milestones
                        .sort((a, b) => new Date(a.milestone_date).getTime() - new Date(b.milestone_date).getTime())
                        .map((milestone) => (
                            <div
                                key={milestone.id}
                                className={`bg-white border rounded-lg p-4 transition-all ${milestone.done
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={milestone.done}
                                        onChange={() => handleToggle(milestone)}
                                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3
                                                className={`text-lg font-semibold ${milestone.done ? 'line-through text-gray-500' : 'text-gray-900'
                                                    }`}
                                            >
                                                {milestone.title}
                                            </h3>
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                {getTypeLabel(milestone.type)}
                                            </span>
                                            <span className="text-sm">{getImportanceStars(milestone.importance)}</span>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2">
                                            {new Date(milestone.milestone_date).toLocaleDateString("es-ES", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>

                                        {milestone.notes && (
                                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                {milestone.notes}
                                            </p>
                                        )}
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(milestone.id)}
                                        className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-1 hover:bg-red-50 rounded transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

