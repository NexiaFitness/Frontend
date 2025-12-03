/**
 * YearlyPlanningDashboardEditable.tsx — Dashboard editable de planning anual
 *
 * Contexto:
 * - Dashboard completo para editar planning anual del plan de entrenamiento
 * - Muestra distribución de cualidades físicas, carga de entrenamiento, progresión mensual
 * - Basado en diseño Figma "Yearly Planning" pero con capacidades de edición
 * - Permite editar distribución y carga de entrenamiento
 *
 * Responsabilidades:
 * - Cargar datos anuales con useGetTrainingPlanYearlyPlanningQuery
 * - Renderizar PhysicalQualitiesPieChart y PhysicalQualitiesList (editable)
 * - Renderizar TrainingLoadSliders (editable)
 * - Renderizar ProgressionChart (yearly)
 * - Renderizar TrainingPlanSummaryCard
 * - Manejar edición y guardado de cambios
 * - Manejar estados: loading, error, saving, success
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
    useGetTrainingPlanYearlyPlanningQuery,
    useUpdatePlanningDistributionMutation,
    useUpdatePlanningLoadMutation,
} from "@nexia/shared/api/trainingPlansApi";
import type {
    PlanningDistributionItem,
    UpdatePlanningDistributionRequest,
    UpdatePlanningLoadRequest,
} from "@nexia/shared/types/trainingAnalytics";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/buttons";
import { ChartCard } from "@/components/ui/cards";
import { PhysicalQualitiesPieChart } from "./PhysicalQualitiesPieChart";
import { PhysicalQualitiesList } from "./PhysicalQualitiesList";
import { TrainingLoadSliders } from "./TrainingLoadSliders";
import { ProgressionChart } from "./ProgressionChart";

export interface YearlyPlanningDashboardEditableProps {
    planId: number;
    year?: number; // Default: current year
}

export const YearlyPlanningDashboardEditable: React.FC<
    YearlyPlanningDashboardEditableProps
> = ({ planId, year }) => {
    const currentYear = year || new Date().getFullYear();

    // Query para obtener datos
    const {
        data,
        isLoading,
        isError,
        error,
    } = useGetTrainingPlanYearlyPlanningQuery({
        planId,
        year: currentYear,
    });

    // Mutations para guardar cambios
    const [updateDistribution, { isLoading: isSavingDistribution }] =
        useUpdatePlanningDistributionMutation();
    const [updateLoad, { isLoading: isSavingLoad }] = useUpdatePlanningLoadMutation();

    // Estados locales para edición
    const [localDistribution, setLocalDistribution] = useState<PlanningDistributionItem[]>([]);
    const [localVolume, setLocalVolume] = useState<number>(0);
    const [localIntensity, setLocalIntensity] = useState<number>(0);
    const [selectedCycleIds, setSelectedCycleIds] = useState<number[]>([]);

    // Estados de feedback
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Sincronizar estados locales con datos del servidor
    useEffect(() => {
        if (data) {
            setLocalDistribution(data.distribution || []);
            setLocalVolume(data.training_load?.volume_level || 0);
            setLocalIntensity(data.training_load?.intensity_level || 0);
            // Seleccionar todos los cycle_ids de los macrocycles por defecto
            const allCycleIds = data.cycles?.map((cycle) => cycle.cycle_id) || [];
            setSelectedCycleIds(allCycleIds);
            setHasChanges(false);
        }
    }, [data]);

    // Auto-dismiss de mensajes
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 7000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    // Calcular total de distribución
    const distributionTotal = useMemo(() => {
        return localDistribution.reduce((sum, item) => sum + item.percentage, 0);
    }, [localDistribution]);

    // Validar que distribución suma 100%
    const isDistributionValid = Math.abs(distributionTotal - 100) < 0.01;

    // Handlers para cambios
    const handleDistributionUpdate = (updated: Array<{ name: string; percentage: number }>) => {
        // Preservar cycle_ids originales al actualizar
        const updatedWithCycleIds = updated.map((item) => {
            const existing = localDistribution.find((d) => d.name === item.name);
            return {
                name: item.name,
                percentage: item.percentage,
                cycle_ids: existing?.cycle_ids || [],
            };
        });
        setLocalDistribution(updatedWithCycleIds);
        setHasChanges(true);
    };

    const handleVolumeChange = (value: number) => {
        setLocalVolume(value);
        setHasChanges(true);
    };

    const handleIntensityChange = (value: number) => {
        setLocalIntensity(value);
        setHasChanges(true);
    };

    // Handler para guardar distribución
    const handleSaveDistribution = async () => {
        if (!isDistributionValid) {
            setErrorMessage("La distribución debe sumar exactamente 100%");
            return;
        }

        if (selectedCycleIds.length === 0) {
            setErrorMessage("Debes seleccionar al menos un ciclo para actualizar");
            return;
        }

        try {
            const updateRequest: UpdatePlanningDistributionRequest = {
                cycle_ids: selectedCycleIds,
                distribution: localDistribution.map((item) => ({
                    name: item.name,
                    percentage: item.percentage,
                })),
                cascade: true, // Por defecto aplicar cascada
            };

            await updateDistribution({ planId, data: updateRequest }).unwrap();
            setSuccessMessage("Distribución actualizada correctamente");
            setHasChanges(false);
        } catch (err) {
            console.error("Error updating distribution:", err);
            setErrorMessage(
                err && typeof err === "object" && "data" in err
                    ? String((err as { data: unknown }).data) || "Error al actualizar la distribución"
                    : "Error al actualizar la distribución"
            );
        }
    };

    // Handler para guardar carga de entrenamiento
    const handleSaveLoad = async () => {
        if (selectedCycleIds.length === 0) {
            setErrorMessage("Debes seleccionar al menos un ciclo para actualizar");
            return;
        }

        try {
            const updateRequest: UpdatePlanningLoadRequest = {
                cycle_ids: selectedCycleIds,
                physical_quality: null, // Opcional: filtrar por calidad
                volume: localVolume,
                intensity: localIntensity,
                cascade: true, // Por defecto aplicar cascada
            };

            await updateLoad({ planId, data: updateRequest }).unwrap();
            setSuccessMessage("Carga de entrenamiento actualizada correctamente");
            setHasChanges(false);
        } catch (err) {
            console.error("Error updating load:", err);
            setErrorMessage(
                err && typeof err === "object" && "data" in err
                    ? String((err as { data: unknown }).data) || "Error al actualizar la carga"
                    : "Error al actualizar la carga"
            );
        }
    };

    // Handler para cancelar cambios
    const handleCancel = () => {
        if (data) {
            setLocalDistribution(data.distribution || []);
            setLocalVolume(data.training_load?.volume_level || 0);
            setLocalIntensity(data.training_load?.intensity_level || 0);
            setHasChanges(false);
            setErrorMessage(null);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Error state
    if (isError) {
        const errorMessageText =
            error && typeof error === "object" && "data" in error
                ? String((error as { data: unknown }).data)
                : "Error al cargar los datos del planning anual";

        return (
            <div className="p-6">
                <Alert variant="error">{errorMessageText}</Alert>
            </div>
        );
    }

    // Empty state (no data)
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No hay datos de Planning Anual
                </h3>
                <p className="text-slate-500 max-w-md">
                    No se encontraron datos de planning anual para este plan en {currentYear}.
                </p>
            </div>
        );
    }

    // Convertir PlanningDistributionItem a TrainingPlanDistributionItem para el pie chart
    const qualitiesForChart = localDistribution.map((item) => ({
        name: item.name,
        percentage: item.percentage,
    }));

    return (
        <div className="space-y-8">
            {/* Mensajes de feedback */}
            {successMessage && (
                <Alert variant="success" onDismiss={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            )}

            {errorMessage && (
                <Alert variant="error" onDismiss={() => setErrorMessage(null)}>
                    {errorMessage}
                </Alert>
            )}

            {/* CONTENEDOR ÚNICO - Agrupa subtítulo + 3 secciones superiores */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Subtítulo grande y en negrita + Fecha (DENTRO del contenedor) */}
                <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Planning Anual
                    </h2>
                    <span className="text-sm text-slate-500">{currentYear}</span>
                </div>

                {/* 3 secciones: Distribution + Physical Qualities + Training Load */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-10 p-6">
                    {/* Distribution Pie Chart (3/10) */}
                    <div className="lg:col-span-3 space-y-3 flex flex-col">
                        <h3 className="text-sm font-bold text-gray-700 tracking-wide pb-2">
                            Distribución
                        </h3>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-full max-w-[300px]">
                                <PhysicalQualitiesPieChart qualities={qualitiesForChart} />
                            </div>
                        </div>
                    </div>

                    {/* Physical Qualities List (3/10) - EDITABLE */}
                    <div className="lg:col-span-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-700 tracking-wide pb-2">
                                Cualidades Físicas
                            </h3>
                            {hasChanges && (
                                <span className="text-xs text-amber-600 font-medium">
                                    Cambios sin guardar
                                </span>
                            )}
                        </div>
                        <PhysicalQualitiesList
                            qualities={localDistribution.map((item) => ({
                                name: item.name,
                                percentage: item.percentage,
                            }))}
                            editable={true}
                            onUpdate={handleDistributionUpdate}
                        />
                        {!isDistributionValid && (
                            <p className="text-xs text-red-600 mt-1">
                                El total debe ser exactamente 100% (actual: {distributionTotal.toFixed(1)}%)
                            </p>
                        )}
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSaveDistribution}
                                disabled={!isDistributionValid || isSavingDistribution || !hasChanges}
                                isLoading={isSavingDistribution}
                                className="flex-1"
                            >
                                Guardar Distribución
                            </Button>
                            {hasChanges && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    disabled={isSavingDistribution}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Training Load Sliders (4/10) - EDITABLE */}
                    <div className="lg:col-span-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-700 tracking-wide pb-2">
                                Carga de Entrenamiento
                            </h3>
                            {hasChanges && (
                                <span className="text-xs text-amber-600 font-medium">
                                    Cambios sin guardar
                                </span>
                            )}
                        </div>
                        <TrainingLoadSliders
                            volumeLevel={localVolume}
                            intensityLevel={localIntensity}
                            readOnly={false}
                            showTitle={false}
                            onVolumeChange={handleVolumeChange}
                            onIntensityChange={handleIntensityChange}
                        />
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSaveLoad}
                                disabled={isSavingLoad || !hasChanges}
                                isLoading={isSavingLoad}
                                className="flex-1"
                            >
                                Guardar Carga
                            </Button>
                            {hasChanges && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    disabled={isSavingLoad}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progression Chart */}
            <ChartCard title="Progresión Anual">
                {data.monthly_progression && data.monthly_progression.length > 0 ? (
                    <ProgressionChart
                        data={data.monthly_progression as unknown as Array<{
                            month: number;
                            qualities: Array<{ name: string; percentage: number }>;
                            volume_level: number;
                            intensity_level: number;
                        }>}
                        type="yearly"
                        height={300}
                    />
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-slate-500">
                        No hay datos de progresión anual disponibles
                    </div>
                )}
            </ChartCard>

            {/* Summary Card - Mostrar info básica del plan */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                            Nombre del Plan
                        </span>
                        <p className="text-gray-900 font-medium mt-1">{data.plan_name}</p>
                    </div>
                    <div>
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                            Año
                        </span>
                        <p className="text-gray-900 font-medium mt-1">{data.year}</p>
                    </div>
                    <div>
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                            Ciclos Totales
                        </span>
                        <p className="text-gray-900 font-medium mt-1">
                            {data.cycles?.length || 0} macrociclos
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

